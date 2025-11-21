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
  Bell, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { notificationsAPI } from '@/lib/api';
import { useMediaQuery } from 'usehooks-ts';
import { useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Types
interface Notification {
  id: number;
  title: string;
  body?: string;
  type: string;
  target_audience?: string;
  status?: string;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at?: string;
  read_count?: number;
  total_recipients?: number;
}

interface NotificationFilters {
  type: string;
  status: string;
  target_audience: string;
  search: string;
}

interface NotificationsResponse {
  items: Notification[];
  total: number;
  page: number;
  total_pages: number;
}

// Mock data
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'Thông báo về giờ mở cửa mới',
    body: 'Từ ngày 01/01/2025, thư viện sẽ mở cửa từ 6:00 - 22:00 hàng ngày để phục vụ tốt hơn nhu cầu học tập của sinh viên.',
    type: 'info',
    target_audience: 'all',
    status: 'sent',
    sent_at: '2024-12-20T08:00:00Z',
    created_at: '2024-12-19T10:00:00Z',
    updated_at: '2024-12-20T08:00:00Z',
    read_count: 1250,
    total_recipients: 1500
  },
  {
    id: 2,
    title: 'Nhắc nhở trả sách quá hạn',
    body: 'Các bạn sinh viên có sách quá hạn vui lòng trả sách sớm để tránh bị phạt và ảnh hưởng đến việc mượn sách mới.',
    type: 'warning',
    target_audience: 'students',
    status: 'sent',
    sent_at: '2024-12-19T09:00:00Z',
    created_at: '2024-12-18T15:00:00Z',
    updated_at: '2024-12-19T09:00:00Z',
    read_count: 890,
    total_recipients: 1200
  },
  {
    id: 3,
    title: 'Thông báo về dịch vụ mới',
    body: 'Thư viện đã triển khai dịch vụ mượn sách tự động 24/7 tại khu vực cửa chính. Các bạn có thể sử dụng dịch vụ này mọi lúc.',
    type: 'success',
    target_audience: 'all',
    status: 'scheduled',
    scheduled_at: '2024-12-25T08:00:00Z',
    created_at: '2024-12-20T14:00:00Z',
    updated_at: '2024-12-20T14:00:00Z',
    read_count: 0,
    total_recipients: 1500
  },
  {
    id: 4,
    title: 'Bảo trì hệ thống thư viện số',
    body: 'Hệ thống thư viện số sẽ được bảo trì từ 22:00 - 06:00 ngày 26/12/2024. Trong thời gian này, một số tính năng có thể bị gián đoạn.',
    type: 'error',
    target_audience: 'all',
    status: 'draft',
    created_at: '2024-12-20T16:00:00Z',
    updated_at: '2024-12-20T16:00:00Z',
    read_count: 0,
    total_recipients: 1500
  },
  {
    id: 5,
    title: 'Thông báo về sách mới',
    body: 'Thư viện đã bổ sung 500 đầu sách mới thuộc các lĩnh vực công nghệ, kinh tế và văn học. Các bạn có thể tìm kiếm và mượn sách mới.',
    type: 'info',
    target_audience: 'all',
    status: 'sent',
    sent_at: '2024-12-18T10:00:00Z',
    created_at: '2024-12-17T16:00:00Z',
    updated_at: '2024-12-18T10:00:00Z',
    read_count: 1100,
    total_recipients: 1500
  }
];

