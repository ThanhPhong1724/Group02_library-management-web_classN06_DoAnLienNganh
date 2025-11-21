"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  Search, 
  User, 
  Tag, 
  BookOpen, 
  MapPin, 
  ArrowLeft,
  Filter,
  SortAsc,
  SortDesc,
  Globe
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';

// Types
interface Book {
  id: number;
  title: string;
  author: string;
  language: string;
  category: string;
  available_copies: number;
  total_copies: number;
  locations: string[];
}

interface SearchResult {
  items: Book[];
  total: number;
  page: number;
  total_pages: number;
}

interface Category {
  id: string;
  name: string;
  book_count: number;
}

// Real API adapters based on API spec
const fetchBooksByAuthor = async (author: string, page: number = 1): Promise<SearchResult> => {
  const response = await fetch(`/api/books?search=${encodeURIComponent(author)}&page=${page}&limit=20`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tìm kiếm sách theo tác giả');
  }

  const data = await response.json();
  return {
    items: data.items?.map((book: Book) => ({
      id: book.id,
      title: book.title || '',
      author: book.author || '',
      language: book.language || '',
      category: book.category || '',
      available_copies: book.available_copies,
      total_copies: book.total_copies,
      locations: book.locations || []
    })) || [],
    total: data.total || 0,
    page: data.page || page,
    total_pages: Math.ceil((data.total || 0) / 20)
  };
};

const fetchBooksByCategory = async (category: string, page: number = 1): Promise<SearchResult> => {
  const response = await fetch(`/api/books?subjects=${encodeURIComponent(category)}&page=${page}&limit=20`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tìm kiếm sách theo thể loại');
  }

  const data = await response.json();
  return {
    items: data.items?.map((book: Book) => ({
      id: book.id,
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      available_copies: book.available_copies,
      total_copies: book.total_copies,
      locations: book.locations || []
    })) || [],
    total: data.total || 0,
    page: data.page || page,
    total_pages: Math.ceil((data.total || 0) / 20)
  };
};

const fetchCategories = async (): Promise<Category[]> => {
  // Note: API spec doesn't show a categories endpoint
  // For now, we'll return mock categories
  return [
    { id: "ky-nang-song", name: "Kỹ năng sống", book_count: 45 },
    { id: "van-hoc", name: "Văn học", book_count: 120 },
    { id: "kinh-te", name: "Kinh tế", book_count: 78 },
    { id: "lich-su", name: "Lịch sử", book_count: 56 },
    { id: "khoa-hoc", name: "Khoa học", book_count: 89 },
    { id: "cong-nghe", name: "Công nghệ", book_count: 67 },
    { id: "giao-duc", name: "Giáo dục", book_count: 34 },
    { id: "y-te", name: "Y tế", book_count: 23 },
    { id: "the-thao", name: "Thể thao", book_count: 12 },
    { id: "am-nhac", name: "Âm nhạc", book_count: 18 }
  ];
};

