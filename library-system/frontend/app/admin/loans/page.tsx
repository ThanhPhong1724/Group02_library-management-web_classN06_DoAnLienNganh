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
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  ArrowUpDown,
  Package,
  User,
  Bookmark
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { relative } from 'path';
// import { useDebounce } from '@/lib/hooks/useDebounce';

// Types
interface Loan {
  id: number;
  user_id: number;
  user_name: string;
  user_email?: string;
  book_id: number;
  book_title: string;
  book_authors: string;
  copy_id: number;
  copy_code?: string; // Thêm mã sách
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: 'borrowed' | 'returned' | 'overdue' | 'reserved' | 'cancelled' | 'requested' | 'return_requested';
  fine_amount?: number;
  fine_note?: string;
  fine_paid?: boolean;
  fine_paid_at?: string;
  fine_confirmed_by?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface LoanFilters {
  status: string;
  user_type: string;
  search: string;
  borrowed_from: string;
  borrowed_to: string;
  due_from: string;
  due_to: string;
}

interface LoansResponse {
  items: Loan[];
  total: number;
  page: number;
  total_pages: number;
}

// Real API adapters
const fetchLoans = async (params: {
  filters: any;
  page: number;
  limit: number;
}): Promise<LoansResponse> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.filters.search) {
      searchParams.append('search', params.filters.search);
    }
    if (params.filters.status && params.filters.status !== 'all') {
      searchParams.append('status', params.filters.status);
    }
    if (params.filters.user_type && params.filters.user_type !== 'all') {
      searchParams.append('user_type', params.filters.user_type);
    }
    if (params.filters.borrowed_from) {
      searchParams.append('borrowed_from', params.filters.borrowed_from);
    }
    if (params.filters.borrowed_to) {
      searchParams.append('borrowed_to', params.filters.borrowed_to);
    }
    if (params.filters.due_from) {
      searchParams.append('due_from', params.filters.due_from);
    }
    if (params.filters.due_to) {
      searchParams.append('due_to', params.filters.due_to);
    }
    
    searchParams.append('page', params.page.toString());
    searchParams.append('limit', params.limit.toString());

    const token = localStorage.getItem('access_token');
    const response = await fetch(`/api/admin/loans?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách mượn trả');
    }

    const data = await response.json();
    const items = Array.isArray(data) ? data : (data.items || []);
    return {
      items: items.map((item: any) => ({
        ...item,
        loan_date: item.borrowed_at,
        due_date: item.due_at,
        return_date: item.returned_at,
        copy_code: item.copy_code, // map mã sách
        fine_amount: item.fine_amount,
        fine_note: item.fine_note,
        fine_paid: item.fine_paid,
        fine_paid_at: item.fine_paid_at,
        fine_confirmed_by: item.fine_confirmed_by,
      })),
      total: items.length,
      page: params.page,
      total_pages: 1
    };
  } catch (error) {
    console.error('Error fetching loans:', error);
    // Fallback to mock data if API fails
    return getMockLoans(params);
  }
};

// Mock data fallback
const getMockLoans = (params: { filters: LoanFilters; page: number; limit: number }): LoansResponse => {
  const mockLoans: Loan[] = [
    {
      id: 1,
      user_id: 1,
      user_name: 'Nguyễn Văn A',
      user_email: 'nguyenvana@example.com',
      book_id: 1,
      book_title: 'Đắc Nhân Tâm',
      book_authors: 'Dale Carnegie',
      copy_id: 1,
      copy_code: 'DC-001',
      loan_date: '2024-01-15T10:00:00Z',
      due_date: '2024-02-15T10:00:00Z',
      status: 'borrowed',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      notes: 'Mượn sách để nghiên cứu'
    },
    {
      id: 2,
      user_id: 2,
      user_name: 'Trần Thị B',
      user_email: 'tranthib@example.com',
      book_id: 2,
      book_title: 'Nhà Giả Kim',
      book_authors: 'Paulo Coelho',
      copy_id: 3,
      copy_code: 'NGC-001',
      loan_date: '2024-01-10T09:00:00Z',
      due_date: '2024-02-10T09:00:00Z',
      return_date: '2024-01-20T16:00:00Z',
      status: 'returned',
      created_at: '2024-01-10T09:00:00Z',
      updated_at: '2024-01-20T16:00:00Z'
    },
    {
      id: 3,
      user_id: 3,
      user_name: 'Lê Văn C',
      user_email: 'levanc@example.com',
      book_id: 3,
      book_title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu',
      book_authors: 'Rosie Nguyễn',
      copy_id: 5,
      copy_code: 'TT-001',
      loan_date: '2024-01-05T11:00:00Z',
      due_date: '2024-02-05T11:00:00Z',
      status: 'overdue',
      fine_amount: 50000,
      created_at: '2024-01-05T11:00:00Z',
      updated_at: '2024-01-05T11:00:00Z',
      notes: 'Quá hạn trả sách'
    },
    {
      id: 4,
      user_id: 4,
      user_name: 'Phạm Thị D',
      user_email: 'phamthid@example.com',
      book_id: 4,
      book_title: 'Sapiens: Lược Sử Loài Người',
      book_authors: 'Yuval Noah Harari',
      copy_id: 6,
      copy_code: 'SAP-001',
      loan_date: '2024-01-20T14:00:00Z',
      due_date: '2024-02-20T14:00:00Z',
      status: 'borrowed',
      created_at: '2024-01-20T14:00:00Z',
      updated_at: '2024-01-20T14:00:00Z'
    },
    {
      id: 5,
      user_id: 5,
      user_name: 'Hoàng Văn E',
      user_email: 'hoangvane@example.com',
      book_id: 5,
      book_title: 'Atomic Habits',
      book_authors: 'James Clear',
      copy_id: 7,
      copy_code: 'AH-001',
      loan_date: '2024-01-12T15:00:00Z',
      due_date: '2024-02-12T15:00:00Z',
      status: 'reserved',
      created_at: '2024-01-12T15:00:00Z',
      updated_at: '2024-01-12T15:00:00Z',
      notes: 'Đặt trước sách'
    },
    {
      id: 6,
      user_id: 1,
      user_name: 'Nguyễn Văn A',
      user_email: 'nguyenvana@example.com',
      book_id: 6,
      book_title: 'The Power of Now',
      book_authors: 'Eckhart Tolle',
      copy_id: 8,
      copy_code: 'PN-001',
      loan_date: '2024-01-18T13:00:00Z',
      due_date: '2024-02-18T13:00:00Z',
      return_date: '2024-01-25T10:00:00Z',
      status: 'returned',
      created_at: '2024-01-18T13:00:00Z',
      updated_at: '2024-01-25T10:00:00Z'
    }
  ];

  // Apply filters
  let filteredLoans = mockLoans;
  
  if (params.filters.search) {
    const searchLower = params.filters.search.toLowerCase();
    filteredLoans = filteredLoans.filter(loan => 
      loan.user_name.toLowerCase().includes(searchLower) ||
      loan.book_title.toLowerCase().includes(searchLower) ||
      loan.copy_code?.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.filters.status && params.filters.status !== 'all') {
    filteredLoans = filteredLoans.filter(loan => loan.status === params.filters.status);
  }
  
  if (params.filters.user_type && params.filters.user_type !== 'all') {
    // Mock filter by user type (in real API this would filter by user.role)
    if (params.filters.user_type === 'student') {
      filteredLoans = filteredLoans.filter(loan => loan.user_id <= 3);
    } else if (params.filters.user_type === 'teacher') {
      filteredLoans = filteredLoans.filter(loan => loan.user_id > 3);
    }
  }
  
  if (params.filters.borrowed_from) {
    const fromDate = new Date(params.filters.borrowed_from);
    filteredLoans = filteredLoans.filter(loan => new Date(loan.loan_date) >= fromDate);
  }
  
  if (params.filters.borrowed_to) {
    const toDate = new Date(params.filters.borrowed_to);
    filteredLoans = filteredLoans.filter(loan => new Date(loan.loan_date) <= toDate);
  }

  if (params.filters.due_from) {
    const fromDate = new Date(params.filters.due_from);
    filteredLoans = filteredLoans.filter(loan => new Date(loan.due_date) >= fromDate);
  }

  if (params.filters.due_to) {
    const toDate = new Date(params.filters.due_to);
    filteredLoans = filteredLoans.filter(loan => new Date(loan.due_date) <= toDate);
  }

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const items = filteredLoans.slice(startIndex, endIndex);

  return {
    items,
    total: filteredLoans.length,
    page: params.page,
    total_pages: Math.ceil(filteredLoans.length / params.limit)
  };
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'borrowed':
        return { label: 'Đang mượn', className: 'bg-blue-100 text-blue-800', icon: BookOpen };
      case 'returned':
        return { label: 'Đã trả', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'overdue':
        return { label: 'Quá hạn', className: 'bg-red-100 text-red-800', icon: AlertCircle };
      case 'reserved':
        return { label: 'Đặt trước', className: 'bg-purple-100 text-purple-800', icon: Bookmark };
      case 'cancelled':
        return { label: 'Đã hủy', className: 'bg-gray-100 text-gray-800', icon: XCircle };
      case 'requested':
        return { label: 'Đã yêu cầu', className: 'bg-yellow-100 text-yellow-800', icon: Eye };
      case 'return_requested':
        return { label: 'Đã yêu cầu trả', className: 'bg-orange-100 text-orange-800', icon: Clock };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Loan Card Component
const LoanCard = ({ loan, onEdit, onDelete, onView, onApprove, onApproveReturn, onReject }: {
  loan: Loan;
  onEdit: (loan: Loan) => void;
  onDelete: (loan: Loan) => void;
  onView: (loan: Loan) => void;
  onApprove: (loan: Loan) => void;
  onApproveReturn: (loan: Loan) => void;
  onReject: (loan: Loan) => void;
}) => {
  const isOverdue = loan.status === 'overdue';
  const isReturned = loan.status === 'returned';
  
  const calcFine = (loan: Loan) => {
    if (!loan.due_date) return 0;
    let returnDate = loan.return_date || (loan.status === 'overdue' ? new Date().toISOString() : null);
    if (!returnDate) return 0;
    const due = new Date(loan.due_date);
    const ret = new Date(returnDate);
    const daysLate = Math.max(0, Math.ceil((ret.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
    return daysLate > 0 ? daysLate * 10000 : 0;
  };

  const [showApproveFineModal, setShowApproveFineModal] = useState<{ open: boolean, loan: Loan | null }>({ open: false, loan: null });

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`h-full ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
        <CardHeader className="pb-3">
          <div style={{position: 'relative'}} className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">#{loan.id}</h3>
                <StatusBadge status={loan.status} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">{loan.copy_code || '—'}</Badge>
                {/* {(loan.status === 'overdue' || (loan.status === 'returned' && loan.return_date && loan.due_date && new Date(loan.return_date) > new Date(loan.due_date))) && (
                  <Badge className="bg-red-100 text-red-800 text-xs">Phạt: {calcFine(loan).toLocaleString('vi-VN')}đ</Badge>
                )} */}
              </div>
            </div>
            <div style={{position: 'absolute', right: 0, top: 0}} className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => onView(loan)}><Eye className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={() => onEdit(loan)}><Edit className="h-3 w-3" /></Button>
              <Button size="sm" variant="outline" onClick={() => onDelete(loan)} className="text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><User className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Người mượn:</span><span className="font-medium">{loan.user_name || '—'}</span></div>
            <div className="flex items-center gap-2 text-sm"><BookOpen className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Sách:</span><span className="font-medium truncate max-w-[180px]" title={loan.book_title}>{loan.book_title || '—'}</span></div>
            <div className="flex items-center gap-2 text-sm"><Users className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Tác giả:</span><span className="font-medium">{loan.book_authors || '—'}</span></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm"><Calendar className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Ngày mượn:</span><span className="font-medium">{loan.loan_date ? new Date(loan.loan_date).toLocaleDateString('vi-VN') : '—'}</span></div>
            <div className="flex items-center gap-2 text-sm"><Clock className="h-3 w-3 text-muted-foreground" /><span className="text-muted-foreground">Hạn trả:</span><span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>{loan.due_date ? new Date(loan.due_date).toLocaleDateString('vi-VN') : '—'}</span></div>
            {loan.return_date && (<div className="flex items-center gap-2 text-sm"><CheckCircle className="h-3 w-3 text-green-600" /><span className="text-muted-foreground">Ngày trả:</span><span className="font-medium text-green-600">{new Date(loan.return_date).toLocaleDateString('vi-VN')}</span></div>)}
          </div>
          {loan.notes && (<div className="text-sm text-muted-foreground bg-muted p-2 rounded"><span className="font-medium">Ghi chú:</span> {loan.notes}</div>)}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Package className="h-3 w-3" /><span>Tạo: {loan.created_at ? new Date(loan.created_at).toLocaleDateString('vi-VN') : '—'}</span></div>
            <div className="flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /><span>Cập nhật: {loan.updated_at ? new Date(loan.updated_at).toLocaleDateString('vi-VN') : '—'}</span></div>
          </div>
          {/* Nút duyệt mượn, duyệt trả, từ chối */}
          <div className="flex gap-2 pt-2">
            {loan.status === 'requested' && (
              <>
                <Button size="sm" variant="default" onClick={() => onApprove(loan)}>Duyệt mượn</Button>
                <Button size="sm" variant="destructive" onClick={() => onReject(loan)}>Từ chối</Button>
              </>
            )}
            {loan.status === 'return_requested' && (
              <Button size="sm" variant="default" onClick={() => onApproveReturn(loan)}>Duyệt trả</Button>
            )}
          </div>
          {(loan.fine_amount ?? 0) > 0 && !loan.fine_paid && (
            <>
              <Button size="sm" variant="default" onClick={() => setShowApproveFineModal({ open: true, loan })}>Duyệt nộp phạt</Button>
              {showApproveFineModal.open && showApproveFineModal.loan?.id === loan.id && (
                <Dialog open={showApproveFineModal.open} onOpenChange={o => setShowApproveFineModal({ open: o, loan: o ? showApproveFineModal.loan : null })}>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Xác nhận đã nhận tiền phạt</DialogTitle></DialogHeader>
                    <div className="mb-4">Bạn chắc chắn đã nhận được tiền phạt cho bản sao <b>{loan.copy_code}</b>?</div>
                    <DialogFooter>
                      <Button onClick={async () => {
                        try {
                          const token = localStorage.getItem('access_token');
                          const res = await fetch(`/api/admin/loans/${loan.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                            body: JSON.stringify({ fine_paid: true }),
                          });
                          if (res.ok) {
                            toast.success('Đã xác nhận nộp phạt!');
                            setShowApproveFineModal({ open: false, loan: null });
                            if (typeof window !== 'undefined') window.location.reload();
                          } else {
                            toast.error('Lỗi khi xác nhận nộp phạt');
                          }
                        } catch {
                          toast.error('Lỗi khi xác nhận nộp phạt');
                        }
                      }}>Xác nhận đã nhận tiền</Button>
                      <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
          {loan.fine_paid && (
            <Badge className="bg-green-100 text-green-800 text-xs">Đã nộp phạt</Badge>
          )}
          {(loan.fine_amount ?? 0) > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-red-100 text-red-800 text-xs">Phạt: {(loan.fine_amount ?? 0).toLocaleString('vi-VN')}đ</Badge>
              {loan.fine_note && <span className="text-xs text-muted-foreground">{loan.fine_note}</span>}
              {loan.fine_paid ? (
                <Badge className="bg-green-100 text-green-800 text-xs">Đã nộp phạt</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">Chưa nộp phạt</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Loading skeleton
const LoanSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-6 w-16 mb-2" />
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
      </div>
      <div className="space-y-2">
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

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<LoanFilters>({
    status: 'all',
    user_type: 'all',
    borrowed_from: '',
    borrowed_to: '',
    due_from: '',
    due_to: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLoans, setTotalLoans] = useState(0);

  const itemsPerPage = 12;

  const [approveDialog, setApproveDialog] = useState<{ open: boolean, loan: Loan | null }>({ open: false, loan: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean, loan: Loan | null }>({ open: false, loan: null });
  const [approveReturnLoading, setApproveReturnLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  // Thêm các state cho dialog thêm/sửa
  const [addDialog, setAddDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{ open: boolean, loan: Loan | null }>({ open: false, loan: null });
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [copies, setCopies] = useState<any[]>([]);
  const [copiesLoading, setCopiesLoading] = useState(false);
  const [loanForm, setLoanForm] = useState<any>({ user_id: '', copy_id: '', due_at: '', status: 'requested' });

  // Thêm state cho filter ngày và user types
  const [userTypes, setUserTypes] = useState<{ value: string, label: string }[]>([]);
  const [userTypesLoading, setUserTypesLoading] = useState(false);

  // Lấy danh sách user/copy khi mở dialog
  const fetchUsers = async (search = '') => {
    setUsersLoading(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    setUsers(data.items || []);
    setUsersLoading(false);
  };
  const fetchCopies = async (search = '') => {
    setCopiesLoading(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/copies?search=${encodeURIComponent(search)}&status=available`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    const data = await res.json();
    setCopies(data.items || data.results || []);
    setCopiesLoading(false);
  };

  // Khi load trang, lấy loại người dùng thật
  useEffect(() => {
    const fetchUserTypes = async () => {
      setUserTypesLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await fetch('/api/admin/users/types', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      setUserTypes([{ value: 'all', label: 'Tất cả loại' }, ...data.filter(Boolean).map((t: string) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))]);
      setUserTypesLoading(false);
    };
    fetchUserTypes();
  }, []);

  // Load loans
  useEffect(() => {
    const loadLoans = async () => {
      try {
        setIsLoading(true);
        const result = await fetchLoans({
          filters,
          page: currentPage,
          limit: 12
        });
        if (currentPage === 1) {
          setLoans(result.items);
        } else {
          setLoans(prev => [...prev, ...result.items]);
        }
        setTotalPages(result.total_pages);
        setTotalLoans(result.total);
      } catch (error) {
        toast.error('Không thể tải danh sách mượn trả');
        console.error('Error loading loans:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLoans();
  }, [filters, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Thay đổi: bỏ phân trang số, thêm nút Xem thêm
  {!isLoading && loans.length < totalLoans && (
    <div className="flex justify-center mt-6">
      <Button onClick={() => setCurrentPage(prev => prev + 1)}>
        Xem thêm
      </Button>
    </div>
  )}

  const handleFilterChange = (key: keyof LoanFilters, value: string) => {
    setFilters((prev: LoanFilters) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setLoans([]);
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      user_type: 'all',
      borrowed_from: '',
      borrowed_to: '',
      due_from: '',
      due_to: '',
      search: ''
    });
    setCurrentPage(1);
  };

  // Mở dialog thêm
  const handleAddLoan = () => {
    setLoanForm({ user_id: '', copy_id: '', due_at: '', status: 'requested' });
    setAddDialog(true);
    fetchUsers();
    fetchCopies();
  };
  // Mở dialog sửa
  const handleEdit = (loan: Loan) => {
    setLoanForm({
      user_id: loan.user_id,
      copy_id: loan.copy_id,
      due_at: loan.due_date ? loan.due_date.slice(0, 10) : '',
      status: loan.status,
      fine_amount: loan.fine_amount,
      fine_note: loan.fine_note,
      fine_paid: loan.fine_paid,
    });
    setEditDialog({ open: true, loan });
    fetchUsers();
    fetchCopies();
  };
  // Thêm mới loan
  const handleAddSubmit = async () => {
    if (!loanForm.user_id || !loanForm.copy_id || !loanForm.due_at) return toast.error('Điền đủ thông tin');
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/admin/loans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        user_id: loanForm.user_id,
        copy_id: loanForm.copy_id,
        due_at: loanForm.due_at,
        status: loanForm.status,
      }),
    });
    if (res.ok) {
      toast.success('Thêm mượn trả thành công');
      setAddDialog(false);
      setFilters(f => ({ ...f }));
    } else {
      toast.error('Thêm mượn trả thất bại');
    }
  };
  // Sửa loan
  const handleEditSubmit = async () => {
    if (!editDialog.loan) return;
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/admin/loans/${editDialog.loan.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        due_at: loanForm.due_at,
        status: loanForm.status,
        fine_amount: loanForm.fine_amount,
        fine_note: loanForm.fine_note,
        fine_paid: loanForm.fine_paid,
      }),
    });
    if (res.ok) {
      toast.success('Cập nhật mượn trả thành công');
      setEditDialog({ open: false, loan: null });
      setFilters(f => ({ ...f }));
    } else {
      toast.error('Cập nhật mượn trả thất bại');
    }
  };
  // Xóa loan
  const handleDelete = async (loan: Loan) => {
    if (!confirm(`Bạn có chắc muốn xóa mượn trả #${loan.id}?`)) return;
    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/admin/loans/${loan.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      toast.success('Đã xóa mượn trả');
      setFilters(f => ({ ...f }));
    } else {
      toast.error('Xóa mượn trả thất bại');
    }
  };

  const handleView = (loan: Loan) => {
    toast.info(`Xem chi tiết: #${loan.id}`);
    // TODO: Open view modal
  };

  const handleApprove = (loan: Loan) => {
    const today = new Date();
    const defaultDue = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    setDueDate(defaultDue.toISOString().slice(0, 10));
    setApproveDialog({ open: true, loan });
  };
  const handleApproveSubmit = async () => {
    if (!approveDialog.loan || !dueDate) return;
    setApproveLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/admin/loans/${approveDialog.loan.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ due_at: dueDate }),
      });
      if (!res.ok) throw new Error('Duyệt mượn thất bại');
      toast.success('Duyệt mượn thành công');
      setApproveDialog({ open: false, loan: null });
      setDueDate('');
      setFilters(f => ({ ...f }));
    } catch {
      toast.error('Có lỗi khi duyệt mượn');
    } finally {
      setApproveLoading(false);
    }
  };
  const handleReject = (loan: Loan) => setRejectDialog({ open: true, loan });
  const handleRejectSubmit = async () => {
    if (!rejectDialog.loan || !rejectReason) return;
    setRejectLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/admin/loans/${rejectDialog.loan.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error('Từ chối thất bại');
      toast.success('Từ chối phiếu mượn thành công');
      setRejectDialog({ open: false, loan: null });
      setRejectReason('');
      setFilters(f => ({ ...f }));
    } catch {
      toast.error('Có lỗi khi từ chối');
    } finally {
      setRejectLoading(false);
    }
  };
  const handleApproveReturn = async (loan: Loan) => {
    setApproveReturnLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/admin/loans/${loan.id}/approve-return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      if (!res.ok) throw new Error('Duyệt trả thất bại');
      toast.success('Duyệt trả thành công');
      setFilters(f => ({ ...f }));
    } catch {
      toast.error('Có lỗi khi duyệt trả');
    } finally {
      setApproveReturnLoading(false);
    }
  };

  // Get unique values for filters
  const statuses = [
    { value: 'borrowed', label: 'Đang mượn' },
    { value: 'returned', label: 'Đã trả' },
    { value: 'overdue', label: 'Quá hạn' },
    { value: 'reserved', label: 'Đặt trước' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'requested', label: 'Đã yêu cầu' },
    { value: 'return_requested', label: 'Đã yêu cầu trả' }
  ];
  // const userTypes = [
  //   { value: 'student', label: 'Sinh viên' },
  //   { value: 'teacher', label: 'Giáo viên' },
  //   { value: 'staff', label: 'Nhân viên' }
  // ];

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý mượn trả</h1>
              <p className="text-gray-600">
                Quản lý thông tin mượn trả sách, đặt trước và xử lý vi phạm
              </p>
            </div>
            <Button onClick={handleAddLoan} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm mượn trả mới
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
                      placeholder="Tìm kiếm theo tên người mượn, tên sách, mã bản sao..."
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
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.user_type} onValueChange={(value) => handleFilterChange('user_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Loại người dùng" />
                    </SelectTrigger>
                    <SelectContent>
                      {userTypesLoading ? <SelectItem value="loading">Đang tải...</SelectItem> : userTypes.map(type => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    placeholder="Ngày mượn từ"
                    value={filters.borrowed_from}
                    onChange={e => handleFilterChange('borrowed_from', e.target.value)}
                  />

                  <Input
                    type="date"
                    placeholder="Ngày mượn đến"
                    value={filters.borrowed_to}
                    onChange={e => handleFilterChange('borrowed_to', e.target.value)}
                  />

                  <Input
                    type="date"
                    placeholder="Hạn trả từ"
                    value={filters.due_from}
                    onChange={e => handleFilterChange('due_from', e.target.value)}
                  />

                  <Input
                    type="date"
                    placeholder="Hạn trả đến"
                    value={filters.due_to}
                    onChange={e => handleFilterChange('due_to', e.target.value)}
                  />
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
                    Tìm thấy {totalLoans} mượn trả
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Loans Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <LoanSkeleton key={i} />
              ))}
            </div>
          ) : loans.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy mượn trả</h3>
                <p className="text-muted-foreground mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loans.map((loan) => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  onApprove={handleApprove}
                  onApproveReturn={handleApproveReturn}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {/* Thay đổi: bỏ phân trang số, thêm nút Xem thêm */}
          {!isLoading && loans.length < totalLoans && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog duyệt mượn */}
      <Dialog open={approveDialog.open} onOpenChange={o => setApproveDialog({ open: o, loan: o ? approveDialog.loan : null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Duyệt mượn #{approveDialog.loan?.id}</DialogTitle></DialogHeader>
          <div className="mb-2">Chọn hạn trả:</div>
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <DialogFooter>
            <Button onClick={handleApproveSubmit} disabled={approveLoading || !dueDate}>{approveLoading ? 'Đang duyệt...' : 'Duyệt'}</Button>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog từ chối */}
      <Dialog open={rejectDialog.open} onOpenChange={o => setRejectDialog({ open: o, loan: o ? rejectDialog.loan : null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Từ chối phiếu mượn #{rejectDialog.loan?.id}</DialogTitle></DialogHeader>
          <div className="mb-2">Nhập lý do từ chối:</div>
          <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Lý do..." />
          <DialogFooter>
            <Button onClick={handleRejectSubmit} disabled={rejectLoading || !rejectReason}>{rejectLoading ? 'Đang gửi...' : 'Từ chối'}</Button>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog thêm mượn trả */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Thêm mượn trả mới</DialogTitle></DialogHeader>
          <div className="mb-2">Chọn người mượn:</div>
          <Select value={loanForm.user_id} onValueChange={v => setLoanForm((f: any) => ({ ...f, user_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Chọn người mượn" /></SelectTrigger>
            <SelectContent>
              {usersLoading ? <SelectItem value="loading">Đang tải...</SelectItem> : users.filter(u => u.id).map(u => <SelectItem key={u.id} value={u.id+''}>{u.full_name} ({u.email})</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mb-2 mt-2">Chọn bản sao sách:</div>
          <Select value={loanForm.copy_id} onValueChange={v => setLoanForm((f: any) => ({ ...f, copy_id: v }))}>
            <SelectTrigger><SelectValue placeholder="Chọn bản sao sách" /></SelectTrigger>
            <SelectContent>
              {copiesLoading ? <SelectItem value="loading">Đang tải...</SelectItem> : copies.filter(c => c.id).map(c => <SelectItem key={c.id} value={c.id+''}>{c.copy_code} - {c.book_title}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="mb-2 mt-2">Hạn trả:</div>
          <Input type="date" value={loanForm.due_at} onChange={e => setLoanForm((f: any) => ({ ...f, due_at: e.target.value }))} />
          <div className="mb-2 mt-2">Trạng thái:</div>
          <Select value={loanForm.status} onValueChange={v => setLoanForm((f: any) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="requested">Đã yêu cầu</SelectItem>
              <SelectItem value="borrowed">Đang mượn</SelectItem>
              <SelectItem value="returned">Đã trả</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button onClick={handleAddSubmit}>Thêm</Button>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog sửa mượn trả */}
      <Dialog open={editDialog.open} onOpenChange={o => setEditDialog({ open: o, loan: o ? editDialog.loan : null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>Chỉnh sửa mượn trả #{editDialog.loan?.id}</DialogTitle></DialogHeader>
          <div className="mb-2">Trạng thái:</div>
          <Select value={loanForm.status} onValueChange={v => setLoanForm((f: any) => ({ ...f, status: v }))}>
            <SelectTrigger><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="requested">Đã yêu cầu</SelectItem>
              <SelectItem value="borrowed">Đang mượn</SelectItem>
              <SelectItem value="returned">Đã trả</SelectItem>
              <SelectItem value="overdue">Quá hạn</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <div className="mb-2 mt-2">Hạn trả:</div>
          <Input type="date" value={loanForm.due_at} onChange={e => setLoanForm((f: any) => ({ ...f, due_at: e.target.value }))} />
          <div className="mb-2 mt-2">Tiền phạt (VND):</div>
          <Input type="number" value={loanForm.fine_amount || ''} onChange={e => setLoanForm((f: any) => ({ ...f, fine_amount: e.target.value }))} />
          <div className="mb-2 mt-2">Lý do phạt:</div>
          <Input value={loanForm.fine_note || ''} onChange={e => setLoanForm((f: any) => ({ ...f, fine_note: e.target.value }))} />
          <div className="mb-2 mt-2 flex items-center gap-2">
            <input type="checkbox" checked={!!loanForm.fine_paid} onChange={e => setLoanForm((f: any) => ({ ...f, fine_paid: e.target.checked }))} id="fine_paid" />
            <label htmlFor="fine_paid">Đã nộp phạt</label>
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>Lưu</Button>
            <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
