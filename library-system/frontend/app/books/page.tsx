"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  Search, 
  Filter,
  BookOpen, 
  MapPin, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Grid3X3,
  List
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';

// Types
interface Book {
  id: number;
  title: string;
  authors: string;
  publisher?: string;
  pub_year?: number;
  cover_price?: number;
  currency?: string;
  quantity_total: number;
  quantity_avail: number;
  primary_image_url?: string;
  subjects?: string;
  language?: string;
}

interface SearchFilters {
  category: string;
  language: string;
  publisher: string;
  year_from: string;
  year_to: string;
}

interface SearchResult {
  items: Book[];
  total: number;
  page: number;
  total_pages: number;
}

// Real API adapters based on API spec
const fetchBooks = async (params: {
  query: string;
  filters: SearchFilters;
  page: number;
}): Promise<SearchResult> => {
  const searchParams = new URLSearchParams();
  
  if (params.query) {
    searchParams.append('search', params.query);
  }
  if (params.filters.category && params.filters.category !== 'all') {
    searchParams.append('subjects', params.filters.category);
  }
  if (params.filters.language && params.filters.language !== 'all') {
    searchParams.append('language', params.filters.language);
  }
  if (params.filters.publisher) {
    searchParams.append('publisher', params.filters.publisher);
  }
  if (params.filters.year_from && params.filters.year_from !== 'all') {
    searchParams.append('year_from', params.filters.year_from);
  }
  if (params.filters.year_to && params.filters.year_to !== 'all') {
    searchParams.append('year_to', params.filters.year_to);
  }
  
  searchParams.append('page', params.page.toString());
  searchParams.append('limit', '20');

  const response = await fetch(`/api/books?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách sách');
  }

  const data = await response.json();
  return {
    items: data.items || [],
    total: data.total || 0,
    page: data.page || params.page,
    total_pages: Math.ceil((data.total || 0) / 20)
  };
};

// Mock categories (since API doesn't have categories endpoint)
const categories = [
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

const languages = [
  { id: "vi", name: "Tiếng Việt" },
  { id: "en", name: "Tiếng Anh" },
  { id: "fr", name: "Tiếng Pháp" },
  { id: "de", name: "Tiếng Đức" },
  { id: "ja", name: "Tiếng Nhật" },
  { id: "ko", name: "Tiếng Hàn" },
  { id: "zh", name: "Tiếng Trung" }
];

const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

// Status badge component
const StatusBadge = ({ available, total }: { available: number; total: number }) => {
  const percentage = total > 0 ? (available / total) * 100 : 0;
  
  if (percentage === 0) {
    return (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Hết sách
      </Badge>
    );
  } else if (percentage < 30) {
    return (
      <Badge className="bg-orange-100 text-orange-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Ít sách
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Có sách
      </Badge>
    );
  }
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
        <CardHeader className="pb-3">
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-muted">
            {book.primary_image_url ? (
              <img
                src={book.primary_image_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-16 h-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2 mb-1" title={book.title}>
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {book.authors}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Nhà xuất bản:</span>
              <span className="font-medium">{book.publisher || 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Năm:</span>
              <span className="font-medium">{book.pub_year || 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Số lượng:</span>
              <span className="font-medium">{book.quantity_avail}/{book.quantity_total}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <StatusBadge available={book.quantity_avail} total={book.quantity_total} />
            <Button size="sm" variant="outline" className="h-7 px-2">
              <Eye className="w-3 h-3 mr-1" />
              Xem
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Loading skeleton
const BookSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="aspect-[3/4] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    category: 'all',
    language: 'all',
    publisher: '',
    year_from: 'all',
    year_to: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        const result = await fetchBooks({
          query: searchQuery,
          filters,
          page: currentPage
        });
        if (currentPage === 1) {
          setBooks(result.items);
        } else {
          setBooks(prev => [...prev, ...result.items]);
        }
        setTotalPages(result.total_pages);
        setTotalBooks(result.total);
      } catch (error) {
        toast.error('Không thể tải danh sách sách');
        console.error('Error loading books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, [searchQuery, filters, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setBooks([]);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setBooks([]);
  };

  const handleBookClick = (bookId: number) => {
    router.push(`/books/${bookId}`);
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      language: 'all',
      publisher: '',
      year_from: 'all',
      year_to: 'all'
    });
    setCurrentPage(1);
    setBooks([]);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh mục sách</h1>
            <p className="text-gray-600">
              Khám phá kho tàng sách phong phú của thư viện
            </p>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm và lọc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                {/* Search Bar */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-category" value="all">Tất cả thể loại</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} ({category.book_count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.language} onValueChange={(value) => handleFilterChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-language" value="all">Tất cả ngôn ngữ</SelectItem>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Nhà xuất bản"
                    value={filters.publisher}
                    onChange={(e) => handleFilterChange('publisher', e.target.value)}
                  />

                  <Select value={filters.year_from} onValueChange={(value) => handleFilterChange('year_from', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Năm từ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.year_to} onValueChange={(value) => handleFilterChange('year_to', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Năm đến" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    disabled={isLoading}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Xóa bộ lọc
                  </Button>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Chế độ xem:</span>
                    <Button
                      type="button"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Hiển thị {books.length} sách trong tổng số {totalBooks} sách
            </p>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
              </span>
            </div>
          </div>

          {/* Books Grid/List */}
          {isLoading ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {Array.from({ length: 20 }).map((_, i) => (
                <BookSkeleton key={i} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy sách</h3>
                <p className="text-muted-foreground mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
                : 'grid-cols-1'
            }`}>
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onClick={() => handleBookClick(book.id)}
                />
              ))}
            </div>
          )}

          {/* Xem thêm */}
          {!isLoading && books.length < totalBooks && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