// Book card component
const BookCard = ({ book, onClick }: { book: Book; onClick: () => void }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-muted-foreground text-sm">Tác giả: {book.author}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {book.category}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Còn {book.available_copies}/{book.total_copies}
              </Badge>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center text-xs text-muted-foreground">
                <Globe className="w-3 h-3 mr-1" />
                {book.language}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {book.locations[0]}
                {book.locations.length > 1 && ` +${book.locations.length - 1} vị trí khác`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get initial values from URL params
  const initialType = searchParams.get('type') || 'author';
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || '';
  
  const [activeTab, setActiveTab] = useState<'author' | 'category'>(initialType as 'author' | 'category');
  const [authorQuery, setAuthorQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error) {
        toast.error("Không thể tải danh sách thể loại");
      }
    };
    loadCategories();
  }, []);

  // Search function
  const performSearch = async (page: number = 1) => {
    if (activeTab === 'author' && !authorQuery.trim()) {
      toast.error("Vui lòng nhập tên tác giả");
      return;
    }
    
    if (activeTab === 'category' && !selectedCategory) {
      toast.error("Vui lòng chọn thể loại");
      return;
    }

    setLoading(true);
    try {
      let results: SearchResult;
      
      if (activeTab === 'author') {
        results = await fetchBooksByAuthor(authorQuery.trim(), page);
      } else {
        results = await fetchBooksByCategory(selectedCategory, page);
      }
      
      setSearchResults(results);
      setCurrentPage(page);
      
      // Update URL
      const params = new URLSearchParams();
      params.set('type', activeTab);
      if (activeTab === 'author') {
        params.set('q', authorQuery.trim());
      } else {
        params.set('category', selectedCategory);
      }
      if (page > 1) params.set('page', page.toString());
      
      router.push(`/search?${params.toString()}`, { scroll: false });
      
    } catch (error) {
      toast.error("Không thể tìm kiếm. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'author' | 'category');
    setSearchResults(null);
    setCurrentPage(1);
    
    // Update URL
    const params = new URLSearchParams();
    params.set('type', value);
    router.push(`/search?${params.toString()}`, { scroll: false });
  };

  // Handle search
  const handleSearch = () => {
    performSearch(1);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category) {
      performSearch(1);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    performSearch(page);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Tìm kiếm sách</h1>
            <p className="text-muted-foreground">
              Tìm kiếm sách theo tác giả hoặc thể loại
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="author" className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Theo tác giả
              </TabsTrigger>
              <TabsTrigger value="category" className="flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                Theo thể loại
              </TabsTrigger>
            </TabsList>

            <TabsContent value="author" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tìm kiếm theo tác giả</CardTitle>
                  <CardDescription>
                    Nhập tên tác giả để tìm tất cả sách của họ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Nhập tên tác giả..."
                        value={authorQuery}
                        onChange={(e) => setAuthorQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="h-10"
                      />
                    </div>
                    <Button onClick={handleSearch} disabled={loading || !authorQuery.trim()}>
                      <Search className="w-4 h-4 mr-2" />
                      Tìm kiếm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="category" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tìm kiếm theo thể loại</CardTitle>
                  <CardDescription>
                    Chọn thể loại để xem tất cả sách trong danh mục đó
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Chọn thể loại..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{category.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {category.book_count}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Search Results */}
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="h-full">
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex space-x-2 mb-3">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && searchResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    Kết quả tìm kiếm
                  </h2>
                  <p className="text-muted-foreground">
                    Tìm thấy {searchResults.total} cuốn sách
                    {activeTab === 'author' && authorQuery && ` của tác giả "${authorQuery}"`}
                    {activeTab === 'category' && selectedCategory && ` trong thể loại "${categories.find(c => c.id === selectedCategory)?.name}"`}
                  </p>
                </div>
              </div>

              {/* Results Grid */}
              {searchResults.items.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {searchResults.items.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onClick={() => router.push(`/books/${book.id}`)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {searchResults.total_pages > 1 && (
                    <div className="flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: Math.min(5, searchResults.total_pages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => handlePageChange(page)}
                                  isActive={page === currentPage}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          {searchResults.total_pages > 5 && (
                            <>
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => handlePageChange(searchResults.total_pages)}
                                  className="cursor-pointer"
                                >
                                  {searchResults.total_pages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage >= searchResults.total_pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Không tìm thấy sách</h3>
                    <p className="text-muted-foreground mb-4">
                      {activeTab === 'author' 
                        ? `Không có sách nào của tác giả "${authorQuery}"`
                        : `Không có sách nào trong thể loại "${categories.find(c => c.id === selectedCategory)?.name}"`
                      }
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSearchResults(null);
                        if (activeTab === 'author') setAuthorQuery('');
                        if (activeTab === 'category') setSelectedCategory('');
                      }}
                    >
                      Thử tìm kiếm khác
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Empty State */}
          {!loading && !searchResults && (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Bắt đầu tìm kiếm</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'author' 
                    ? 'Nhập tên tác giả để tìm kiếm sách'
                    : 'Chọn thể loại để xem danh sách sách'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DefaultLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <DefaultLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </DefaultLayout>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
