"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  User, 
  Globe, 
  Tag, 
  MapPin, 
  ArrowLeft,
  Copy as CopyIcon,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

// Types
interface Book {
  id: number;
  title: string;
  author: string;
  language: string;
  category: string;
  total_copies: number;
  available_copies: number;
  description?: string;
  published_year?: number;
  isbn?: string;
  locations: BookLocation[];
  images: BookImage[];
  publisher: string;
  cover_price: number;
  currency: string;
}

interface BookImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface BookLocation {
  id: number;
  shelf_code: string;
  room: string;
  shelf: string;
  row: number;
  column: number;
  status: 'available' | 'on_loan' | 'reserved' | 'lost' | 'maintenance';
}

interface BookCopy {
  id: number;
  shelf_code: string;
  room: string;
  shelf: string;
  row: number;
  column: number;
  status: 'available' | 'on_loan' | 'reserved' | 'lost' | 'maintenance';
  loan_due_date?: string;
  borrower_name?: string;
}

interface RelatedBook {
  id: number;
  title: string;
  author: string;
  available_copies: number;
  total_copies: number;
}

interface Loan {
  id: number;
  copy_id: number; // Thêm trường này để đúng với backend và fix linter
  status: 'requested' | 'borrowed' | 'return_requested';
  loan_due_date?: string;
  borrower_name?: string;
}

