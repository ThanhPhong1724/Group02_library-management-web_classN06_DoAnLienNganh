"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  BookOpen, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  MapPin,
  Calendar
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Types
// 1. Định nghĩa lại interface Book đúng với schema
interface Book {
  id: number;
  title: string;
  authors: string;
  publisher?: string;
  pub_year?: number;
  language?: string;
  subjects?: string;
  description?: string;
  cover_price?: number;
  currency?: string;
  quantity_total: number;
  quantity_avail: number;
  primary_image_url?: string;
}

interface BookFilters {
  subjects: string;
  language: string;
  publisher: string;
  search: string;
}

interface BooksResponse {
  items: Book[];
  total: number;
  page: number;
  total_pages: number;
}

// Real API adapters
// 2. Xây dựng lại fetchBooks chỉ dùng API thật
const fetchBooks = async (params: {
  filters: Partial<Book> & { search?: string };
  page: number;
  limit: number;
}): Promise<{ items: Book[]; total: number; page: number; total_pages: number }> => {
  const searchParams = new URLSearchParams();
  if (params.filters.search) searchParams.append('search', params.filters.search);
  if (params.filters.subjects) searchParams.append('subjects', params.filters.subjects);
  if (params.filters.language) searchParams.append('language', params.filters.language);
  if (params.filters.publisher) searchParams.append('publisher', params.filters.publisher);
  if (params.filters.pub_year) searchParams.append('pub_year', String(params.filters.pub_year));
  searchParams.append('page', String(params.page));
  searchParams.append('limit', String(params.limit));
  const res = await fetch(`/api/books?${searchParams.toString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
  if (!res.ok) throw new Error('Không thể tải danh sách sách');
  const data = await res.json();
  return {
    items: data.items || [],
    total: data.total || 0,
    page: data.page || params.page,
    total_pages: Math.ceil((data.total || 0) / params.limit)
  };
};

// Mock data fallback
const getMockBooks = (params: { filters: BookFilters; page: number; limit: number }): BooksResponse => {
  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'Đắc Nhân Tâm',
      authors: 'Dale Carnegie',
      publisher: 'NXB Tổng hợp TP.HCM',
      pub_year: 2018,
      cover_price: 120000,
      currency: 'VND',
      quantity_total: 15,
      quantity_avail: 8,
      primary_image_url: 'https://example.com/dac-nhan-tam.jpg',
      subjects: 'Kỹ năng sống',
      language: 'vi',
      description: 'Cuốn sách về nghệ thuật đối nhân xử thế và kỹ năng giao tiếp',
    },
    {
      id: 2,
      title: 'Nhà Giả Kim',
      authors: 'Paulo Coelho',
      publisher: 'NXB Văn học',
      pub_year: 2019,
      cover_price: 98000,
      currency: 'VND',
      quantity_total: 12,
      quantity_avail: 5,
      primary_image_url: 'https://example.com/nha-gia-kim.jpg',
      subjects: 'Văn học',
      language: 'vi',
      description: 'Tiểu thuyết về hành trình tìm kiếm kho báu và ý nghĩa cuộc sống',
    },
    {
      id: 3,
      title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
      authors: 'Rosie Nguyễn',
      publisher: 'NXB Hội Nhà văn',
      pub_year: 2020,
      cover_price: 150000,
      currency: 'VND',
      quantity_total: 20,
      quantity_avail: 12,
      primary_image_url: 'https://example.com/tuoi-tre.jpg',
      subjects: 'Kỹ năng sống',
      language: 'vi',
      description: 'Sách về cách sống và phát triển bản thân trong tuổi trẻ',
    },
    {
      id: 4,
      title: 'Sapiens: Lược Sử Loài Người',
      authors: 'Yuval Noah Harari',
      publisher: 'NXB Thế giới',
      pub_year: 2021,
      cover_price: 280000,
      currency: 'VND',
      quantity_total: 8,
      quantity_avail: 3,
      primary_image_url: 'https://example.com/sapiens.jpg',
      subjects: 'Khoa học',
      language: 'vi',
      description: 'Khám phá lịch sử phát triển của loài người từ thời cổ đại',
    },
    {
      id: 5,
      title: 'Atomic Habits',
      authors: 'James Clear',
      publisher: 'NXB Lao động',
      pub_year: 2022,
      cover_price: 180000,
      currency: 'VND',
      quantity_total: 10,
      quantity_avail: 6,
      primary_image_url: 'https://example.com/atomic-habits.jpg',
      subjects: 'Kỹ năng sống',
      language: 'vi',
      description: 'Phương pháp xây dựng thói quen nhỏ để thay đổi cuộc sống',
    },
    {
      id: 6,
      title: 'The Power of Now',
      authors: 'Eckhart Tolle',
      publisher: 'NXB Tôn giáo',
      pub_year: 2023,
      cover_price: 160000,
      currency: 'VND',
      quantity_total: 6,
      quantity_avail: 0,
      primary_image_url: 'https://example.com/power-of-now.jpg',
      subjects: 'Tâm linh',
      language: 'en',
      description: 'Hướng dẫn sống trong hiện tại và tìm kiếm sự bình yên nội tâm',
    }
  ];

  // Apply filters
  let filteredBooks = mockBooks;
  
  if (params.filters.search) {
    const searchLower = params.filters.search.toLowerCase();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.authors.toLowerCase().includes(searchLower) ||
      book.description?.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.filters.subjects && params.filters.subjects !== 'all') {
    filteredBooks = filteredBooks.filter(book => book.subjects === params.filters.subjects);
  }
  
  if (params.filters.language && params.filters.language !== 'all') {
    filteredBooks = filteredBooks.filter(book => book.language === params.filters.language);
  }
  
  if (params.filters.publisher && params.filters.publisher !== 'all') {
    filteredBooks = filteredBooks.filter(book => 
      book.publisher?.toLowerCase().includes(params.filters.publisher.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const items = filteredBooks.slice(startIndex, endIndex);

  return {
    items,
    total: filteredBooks.length,
    page: params.page,
    total_pages: Math.ceil(filteredBooks.length / params.limit)
  };
};

// Book Card Component
const BookCard = ({ book, onEdit, onDelete, onView }: {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onView: (book: Book) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2" title={book.title}>
                {book.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {book.subjects}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onView(book)}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onEdit(book)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(book)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Tác giả:</span>
            <span className="font-medium">{book.authors}</span>
          </div>
          
          {book.publisher && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">NXB:</span>
              <span className="font-medium">{book.publisher}</span>
            </div>
          )}
          
          {book.pub_year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Năm:</span>
              <span className="font-medium">{book.pub_year}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Copy className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Số lượng:</span>
              <span className="font-medium">{book.quantity_avail}/{book.quantity_total}</span>
            </div>
          </div>
          
          {book.description && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              {book.description}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{book.language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Loading skeleton
const BookSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<BookFilters>({
    subjects: 'all',
    language: 'all',
    publisher: 'all', // Đổi từ '' sang 'all'
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  // Thêm state động cho filter
  const [subjects, setSubjects] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [publishers, setPublishers] = useState<string[]>([]);
  const itemsPerPage = 12;
  const [showDialog, setShowDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    authors: '',
    publisher_id: '',
    pub_year: '',
    language: '',
    subjects: '',
    description: '',
    cover_price: '',
    currency: 'VND',
    image_url: '', // Thêm trường ảnh
  });

  // Fetch publishers with id for select
  const [publishersList, setPublishersList] = useState<{id:number, name:string}[]>([]);
  useEffect(() => {
    fetch('/api/publishers?page=1&limit=100')
      .then(r => r.json())
      .then(data => setPublishersList(Array.isArray(data) ? data : []));
  }, []);

  const openAddDialog = () => {
    setEditingBook(null);
    setForm({
      title: '', authors: '', publisher_id: '', pub_year: '', language: '', subjects: '', description: '', cover_price: '', currency: 'VND', image_url: '',
    });
    setShowDialog(true);
  };
  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setForm({
      title: book.title || '',
      authors: book.authors || '',
      publisher_id: publishersList.find(p => p.name === book.publisher)?.id || '',
      pub_year: book.pub_year || '',
      language: book.language || '',
      subjects: book.subjects || '',
      description: book.description || '',
      cover_price: book.cover_price || '',
      currency: book.currency || 'VND',
      image_url: book.primary_image_url || '',
    });
    setShowDialog(true);
  };
  const closeDialog = () => {
    setShowDialog(false);
    setEditingBook(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...form,
        pub_year: form.pub_year ? Number(form.pub_year) : undefined,
        cover_price: form.cover_price ? Number(form.cover_price) : undefined,
        publisher_id: form.publisher_id ? Number(form.publisher_id) : undefined,
      };
      delete payload.image_url; // Không gửi image_url vào books API
      let res;
      let bookId = editingBook?.id;
      if (editingBook) {
        res = await fetch(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/books', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          bookId = data.id;
        }
      }
      if (!res.ok) throw new Error('Lưu sách thất bại');
      // Nếu có nhập link ảnh, gọi API thêm/cập nhật ảnh
      if (form.image_url && bookId) {
        await fetch(`/api/books/${bookId}/images`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
          },
          body: JSON.stringify({ image_url: form.image_url, is_primary: true, sort_order: 0 }),
        });
      }
      toast.success(editingBook ? 'Cập nhật sách thành công' : 'Thêm sách thành công');
      setShowDialog(false);
      setEditingBook(null);
      setFilters(f => ({ ...f }));
    } catch (err) {
      toast.error('Có lỗi khi lưu sách');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (book: Book) => {
    openEditDialog(book);
  };
  const handleAddBook = () => {
    openAddDialog();
  };

  // Fetch filter data động
  useEffect(() => {
    fetch('/api/books/subjects')
      .then(r => r.json())
      .then(data => setSubjects(Array.isArray(data) ? data.filter((v) => typeof v === 'string' && v.trim().length > 0) : []));
    fetch('/api/books/languages')
      .then(r => r.json())
      .then(data => setLanguages(Array.isArray(data) ? data.filter((v) => typeof v === 'string' && v.trim().length > 0) : []));
    fetch('/api/books/publishers')
      .then(r => r.json())
      .then(data => setPublishers(Array.isArray(data) ? data.filter((v) => typeof v === 'string' && v.trim().length > 0) : []));
  }, []);

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setIsLoading(true);
        const result = await fetchBooks({
          filters,
          page: currentPage,
          limit: 12
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
    // eslint-disable-next-line
  }, [filters, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Thay đổi: bỏ phân trang số, thêm nút Xem thêm
  {!isLoading && books.length < totalBooks && (
    <div className="flex justify-center mt-6">
      <Button onClick={() => setCurrentPage(prev => prev + 1)}>
        Xem thêm
      </Button>
    </div>
  )}

  const handleFilterChange = (key: keyof BookFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setBooks([]);
  };

  const clearFilters = () => {
    setFilters({
      subjects: 'all',
      language: 'all',
      publisher: 'all', // Đổi từ '' sang 'all'
      search: ''
    });
    setCurrentPage(1);
  };

  const handleDelete = async (book: Book) => {
    if (!confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) return;
    try {
      const res = await fetch(`/api/books/${book.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
      });
      if (!res.ok) throw new Error('Xóa sách thất bại');
      toast.success('Đã xóa sách thành công');
      // Reload list
      setFilters(f => ({ ...f }));
    } catch (err) {
      toast.error('Có lỗi khi xóa sách');
    }
  };

  const handleView = (book: Book) => {
    toast.info(`Xem chi tiết: ${book.title}`);
    // TODO: Open view modal
  };

  // Get unique values for filters
  // const subjects = [
  //   'Kỹ năng sống', 'Văn học', 'Khoa học', 'Kinh tế', 'Lịch sử', 
  //   'Công nghệ', 'Giáo dục', 'Y tế', 'Thể thao', 'Âm nhạc', 'Tâm linh'
  // ];
  // const languages = [
  //   { value: 'vi', label: 'Tiếng Việt' },
  //   { value: 'en', label: 'Tiếng Anh' },
  //   { value: 'fr', label: 'Tiếng Pháp' },
  //   { value: 'de', label: 'Tiếng Đức' }
  // ];
  // const statuses = [
  //   { value: 'active', label: 'Hoạt động' },
  //   { value: 'inactive', label: 'Không hoạt động' },
  //   { value: 'archived', label: 'Lưu trữ' }
  // ];

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sách</h1>
              <p className="text-gray-600">
                Quản lý thông tin, số lượng và trạng thái của tất cả sách trong thư viện
              </p>
            </div>
            <Button onClick={handleAddBook} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm sách mới
            </Button>
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
                      placeholder="Tìm kiếm theo tên sách, tác giả, mô tả..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select value={filters.subjects} onValueChange={(value) => handleFilterChange('subjects', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thể loại</SelectItem>
                      {subjects.map((subject) =>
                        typeof subject === 'string' && subject.trim().length > 0 ? (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>

                  <Select value={filters.language} onValueChange={(value) => handleFilterChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ngôn ngữ</SelectItem>
                      {languages.map((lang) =>
                        typeof lang === 'string' && lang.trim().length > 0 ? (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ) : null
                      )}
                    </SelectContent>
                  </Select>

                  <Select value={filters.publisher} onValueChange={(value) => handleFilterChange('publisher', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Nhà xuất bản" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả NXB</SelectItem> {/* Đổi từ value="" sang value="all" */}
                      {publishers.map((pub) =>
                        typeof pub === 'string' && pub.trim().length > 0 ? (
                          <SelectItem key={pub} value={pub}>{pub}</SelectItem>
                        ) : null
                      )}
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

                  <div className="text-sm text-muted-foreground">
                    Tìm thấy {totalBooks} sách
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Books Table */}
          {isLoading ? (
            <div className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>NXB</TableHead>
                    <TableHead>Năm XB</TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead>Ngôn ngữ</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>NXB</TableHead>
                    <TableHead>Năm XB</TableHead>
                    <TableHead>Thể loại</TableHead>
                    <TableHead>Ngôn ngữ</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell>
                        {book.primary_image_url ? (
                          <img src={book.primary_image_url} alt={book.title} className="h-16 w-12 object-cover rounded" />
                        ) : (
                          <div className="h-16 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold max-w-[200px] truncate" title={book.title}>{book.title}</TableCell>
                      <TableCell className="max-w-[160px] truncate" title={book.authors}>{book.authors}</TableCell>
                      <TableCell className="max-w-[120px] truncate" title={book.publisher}>{book.publisher}</TableCell>
                      <TableCell>{book.pub_year || ''}</TableCell>
                      <TableCell className="max-w-[120px] truncate" title={book.subjects}>{book.subjects && book.subjects.trim() ? book.subjects : '—'}</TableCell>
                      <TableCell>{book.language && book.language.trim() ? book.language : '—'}</TableCell>
                      <TableCell>{book.quantity_avail}/{book.quantity_total}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(book)} className="mr-2"><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(book)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {/* Không còn hiển thị số trang, <, >, ... nữa. */}
          {/* Nếu đã hết dữ liệu thì ẩn nút 'Xem thêm'. */}
          {!isLoading && books.length < totalBooks && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Form Thêm/Sửa */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label>Tiêu đề *</Label>
              <Input name="title" value={form.title} onChange={handleFormChange} required disabled={formLoading} />
            </div>
            <div>
              <Label>Tác giả *</Label>
              <Input name="authors" value={form.authors} onChange={handleFormChange} required disabled={formLoading} />
            </div>
            <div>
              <Label>Nhà xuất bản *</Label>
              <select name="publisher_id" value={form.publisher_id} onChange={handleFormChange} required disabled={formLoading} className="w-full border rounded px-2 py-2">
                <option value="">Chọn NXB</option>
                {publishersList.map(pub => <option key={pub.id} value={pub.id}>{pub.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Năm XB</Label>
                <Input name="pub_year" value={form.pub_year} onChange={handleFormChange} type="number" min="0" disabled={formLoading} />
              </div>
              <div>
                <Label>Ngôn ngữ</Label>
                <Input name="language" value={form.language} onChange={handleFormChange} disabled={formLoading} />
              </div>
            </div>
            <div>
              <Label>Thể loại</Label>
              <Input name="subjects" value={form.subjects} onChange={handleFormChange} disabled={formLoading} />
            </div>
            <div>
              <Label>Link ảnh (URL)</Label>
              <Input name="image_url" value={form.image_url} onChange={handleFormChange} disabled={formLoading} placeholder="https://..." />
            </div>
            <div>
              <Label>Giá bìa</Label>
              <Input name="cover_price" value={form.cover_price} onChange={handleFormChange} type="number" min="0" disabled={formLoading} />
            </div>
            <div>
              <Label>Đơn vị tiền tệ</Label>
              <Input name="currency" value={form.currency} onChange={handleFormChange} disabled={formLoading} />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea name="description" value={form.description} onChange={handleFormChange} disabled={formLoading} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={formLoading}>{formLoading ? 'Đang lưu...' : (editingBook ? 'Cập nhật' : 'Thêm mới')}</Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading}>Hủy</Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
