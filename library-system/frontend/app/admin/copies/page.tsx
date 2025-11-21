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
  Copy, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Building,
  Grid3X3,
  Package,
  Clock,
  BarChart3
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { copiesAPI, booksAPI, locationsAPI } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Định nghĩa lại BookCopy theo API thực
interface BookCopy {
  id: number;
  copy_code: string;
  status: string;
  book_id: number;
  book_title: string;
  book_authors: string;
  location_id: number;
  location_code: string;
  location_room?: string;
  location_floor?: string;
  created_at?: string;
  updated_at?: string;
  primary_image_url?: string; // Thêm trường này để lưu URL ảnh bìa sách
}

interface CopyFilters {
  status: string;
  condition: string;
  building: string;
  floor: string;
  search: string;
}

interface CopiesResponse {
  items: BookCopy[];
  total: number;
  page: number;
  total_pages: number;
}

// Loading skeleton
const CopySkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-6 w-24 mb-2" />
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

export default function AdminCopiesPage() {
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCopies, setTotalCopies] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingCopy, setEditingCopy] = useState<BookCopy | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const itemsPerPage = 12;
  const [reloadFlag, setReloadFlag] = useState(0);
  // Thêm state cho số lượng bản sao khi thêm mới
  const [addQuantity, setAddQuantity] = useState(1);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Load books & locations for select
  useEffect(() => {
    booksAPI.getAll(1, 100).then(res => {
      if (res.success && res.data) setBooks(res.data.items);
    });
    locationsAPI.getAll().then(res => {
      if (res.success && res.data) setLocations(res.data);
    });
  }, []);

  // Load copies
  useEffect(() => {
    const loadCopies = async () => {
      setIsLoading(true);
      const res = await copiesAPI.getAll(currentPage, 12, undefined, undefined, search);
      if (res.success && res.data && Array.isArray(res.data.items)) {
        const mappedItems: BookCopy[] = res.data.items.map((item: any) => ({
          id: item.id ?? 0,
          copy_code: item.copy_code ?? '',
          status: item.status ?? '',
          book_id: item.book_id ?? 0,
          book_title: item.book_title ?? '',
          book_authors: item.book_authors ?? '',
          location_id: item.location_id ?? 0,
          location_code: item.location_code ?? '',
          location_room: item.location_room ?? '',
          location_floor: item.location_floor ?? '',
          created_at: item.created_at ?? '',
          updated_at: item.updated_at ?? '',
          primary_image_url: item.primary_image_url ?? '',
        }));
        if (currentPage === 1) {
          setCopies(mappedItems);
        } else {
          setCopies((prev: BookCopy[]) => [...prev, ...mappedItems]);
        }
        setTotalPages(Math.ceil((res.data.total ?? mappedItems.length) / 12));
        setTotalCopies(res.data.total ?? mappedItems.length);
      } else {
        setCopies([]);
        setTotalPages(1);
        setTotalCopies(0);
        toast.error('Không thể tải danh sách bản sao');
      }
      setIsLoading(false);
    };
    loadCopies();
    // eslint-disable-next-line
  }, [search, currentPage, reloadFlag]);

  // Thay đổi: bỏ phân trang số, thêm nút Xem thêm
  {!isLoading && copies.length < totalCopies && (
    <div className="flex justify-center mt-6">
      <Button onClick={() => setCurrentPage((prev: number) => prev + 1)}>
        Xem thêm
      </Button>
    </div>
  )}

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setCopies([]);
  };

  const handleFilterChange = (key: keyof CopyFilters, value: string) => {
    // setFilters(prev => ({ ...prev, [key]: value })); // Original code had this line commented out
    setCurrentPage(1);
  };

  const clearFilters = () => {
    // setFilters({ // Original code had this line commented out
    //   status: 'all',
    //   condition: 'all',
    //   building: 'all',
    //   floor: 'all',
    //   search: ''
    // });
    setCurrentPage(1);
  };

  // CRUD handlers
  const handleAddCopy = () => {
    setEditingCopy(null);
    setShowForm(true);
  };
  const handleEdit = (copy: BookCopy) => {
    setEditingCopy({ ...copy }); // copy chắc chắn có id: number
    setShowForm(true);
  };
  const handleDelete = async (copy: BookCopy) => {
    if (confirm(`Bạn có chắc muốn xóa bản sao "${copy.copy_code}"?`)) {
      // TODO: Gọi API xóa khi backend có
      toast.success('Đã xóa bản sao (demo)');
    }
  };
  const handleView = (copy: BookCopy) => {
    toast.info(`Xem chi tiết bản sao: ${copy.copy_code}`);
    // TODO: Có thể mở modal chi tiết nếu muốn
  };
  const handleFormSubmit = async (data: any, id?: number) => {
    // Validate và gọi API create/update
    if (id) {
      // Update
      const res = await copiesAPI.update(id, data);
      if (res.success) {
        toast.success('Cập nhật bản sao thành công');
        setShowForm(false);
        setReloadFlag(f => f + 1); // reload lại danh sách
      } else {
        toast.error(res.error || 'Cập nhật thất bại');
      }
    } else {
      // Create
      const res = await copiesAPI.create(data);
      if (res.success) {
        toast.success('Thêm bản sao thành công');
        setShowForm(false);
        setReloadFlag(f => f + 1);
      } else {
        toast.error(res.error || 'Thêm bản sao thất bại');
      }
    }
  };

  // Get unique values for filters
  const buildings = ['Tòa A', 'Tòa B', 'Tòa C'];
  const floors = ['Tầng trệt', 'Tầng 1', 'Tầng 2', 'Tầng 3'];
  const statuses = [
    { value: 'available', label: 'Có sẵn' },
    { value: 'borrowed', label: 'Đang mượn' },
    { value: 'reserved', label: 'Đã đặt trước' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'lost', label: 'Mất' }
  ];
  const conditions = [
    { value: 'excellent', label: 'Tuyệt vời' },
    { value: 'good', label: 'Tốt' },
    { value: 'fair', label: 'Khá' },
    { value: 'poor', label: 'Kém' }
  ];

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý bản sao sách</h1>
              <p className="text-gray-600">
                Quản lý thông tin, vị trí và trạng thái của tất cả bản sao sách trong thư viện
              </p>
            </div>
            <Button onClick={handleAddCopy} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm bản sao mới
            </Button>
          </div>

          {/* Search only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Tìm kiếm bản sao
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-4">
                <Input
                  placeholder="Tìm kiếm theo tên sách, tác giả, mã bản sao, vị trí..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" disabled={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
              </form>
              <div className="text-sm text-muted-foreground mt-2">
                Tìm thấy {totalCopies} bản sao
              </div>
            </CardContent>
          </Card>

          {/* List/Table view */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách bản sao</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ảnh</TableHead>
                    <TableHead>Mã bản sao</TableHead>
                    <TableHead>Tên sách</TableHead>
                    <TableHead>Tác giả</TableHead>
                    <TableHead>Vị trí</TableHead>
                    <TableHead>Kệ</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={7}>Đang tải...</TableCell></TableRow>
                  ) : copies.length === 0 ? (
                    <TableRow><TableCell colSpan={7}>Không tìm thấy bản sao</TableCell></TableRow>
                  ) : (
                    copies.map((copy) => (
                      <TableRow key={copy.id}>
                        <TableCell>
                          {/* Hiển thị ảnh chính của sách nếu có */}
                          <img src={copy.primary_image_url || '/no-image.png'} alt="cover" className="w-16 h-20 object-cover rounded" />
                        </TableCell>
                        <TableCell>{copy.copy_code}</TableCell>
                        <TableCell>{copy.book_title}</TableCell>
                        <TableCell>{copy.book_authors}</TableCell>
                        <TableCell>{copy.location_room} ({copy.location_floor})</TableCell>
                        <TableCell>{copy.location_code}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(copy)}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(copy)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {!isLoading && copies.length < totalCopies && (
                <div className="flex justify-center mt-6">
                  <Button onClick={() => setCurrentPage((prev: number) => prev + 1)}>
                    Xem thêm
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {/* Sửa: bỏ phân trang số, thêm nút Xem thêm */}
          {/* <div className="flex justify-center">
            <Pagination>
              <PaginationContent className="gap-x-2">
                <PaginationItem>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50 px-2' : 'cursor-pointer px-2'}
                    aria-label="Previous"
                  >
                    {'<'}
                  </button>
                </PaginationItem>
                {totalPages <= 3 ? (
                  Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={`page-${i+1}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i+1)}
                        isActive={currentPage === i+1}
                        className="cursor-pointer"
                      >
                        {i+1}
                      </PaginationLink>
                    </PaginationItem>
                  ))
                ) : (
                  <>
                    <PaginationItem key="page-1">
                      <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1} className="cursor-pointer">1</PaginationLink>
                    </PaginationItem>
                    {currentPage === 2 && (
                      <PaginationItem key="page-2">
                        <PaginationLink onClick={() => setCurrentPage(2)} isActive={currentPage === 2} className="cursor-pointer">2</PaginationLink>
                      </PaginationItem>
                    )}
                    {currentPage > 3 && (
                      <PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>
                    )}
                    {currentPage > 2 && currentPage < totalPages - 1 && (
                      <PaginationItem key={`page-${currentPage}`}>
                        <PaginationLink onClick={() => setCurrentPage(currentPage)} isActive className="cursor-pointer">{currentPage}</PaginationLink>
                      </PaginationItem>
                    )}
                    {currentPage === totalPages - 1 && totalPages > 3 && (
                      <PaginationItem key={`page-${totalPages-1}`}>
                        <PaginationLink onClick={() => setCurrentPage(totalPages-1)} isActive={currentPage === totalPages-1} className="cursor-pointer">{totalPages-1}</PaginationLink>
                      </PaginationItem>
                    )}
                    {currentPage < totalPages - 2 && (
                      <PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>
                    )}
                    <PaginationItem key={`page-${totalPages}`}>
                      <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages} className="cursor-pointer">{totalPages}</PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50 px-2' : 'cursor-pointer px-2'}
                    aria-label="Next"
                  >
                    {'>'}
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div> */}
        </div>
      </div>

      {/* Modal form Thêm/Sửa */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCopy ? 'Chỉnh sửa bản sao' : 'Thêm bản sao mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (editingCopy) {
              // Sửa: chỉ cho đổi vị trí
              if (!editingCopy.id) {
                toast.error('Thiếu id bản sao!');
                return;
              }
              const payload = {
                copy_code: editingCopy.copy_code,
                location_id: editingCopy.location_id,
              };
              await handleFormSubmit(payload, editingCopy.id);
            } else {
              // Thêm mới: tạo nhiều bản sao
              if (!selectedBook || !selectedLocation) {
                toast.error('Vui lòng chọn sách và vị trí');
                return;
              }
              const promises = [];
              for (let i = 0; i < addQuantity; i++) {
                const code = `${selectedBook.id}-${Date.now().toString().slice(-4)}-${i+1}`;
                const payload = {
                  copy_code: code,
                  book_id: selectedBook.id,
                  location_id: selectedLocation.id,
                };
                promises.push(copiesAPI.create(payload));
              }
              const results = await Promise.all(promises);
              if (results.every(r => r.success)) {
                toast.success(`Đã thêm ${addQuantity} bản sao thành công`);
                setShowForm(false);
                setReloadFlag(f => f + 1);
                setAddQuantity(1);
                setSelectedBook(null);
                setSelectedLocation(null);
              } else {
                toast.error('Có lỗi khi thêm bản sao');
              }
            }
          }}>
            <div className="grid gap-4 py-4">
              {/* Mã bản sao chỉ hiển thị khi sửa, khi thêm sẽ tự động sinh */}
              {editingCopy ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="copy_code" className="text-right">Mã bản sao</Label>
                  <Input id="copy_code" name="copy_code" value={editingCopy.copy_code || ''} readOnly className="col-span-3 bg-gray-100" required />
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Mã sách</Label>
                  <Input value={selectedBook?.id || ''} readOnly className="col-span-3 bg-gray-100" />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="book_id" className="text-right">Sách</Label>
                {editingCopy ? (
                  <Input value={books.find(b => b.id === editingCopy.book_id)?.title || ''} readOnly className="col-span-3 bg-gray-100 truncate" />
                ) : (
                  <Select onValueChange={(value) => {
                    const book = books.find(b => b.id.toString() === value);
                    setSelectedBook(book);
                  }} value={selectedBook?.id?.toString() || ''}>
                    <SelectTrigger className="col-span-3 truncate max-w-full">
                      <SelectValue placeholder="Chọn sách" className="truncate max-w-full" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id.toString()} className="truncate max-w-xs">{book.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location_id" className="text-right">Vị trí</Label>
                {editingCopy ? (
                  <Select onValueChange={(value) => setEditingCopy(prev => {
                    if (!prev || typeof prev.id !== 'number') return prev;
                    return { ...prev, location_id: parseInt(value, 10) };
                  })} value={editingCopy?.location_id?.toString() || ''}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>{location.code} - {location.room} ({location.floor})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select onValueChange={(value) => {
                    const loc = locations.find(l => l.id.toString() === value);
                    setSelectedLocation(loc);
                  }} value={selectedLocation?.id?.toString() || ''}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn vị trí" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id.toString()}>{location.code} - {location.room} ({location.floor})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {!editingCopy && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Số lượng</Label>
                  <Input id="quantity" name="quantity" type="number" min={1} value={addQuantity} onChange={e => setAddQuantity(Number(e.target.value))} className="col-span-3" />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Hủy</Button></DialogClose>
              <Button type="submit">Lưu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