// Real API adapters based on API spec
const fetchBookDetail = async (id: string): Promise<Book> => {
  const response = await fetch(`/api/books/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin sách');
  }

  const data = await response.json();
  const book = data.book;
  
  return {
    id: book.id,
    title: book.title || '',
    author: book.authors || '',
    language: book.language || '',
    category: book.subjects || '',
    total_copies: book.quantity_total || 0,
    available_copies: book.quantity_avail || 0,
    description: book.description || '',
    published_year: book.pub_year,
    isbn: book.isbn || '',
    locations: data.copies?.map((copy: any) => ({
      id: copy.id,
      shelf_code: copy.location?.code || '',
      room: copy.location?.room || '',
      shelf: copy.location?.shelf || '',
      row: copy.location?.row || '',
      column: copy.location?.col || '',
      status: copy.status
    })) || [],
    images: data.images?.map((img: any) => ({
      id: img.id,
      image_url: img.image_url,
      is_primary: img.is_primary,
      sort_order: img.sort_order
    })) || [],
    publisher: book.publisher || '',
    cover_price: book.cover_price || 0,
    currency: book.currency || 'VND'
  };
};

const fetchBookCopies = async (bookId: string): Promise<BookCopy[]> => {
  const response = await fetch(`/api/books/${bookId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin bản sao');
  }

  const data = await response.json();
  return data.copies?.map((copy: any) => ({
    id: copy.id,
    shelf_code: copy.location?.code || '',
    room: copy.location?.room || '',
    shelf: copy.location?.shelf || '',
    row: copy.location?.row || '',
    column: copy.location?.col || '',
    status: copy.status,
    loan_due_date: copy.loan_due_date,
    borrower_name: copy.borrower_name
  })) || [];
};

const fetchRelatedBooks = async (bookId: string, category: string): Promise<RelatedBook[]> => {
  const response = await fetch(`/api/books?subjects=${encodeURIComponent(category)}&limit=4`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.items?.map((book: RelatedBook) => ({
    id: book.id,
    title: book.title || '',
    author: book.author || '',
    available_copies: book.available_copies,
    total_copies: book.total_copies
  })) || [];
};


// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    available: { label: "Có sẵn", icon: CheckCircle, className: "bg-green-100 text-green-800" },
    on_loan: { label: "Đang mượn", icon: Clock, className: "bg-blue-100 text-blue-800" },
    reserved: { label: "Đã đặt", icon: AlertCircle, className: "bg-yellow-100 text-yellow-800" },
    lost: { label: "Mất", icon: XCircle, className: "bg-red-100 text-red-800" },
    maintenance: { label: "Bảo trì", icon: AlertCircle, className: "bg-gray-100 text-gray-800" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};


export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const bookId = params.id as string;

  const [book, setBook] = useState<Book | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<RelatedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanLoading, setIsLoanLoading] = useState(false);
  // Thêm state userLoans và load khi mount
  const [userLoans, setUserLoans] = useState<Loan[]>([]);
  const [showConfirmLoanDialog, setShowConfirmLoanDialog] = useState(false);
  const [loanDates, setLoanDates] = useState<{ borrow: string; due: string }>({ borrow: '', due: '' });
  // 1. Thêm state cho policies
  const [policies, setPolicies] = useState<Record<string, any>>({});
  const currentPolicy = user && user.user_type ? policies[user.user_type] : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bookData, copiesData] = await Promise.all([
          fetchBookDetail(bookId),
          fetchBookCopies(bookId)
        ]);
        
        setBook(bookData);
        setCopies(copiesData);
        
        // Load related books
        const related = await fetchRelatedBooks(bookId, bookData.category);
        setRelatedBooks(related);
      } catch (error) {
        toast.error("Không thể tải thông tin sách. Vui lòng thử lại.");
        router.push('/books');
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      loadData();
    }
  }, [bookId, router]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!isAuthenticated) return;
      const res = await fetch('/api/me/loans?status=requested,borrowed,return_requested', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUserLoans(data);
      }
    };
    fetchLoans();
  }, [isAuthenticated, bookId]);

  // 2. Lấy policies từ API khi mount
  useEffect(() => {
    fetch('/api/policies')
      .then(r => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const obj: Record<string, any> = {};
          data.forEach((p) => { obj[p.user_type] = p; });
          setPolicies(obj);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Sửa handleLoanRequest để hiển thị lỗi rõ ràng từ backend
  const handleLoanRequest = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mượn sách");
      router.push('/login');
      return;
    }
    if (!book || book.available_copies === 0) {
      toast.error("Hiện tại không còn bản sao nào khả dụng");
      return;
    }
    try {
      setIsLoanLoading(true);
      const availableCopy = copies.find(copy => copy.status === 'available');
      if (!availableCopy) {
        toast.error("Không tìm thấy bản sao khả dụng");
        return;
      }
      const response = await fetch('/api/loans/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          copy_id: availableCopy.id
        }),
      });
      if (!response.ok) {
        let errorMsg = 'Không thể tạo yêu cầu mượn sách';
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorData.detail || errorMsg;
        } catch {}
        toast.error(errorMsg);
        return;
      }
      toast.success("Yêu cầu mượn sách đã được gửi thành công!");
      // Reload data để cập nhật trạng thái
      const [bookData, copiesData] = await Promise.all([
        fetchBookDetail(bookId),
        fetchBookCopies(bookId)
      ]);
      setBook(bookData);
      setCopies(copiesData);
    } catch (error: any) {
      console.error('Loan request error:', error);
      toast.error(error?.message || "Có lỗi xảy ra khi mượn sách");
    } finally {
      setIsLoanLoading(false);
    }
  };

  // 2. Sửa modal xác nhận mượn sách
  const openConfirmLoanDialog = () => {
    const today = new Date();
    const borrow = today.toLocaleDateString('vi-VN');
    const due = new Date(today.getTime() + (currentPolicy?.loan_days || 14) * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN');
    setLoanDates({ borrow, due });
    setShowConfirmLoanDialog(true);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-64 w-full mb-6" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!book) {
    return (
      <DefaultLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Không tìm thấy sách</h2>
            <p className="text-muted-foreground mb-6">Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Button onClick={() => router.push('/books')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Trong sidebar, xác định trạng thái mượn/trả của user với bản sao này
  const currentLoan = userLoans.find(l => copies.some(c => c.id === l.copy_id));

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
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">Tác giả: {book.author}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Book Images */}
            {book.images && book.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Hình ảnh sách</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {book.images
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`${book.title} - Ảnh ${index + 1}`}
                              className="w-full h-80 object-cover rounded-lg border"
                            />
                            {image.is_primary && (
                              <Badge className="absolute top-2 right-2" variant="secondary">
                                Ảnh chính
                              </Badge>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Thông tin sách</TabsTrigger>
                  <TabsTrigger value="copies">Bản sao ({copies.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Chi tiết sách</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Tác giả</p>
                              <p className="font-medium">{book.author}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Ngôn ngữ</p>
                              <p className="font-medium">{book.language}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Tag className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Thể loại</p>
                              <p className="font-medium">{book.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {book.published_year && (
                            <div className="flex items-center space-x-3">
                              <BookOpen className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">Năm xuất bản</p>
                                <p className="font-medium">{book.published_year}</p>
                              </div>
                            </div>
                          )}
                          
                          {book.isbn && (
                            <div className="flex items-center space-x-3">
                              <CopyIcon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="text-sm text-muted-foreground">ISBN</p>
                                <p className="font-medium">{book.isbn}</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-3">
                            <MapPin className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Tình trạng</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary">
                                  Còn {book.available_copies}/{book.total_copies}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {book.description && (
                        <>
                          <Separator />
                          <div>
                            <h3 className="font-semibold mb-2">Mô tả</h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {book.description}
                            </p>
                          </div>
                        </>
                      )}
                      
                      <Separator />
                      
                      <div>
                        <h3 className="font-semibold mb-3">Vị trí hiện tại</h3>
                        <div className="grid gap-3">
                          {book.locations.map((location) => (
                            <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{location.shelf_code}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {location.room} - {location.shelf} (Hàng {location.row}, Cột {location.column})
                                  </p>
                                </div>
                              </div>
                              <StatusBadge status={location.status} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="copies" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Danh sách bản sao</CardTitle>
                      <CardDescription>
                        Quản lý các bản sao của cuốn sách này
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã kệ</TableHead>
                            <TableHead>Phòng</TableHead>
                            <TableHead>Vị trí</TableHead>
                            <TableHead>Tình trạng</TableHead>
                            <TableHead>Thông tin mượn</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {copies.map((copy) => (
                            <motion.tr
                              key={copy.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="hover:bg-muted/50"
                            >
                              <TableCell className="font-medium">{copy.shelf_code}</TableCell>
                              <TableCell>{copy.room}</TableCell>
                              <TableCell>
                                {copy.shelf} (Hàng {copy.row}, Cột {copy.column})
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={copy.status} />
                              </TableCell>
                              <TableCell>
                                {copy.status === 'on_loan' && copy.borrower_name && (
                                  <div className="text-sm">
                                    <p className="font-medium">{copy.borrower_name}</p>
                                    <p className="text-muted-foreground">
                                      Hạn trả: {copy.loan_due_date}
                                    </p>
                                  </div>
                                )}
                                {copy.status === 'reserved' && (
                                  <p className="text-sm text-muted-foreground">Đã được đặt trước</p>
                                )}
                                {copy.status === 'maintenance' && (
                                  <p className="text-sm text-muted-foreground">Đang bảo trì</p>
                                )}
                                {copy.status === 'lost' && (
                                  <p className="text-sm text-muted-foreground">Đã mất</p>
                                )}
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Book Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin sách</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Nhà xuất bản:</span>
                    <span className="font-medium">{book.publisher}</span>
                  </div>
                  
                  {book.cover_price > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Giá bìa:</span>
                      <span className="font-medium">
                        {book.cover_price.toLocaleString('vi-VN')} {book.currency}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng bản sao:</span>
                    <span className="font-medium">{book.total_copies}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Còn lại:</span>
                    <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                      {book.available_copies} bản
                    </Badge>
                  </div>
                  
                  <Separator />
                  
                  {/* Loan Button */}
                  {isAuthenticated && (
                    currentLoan?.status === 'requested' ? (
                      <Button className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Đã gửi yêu cầu, chờ duyệt
                      </Button>
                    ) : currentLoan?.status === 'borrowed' ? (
                      <Button className="w-full" onClick={async () => {
                        try {
                          await fetch(`/api/loans/${currentLoan.id}/request-return`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            },
                          });
                          toast.success('Đã gửi yêu cầu trả sách, chờ admin duyệt!');
                          // reload userLoans
                          const res = await fetch('/api/me/loans?status=requested,borrowed,return_requested', {
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                            },
                          });
                          if (res.ok) setUserLoans(await res.json());
                        } catch {
                          toast.error('Không thể gửi yêu cầu trả sách');
                        }
                      }}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Yêu cầu trả sách
                      </Button>
                    ) : currentLoan?.status === 'return_requested' ? (
                      <Button className="w-full" disabled>
                        <Clock className="w-4 h-4 mr-2" />
                        Chờ admin duyệt trả
                      </Button>
                    ) : book.available_copies > 0 ? (
                      <Button className="w-full" onClick={openConfirmLoanDialog} disabled={isLoanLoading}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        {isLoanLoading ? "Đang xử lý..." : "Mượn sách"}
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        <XCircle className="w-4 h-4 mr-2" />
                        Hết sách
                      </Button>
                    )
                  )}
                  
                  {!isAuthenticated && (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/login')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Đăng nhập để mượn
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Books */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sách cùng thể loại</CardTitle>
                  <CardDescription>
                    Những cuốn sách tương tự bạn có thể quan tâm
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedBooks.map((relatedBook) => (
                      <motion.div
                        key={relatedBook.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => router.push(`/books/${relatedBook.id}`)}
                      >
                        <h4 className="font-medium mb-1 line-clamp-2">{relatedBook.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{relatedBook.author}</p>
                        <Badge variant="secondary" className="text-xs">
                          Còn {relatedBook.available_copies}/{relatedBook.total_copies}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Thao tác nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isAuthenticated && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/books?author=${encodeURIComponent(book.author)}`)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Xem sách cùng tác giả
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push(`/books?category=${encodeURIComponent(book.category)}`)}
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    Xem sách cùng thể loại
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirm Loan Dialog */}
      <Dialog open={showConfirmLoanDialog} onOpenChange={setShowConfirmLoanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận mượn sách</DialogTitle>
          </DialogHeader>
          <div className="mb-2">
            <div>Ngày mượn: <b>{loanDates.borrow}</b></div>
            <div>Ngày trả dự kiến: <b>{loanDates.due}</b></div>
            {isAuthenticated && (
              <div className="mt-2 text-sm">
                Người mượn: <b>{(typeof window !== 'undefined' && localStorage.getItem('full_name')) || 'Bạn'}</b>
                {user?.user_type && (
                  <span> ({user.user_type})</span>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            <b>Chính sách mượn trả:</b>
            {currentPolicy ? (
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Số sách tối đa: <b>{currentPolicy.max_loans}</b></li>
                <li>Số ngày mượn: <b>{currentPolicy.loan_days}</b></li>
                <li>Phạt/ngày: <b>{currentPolicy.fine_per_day.toLocaleString('vi-VN')} VND</b></li>
                <li>Số lần gia hạn: <b>{currentPolicy.renew_times}</b></li>
              </ul>
            ) : (
              <div className="italic">Không tìm thấy chính sách cho loại tài khoản này.</div>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            <b>Quy tắc:</b>
            <ul className="list-disc ml-5 mt-1 space-y-1">
              <li>Không mượn quá số sách cho phép.</li>
              <li>Không mượn trùng sách.</li>
              <li>Trả trễ sẽ bị phạt theo chính sách.</li>
              <li>Tài khoản có thể bị khóa nếu vi phạm nhiều lần.</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={async () => { setShowConfirmLoanDialog(false); await handleLoanRequest(); }} disabled={isLoanLoading}>
              Đồng ý mượn
            </Button>
            <DialogClose asChild>
              <Button variant="outline">Hủy</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