// Mock API adapter
const fetchNotifications = async (params: {
  filters: NotificationFilters;
  page: number;
  limit: number;
}): Promise<NotificationsResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Apply filters
  let filteredNotifications = mockNotifications;
  
  if (params.filters.search) {
    const searchLower = params.filters.search.toLowerCase();
    filteredNotifications = filteredNotifications.filter(notification => 
      notification.title.toLowerCase().includes(searchLower) ||
      notification.body?.toLowerCase().includes(searchLower)
    );
  }
  
  if (params.filters.type && params.filters.type !== 'all') {
    filteredNotifications = filteredNotifications.filter(notification => notification.type === params.filters.type);
  }
  
  if (params.filters.status && params.filters.status !== 'all') {
    filteredNotifications = filteredNotifications.filter(notification => notification.status === params.filters.status);
  }
  
  if (params.filters.target_audience && params.filters.target_audience !== 'all') {
    filteredNotifications = filteredNotifications.filter(notification => notification.target_audience === params.filters.target_audience);
  }

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const items = filteredNotifications.slice(startIndex, endIndex);

  return {
    items,
    total: filteredNotifications.length,
    page: params.page,
    total_pages: Math.ceil(filteredNotifications.length / params.limit)
  };
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Bản nháp', className: 'bg-gray-100 text-gray-800', icon: Clock };
      case 'sent':
        return { label: 'Đã gửi', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'scheduled':
        return { label: 'Đã lên lịch', className: 'bg-blue-100 text-blue-800', icon: Clock };
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

// Cập nhật TypeBadge để phân loại rõ ràng hơn
const TypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'loan_request':
        return { label: 'Yêu cầu mượn sách', className: 'bg-blue-100 text-blue-800', icon: BookOpen };
      case 'return_request':
        return { label: 'Yêu cầu trả sách', className: 'bg-cyan-100 text-cyan-800', icon: BookOpen };
      case 'loan_approved':
        return { label: 'Duyệt mượn sách', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'loan_rejected':
        return { label: 'Từ chối mượn sách', className: 'bg-red-100 text-red-800', icon: XCircle };
      case 'loan_fined':
        return { label: 'Phạt trả trễ', className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
      case 'loan_returned':
        return { label: 'Trả sách', className: 'bg-purple-100 text-purple-800', icon: BookOpen };
      case 'overdue_warning':
        return { label: 'Cảnh báo quá hạn', className: 'bg-orange-100 text-orange-800', icon: AlertCircle };
      case 'fine_confirmed':
        return { label: 'Xác nhận nộp phạt', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'account_locked':
        return { label: 'Khóa tài khoản', className: 'bg-red-100 text-red-800', icon: XCircle };
      case 'account_unlocked':
        return { label: 'Mở khóa tài khoản', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'role_changed':
        return { label: 'Thay đổi vai trò', className: 'bg-indigo-100 text-indigo-800', icon: Users };
      case 'system':
        return { label: 'Thông báo hệ thống', className: 'bg-gray-100 text-gray-800', icon: Bell };
      case 'policy_update':
        return { label: 'Cập nhật chính sách', className: 'bg-blue-100 text-blue-800', icon: Bell };
      case 'event':
        return { label: 'Sự kiện', className: 'bg-pink-100 text-pink-800', icon: Bell };
      case 'new_book':
        return { label: 'Sách mới', className: 'bg-green-100 text-green-800', icon: BookOpen };
      case 'broadcast':
        return { label: 'Broadcast', className: 'bg-indigo-100 text-indigo-800', icon: Users };
      default:
        return { label: type, className: 'bg-gray-100 text-gray-800', icon: Bell };
    }
  };
  const config = getTypeConfig(type);
  const Icon = config.icon;
  return (
    <Badge className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      style={{ minWidth: 0 }}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Target Audience Badge Component
const TargetAudienceBadge = ({ audience }: { audience: string }) => {
  const getAudienceConfig = (audience: string) => {
    switch (audience) {
      case 'all':
        return { label: 'Tất cả', className: 'bg-purple-100 text-purple-800', icon: Users };
      case 'students':
        return { label: 'Sinh viên', className: 'bg-blue-100 text-blue-800', icon: Users };
      case 'teachers':
        return { label: 'Giáo viên', className: 'bg-green-100 text-green-800', icon: Users };
      case 'staff':
        return { label: 'Nhân viên', className: 'bg-orange-100 text-orange-800', icon: Users };
      case 'specific':
        return { label: 'Cụ thể', className: 'bg-gray-100 text-gray-800', icon: Users };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800', icon: Users };
    }
  };

  const config = getAudienceConfig(audience);
  const Icon = config.icon;
  
  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

function extractLoanId(text: string | undefined): string | null {
  if (!text) return null;
  const match = text.match(/ID bản sao: (\d+)/) || text.match(/ID phiếu mượn: (\d+)/);
  return match ? match[1] : null;
}

const NotificationCard = ({ notification, onEdit, onDelete, onView, viewMode }: {
  notification: Notification;
  onEdit: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
  onView: (notification: Notification) => void;
  viewMode: 'grid' | 'list';
}) => {
  const router = useRouter();
  const loanId = extractLoanId(notification.body) || extractLoanId(notification.title);
  // Người gửi: nếu type là system/broadcast thì là Admin, còn lại là Hệ thống
  const sender = ['system', 'broadcast'].includes(notification.type) ? 'Admin' : 'Hệ thống';
  // Click chuyển trang nếu có loanId
  const handleCardClick = () => {
    if (loanId) {
      router.push(`/admin/loans?loan_id=${loanId}`);
    } else {
      onView(notification);
    }
  };
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
      onClick={handleCardClick}
    >
      <Card className={`h-full w-full max-w-full min-w-[260px] md:min-w-[320px] p-5 md:p-6 flex flex-col ${viewMode === 'grid' ? 'shadow-lg rounded-2xl' : ''}`}>
        <CardHeader className="pb-3 flex flex-row items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Chỉ giữ lại TypeBadge có icon + màu sắc */}
            <div className="mb-2">
              <TypeBadge type={notification.type} />
            </div>
            {/* Title riêng biệt */}
            <h3 className="font-semibold text-lg line-clamp-2 mb-2" title={notification.title}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">Gửi bởi: <span className="font-medium">{sender}</span></span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onView(notification); }}>
              <Eye className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); onEdit(notification); }}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={e => { e.stopPropagation(); onDelete(notification); }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {notification.body}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {loanId && (
                <Button variant="link" size="sm" className="p-0 h-auto align-baseline" onClick={e => { e.stopPropagation(); router.push(`/admin/loans?loan_id=${loanId}`); }}>
                  Xem phiếu mượn
                </Button>
              )}
              <span>{new Date(notification.created_at).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Notification Skeleton Component
const NotificationSkeleton = () => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </CardContent>
  </Card>
);

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]); // To store all fetched notifications
  const [notifications, setNotifications] = useState<Notification[]>([]); // To display
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    target_audience: 'all',
    search: ''
  });
  const PAGE_SIZE = 12;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: 'system',
    title: '',
    body: '',
    user_type: 'all',
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // State cho modal sửa
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [editForm, setEditForm] = useState({
    type: '',
    title: '',
    body: '',
    user_type: 'all',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  // State cho modal xóa
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all notifications from API once
  const loadAllNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      if (res.success && Array.isArray(res.data)) {
        setAllNotifications(res.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          body: n.body || '',
          type: n.type || 'info',
          target_audience: 'all', // API chưa có trường này
          status: 'sent', // API chưa có trường này
          created_at: n.created_at,
          updated_at: n.created_at,
          read_count: 0,
          total_recipients: 0,
        })));
      } else {
        setAllNotifications([]);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách thông báo');
      setAllNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter, search, and paginate notifications with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      let filtered = allNotifications;
      
      // Search filter
      if (filters.search.trim()) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(n =>
          n.title.toLowerCase().includes(searchLower) ||
          (n.body || '').toLowerCase().includes(searchLower)
        );
      }
      
      // Type filter
      if (filters.type !== 'all') {
        filtered = filtered.filter(n => n.type === filters.type);
      }
      
      // Status filter - chỉ áp dụng nếu có dữ liệu status thật
      if (filters.status !== 'all' && filtered.some(n => n.status)) {
        filtered = filtered.filter(n => n.status === filters.status);
      }
      
      // Target audience filter - chỉ áp dụng nếu có dữ liệu target_audience thật
      if (filters.target_audience !== 'all' && filtered.some(n => n.target_audience)) {
        filtered = filtered.filter(n => n.target_audience === filters.target_audience);
      }
      
      setTotalNotifications(filtered.length);
      setNotifications(filtered.slice(0, currentPage * PAGE_SIZE));
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [allNotifications, filters, currentPage]);

  useEffect(() => {
    loadAllNotifications();
    // eslint-disable-next-line
  }, []);

  // Handle load more
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      setCurrentPage(prev => prev + 1);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      target_audience: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  // Handle actions (giữ nguyên)
  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setEditForm({
      type: notification.type,
      title: notification.title,
      body: notification.body || '',
      user_type: notification.target_audience || 'all',
    });
  };
  // Khi bấm Delete
  const handleDelete = (notification: Notification) => {
    setDeletingNotification(notification);
  };
  const handleView = (notification: Notification) => {
    toast.info('Chức năng xem chi tiết sẽ được triển khai sau');
  };
  const handleCreate = () => {
    setShowCreateModal(true);
  };
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    // Lấy giá trị form mới nhất từ e.target
    const formData = new FormData(e.currentTarget);
    const type = formData.get('type') as string;
    const user_type = formData.get('user_type') as string;
    const title = formData.get('title') as string;
    const body = formData.get('body') as string;
    try {
      const res = await notificationsAPI.sendSystem({ type, user_type, title, body });
      if (res.success) {
        toast.success('Đã gửi thông báo thành công!');
        setShowCreateModal(false);
        setCreateForm({ type: 'system', title: '', body: '', user_type: 'all' });
        loadAllNotifications();
      } else {
        toast.error(res.error || 'Gửi thông báo thất bại');
      }
    } catch (err) {
      toast.error('Gửi thông báo thất bại');
    } finally {
      setIsSending(false);
    }
  };

  // Submit sửa
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNotification) return;
    setIsUpdating(true);
    try {
      const res = await notificationsAPI.update(editingNotification.id, editForm);
      if (res.success) {
        toast.success('Đã cập nhật thông báo!');
        setEditingNotification(null);
        loadAllNotifications();
      } else {
        toast.error(res.error || 'Cập nhật thất bại');
      }
    } catch (err) {
      toast.error('Cập nhật thất bại');
    } finally {
      setIsUpdating(false);
    }
  };

  // Submit xóa
  const handleDeleteConfirm = async () => {
    if (!deletingNotification) return;
    setIsDeleting(true);
    try {
      const res = await notificationsAPI.delete(deletingNotification.id);
      if (res.success) {
        toast.success('Đã xóa thông báo!');
        setDeletingNotification(null);
        loadAllNotifications();
      } else {
        toast.error(res.error || 'Xóa thất bại');
      }
    } catch (err) {
      toast.error('Xóa thất bại');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DefaultLayout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý thông báo</h1>
              <p className="text-muted-foreground">
                Gửi và quản lý thông báo cho người dùng thư viện
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                aria-label="Chế độ lưới"
                size="icon"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="11" y="3" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="3" y="11" width="6" height="6" rx="1.5" fill="currentColor"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                aria-label="Chế độ danh sách"
                size="icon"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="4" width="14" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="9" width="14" height="3" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="14" height="3" rx="1.5" fill="currentColor"/></svg>
              </Button>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Tạo thông báo mới
              </Button>
            </div>
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
                      placeholder="Tìm kiếm theo tiêu đề hoặc nội dung thông báo..."
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Loại thông báo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" key="all-type">Tất cả loại</SelectItem>
                      <SelectItem value="system" key="system">Thông báo hệ thống</SelectItem>
                      <SelectItem value="loan_request" key="loan_request">Yêu cầu mượn sách</SelectItem>
                      <SelectItem value="return_request" key="return_request">Yêu cầu trả sách</SelectItem>
                      <SelectItem value="loan_approved" key="loan_approved">Duyệt mượn sách</SelectItem>
                      <SelectItem value="loan_rejected" key="loan_rejected">Từ chối mượn sách</SelectItem>
                      <SelectItem value="loan_fined" key="loan_fined">Phạt trả trễ</SelectItem>
                      <SelectItem value="loan_returned" key="loan_returned">Trả sách</SelectItem>
                      <SelectItem value="overdue_warning" key="overdue_warning">Cảnh báo quá hạn</SelectItem>
                      <SelectItem value="fine_confirmed" key="fine_confirmed">Xác nhận nộp phạt</SelectItem>
                      <SelectItem value="account_locked" key="account_locked">Khóa tài khoản</SelectItem>
                      <SelectItem value="account_unlocked" key="account_unlocked">Mở khóa tài khoản</SelectItem>
                      <SelectItem value="role_changed" key="role_changed">Thay đổi vai trò</SelectItem>
                      <SelectItem value="policy_update" key="policy_update">Cập nhật chính sách</SelectItem>
                      <SelectItem value="event" key="event">Sự kiện</SelectItem>
                      <SelectItem value="new_book" key="new_book">Sách mới</SelectItem>
                      <SelectItem value="broadcast" key="broadcast">Broadcast</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" key="all-status">Tất cả trạng thái</SelectItem>
                      <SelectItem value="draft" key="draft">Bản nháp</SelectItem>
                      <SelectItem value="sent" key="sent">Đã gửi</SelectItem>
                      <SelectItem value="scheduled" key="scheduled">Đã lên lịch</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.target_audience} onValueChange={(value) => handleFilterChange('target_audience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Đối tượng nhận" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" key="all-audience">Tất cả đối tượng</SelectItem>
                      <SelectItem value="students" key="students">Sinh viên</SelectItem>
                      <SelectItem value="teachers" key="teachers">Giáo viên</SelectItem>
                      <SelectItem value="staff" key="staff">Nhân viên</SelectItem>
                      <SelectItem value="specific" key="specific">Cụ thể</SelectItem>
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
                    Tìm thấy {totalNotifications} thông báo
                    {(filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.target_audience !== 'all') && 
                      ` (đã lọc từ ${allNotifications.length} thông báo)`
                    }
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Notifications Grid/List */}
          {isLoading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr' : 'flex flex-col gap-4'}>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <NotificationSkeleton key={i} />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy thông báo</h3>
                <p className="text-muted-foreground mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr' : 'flex flex-col gap-4'}>
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
          {/* Nút Xem thêm */}
          {!isLoading && notifications.length < totalNotifications && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="min-w-[120px]"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang tải...
                  </>
                ) : (
                  `Xem thêm (${totalNotifications - notifications.length} còn lại)`
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo thông báo mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại thông báo</label>
              <Select name="type" value={createForm.type} onValueChange={v => setCreateForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Hệ thống</SelectItem>
                  <SelectItem value="policy_update">Cập nhật chính sách</SelectItem>
                  <SelectItem value="event">Sự kiện</SelectItem>
                  <SelectItem value="new_book">Sách mới</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={createForm.type} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đối tượng nhận</label>
              <Select name="user_type" value={createForm.user_type} onValueChange={v => setCreateForm(f => ({ ...f, user_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="students">Sinh viên</SelectItem>
                  <SelectItem value="teachers">Giáo viên</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="user_type" value={createForm.user_type} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <Input name="title" value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} required maxLength={200} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea name="body" className="w-full border rounded p-2 min-h-[80px]" value={createForm.body} onChange={e => setCreateForm(f => ({ ...f, body: e.target.value }))} required maxLength={1000} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={isSending}>Hủy</Button>
              <Button type="submit" disabled={isSending || !createForm.title.trim() || !createForm.body.trim()}>
                {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal sửa thông báo */}
      <Dialog open={!!editingNotification} onOpenChange={v => { if (!v) setEditingNotification(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sửa thông báo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Loại thông báo</label>
              <Select name="type" value={editForm.type} onValueChange={v => setEditForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">Hệ thống</SelectItem>
                  <SelectItem value="policy_update">Cập nhật chính sách</SelectItem>
                  <SelectItem value="event">Sự kiện</SelectItem>
                  <SelectItem value="new_book">Sách mới</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                  <SelectItem value="loan_request">Yêu cầu mượn sách</SelectItem>
                  <SelectItem value="return_request">Yêu cầu trả sách</SelectItem>
                  <SelectItem value="loan_approved">Duyệt mượn sách</SelectItem>
                  <SelectItem value="loan_rejected">Từ chối mượn sách</SelectItem>
                  <SelectItem value="loan_fined">Phạt trả trễ</SelectItem>
                  <SelectItem value="loan_returned">Trả sách</SelectItem>
                  <SelectItem value="overdue_warning">Cảnh báo quá hạn</SelectItem>
                  <SelectItem value="fine_confirmed">Xác nhận nộp phạt</SelectItem>
                  <SelectItem value="account_locked">Khóa tài khoản</SelectItem>
                  <SelectItem value="account_unlocked">Mở khóa tài khoản</SelectItem>
                  <SelectItem value="role_changed">Thay đổi vai trò</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={editForm.type} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Đối tượng nhận</label>
              <Select name="user_type" value={editForm.user_type} onValueChange={v => setEditForm(f => ({ ...f, user_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="students">Sinh viên</SelectItem>
                  <SelectItem value="teachers">Giáo viên</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="user_type" value={editForm.user_type} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <Input name="title" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} required maxLength={200} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea name="body" className="w-full border rounded p-2 min-h-[80px]" value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} required maxLength={1000} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingNotification(null)} disabled={isUpdating}>Hủy</Button>
              <Button type="submit" disabled={isUpdating || !editForm.title.trim() || !editForm.body.trim()}>
                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal xác nhận xóa */}
      <Dialog open={!!deletingNotification} onOpenChange={v => { if (!v) setDeletingNotification(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa thông báo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa thông báo này không?</p>
            <div className="mt-2 font-semibold">{deletingNotification?.title}</div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeletingNotification(null)} disabled={isDeleting}>Hủy</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
