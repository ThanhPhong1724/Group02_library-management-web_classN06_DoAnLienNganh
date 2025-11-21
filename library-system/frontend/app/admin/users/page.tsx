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
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Clock,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types
interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  role: 'admin' | 'user' | 'student';
  user_type: string;
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'suspended';
  loan_count: number;
  overdue_count: number;
  so_dien_thoai?: string; // Added for API compatibility
  dia_chi?: string; // Added for API compatibility
}

interface UserFilters {
  role: string;
  status: string;
  user_type: string;
  search: string;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  total_pages: number;
}

// Helper ép kiểu role/status về đúng type
const normalizeRole = (role: string): 'admin' | 'user' | 'student' => {
  if (role === 'admin') return 'admin';
  if (role === 'student') return 'student';
  return 'user';
};
const normalizeStatus = (status: string): 'active' | 'inactive' | 'suspended' => {
  if (status === 'active') return 'active';
  if (status === 'suspended') return 'suspended';
  return 'inactive';
};

// Helper: icon theo vai trò
const getUserIcon = (role: string, user_type: string) => {
  if (role === 'admin') return '🛡️';
  if (user_type === 'teacher') return '👩‍🏫';
  if (user_type === 'staff') return '👨‍💼';
  if (user_type === 'researcher') return '🔬';
  if (user_type === 'student') return '🎓';
  return '👤';
};

// Real API adapters
const fetchUsers = async (params: {
  filters: UserFilters;
  page: number;
  limit: number;
}): Promise<UsersResponse> => {
  try {
    const searchParams = new URLSearchParams();
    
    if (params.filters.search) {
      searchParams.append('search', params.filters.search);
    }
    if (params.filters.role && params.filters.role !== 'all') {
      searchParams.append('role', params.filters.role);
    }
    if (params.filters.status && params.filters.status !== 'all') {
      searchParams.append('status', params.filters.status);
    }
    if (params.filters.user_type && params.filters.user_type !== 'all') {
      searchParams.append('user_type', params.filters.user_type);
    }
    
    searchParams.append('page', params.page.toString());
    searchParams.append('limit', params.limit.toString());

    const response = await fetch(`/api/users?${searchParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
      },
    });

    if (!response.ok) {
      throw new Error('Không thể tải danh sách người dùng');
    }

    const data = await response.json();
    // Map so_dien_thoai -> phone, dia_chi -> address cho UI, ép role/status về đúng type
    const items = (data.items || data || []).map((u: any) => ({
      ...u,
      phone: u.phone || u.so_dien_thoai || '',
      address: u.address || u.dia_chi || '',
      role: normalizeRole(u.role),
      status: normalizeStatus(u.status),
    }));
    return {
      items,
      total: data.total || items.length,
      page: data.page || params.page,
      total_pages: Math.ceil((data.total || items.length) / params.limit)
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    // Fallback to mock data if API fails
    return getMockUsers(params);
  }
};

// Mock data fallback
const getMockUsers = (params: { filters: UserFilters; page: number; limit: number }): UsersResponse => {
  const mockUsers: User[] = [
    {
      id: 1,
      full_name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0123456789',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      role: 'user',
      user_type: 'student',
      created_at: '2024-01-15T10:00:00Z',
      last_login: '2024-01-20T14:30:00Z',
      status: 'active',
      loan_count: 3,
      overdue_count: 0
    },
    {
      id: 2,
      full_name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      role: 'user',
      user_type: 'teacher',
      created_at: '2024-01-10T09:00:00Z',
      last_login: '2024-01-19T16:45:00Z',
      status: 'active',
      loan_count: 1,
      overdue_count: 0
    },
    {
      id: 3,
      full_name: 'Lê Văn C',
      email: 'levanc@example.com',
      phone: '0555666777',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      role: 'admin',
      user_type: 'staff',
      created_at: '2023-12-01T08:00:00Z',
      last_login: '2024-01-20T17:20:00Z',
      status: 'active',
      loan_count: 0,
      overdue_count: 0
    },
    {
      id: 4,
      full_name: 'Phạm Thị D',
      email: 'phamthid@example.com',
      phone: '0111222333',
      address: '321 Đường GHI, Quận 4, TP.HCM',
      role: 'user',
      user_type: 'student',
      created_at: '2024-01-05T11:00:00Z',
      last_login: '2024-01-18T13:15:00Z',
      status: 'suspended',
      loan_count: 2,
      overdue_count: 1
    },
    {
      id: 5,
      full_name: 'Hoàng Văn E',
      email: 'hoangvane@example.com',
      phone: '0444555666',
      address: '654 Đường JKL, Quận 5, TP.HCM',
      role: 'user',
      user_type: 'researcher',
      created_at: '2024-01-12T15:00:00Z',
      last_login: '2024-01-20T10:30:00Z',
      status: 'active',
      loan_count: 5,
      overdue_count: 0
    }
  ];

  // Apply filters
  let filteredUsers = mockUsers;
  
  if (params.filters.search) {
    const searchLower = params.filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.full_name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.includes(params.filters.search)
    );
  }
  
  if (params.filters.role && params.filters.role !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.role === params.filters.role);
  }
  
  if (params.filters.status && params.filters.status !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.status === params.filters.status);
  }
  
  if (params.filters.user_type && params.filters.user_type !== 'all') {
    filteredUsers = filteredUsers.filter(user => user.user_type === params.filters.user_type);
  }

  // Pagination
  const startIndex = (params.page - 1) * params.limit;
  const endIndex = startIndex + params.limit;
  const items = filteredUsers.slice(startIndex, endIndex);

  return {
    items,
    total: filteredUsers.length,
    page: params.page,
    total_pages: Math.ceil(filteredUsers.length / params.limit)
  };
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Hoạt động', className: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800' };
      case 'suspended':
        return { label: 'Tạm khóa', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getStatusConfig(status);
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

// Role Badge Component
const RoleBadge = ({ role }: { role: string }) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: 'Quản trị viên', className: 'bg-purple-100 text-purple-800' };
      case 'user':
        return { label: 'Người dùng', className: 'bg-blue-100 text-blue-800' };
      case 'student':
        return { label: 'Sinh viên', className: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getRoleConfig(role);
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

// User Card Component UI mới
const UserCard = ({ user, onEdit, onDelete, onView }: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
}) => (
  <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
    <Card className="h-full flex flex-col shadow-lg rounded-2xl transition-all hover:scale-[1.01] hover:shadow-2xl p-6 md:p-8 min-w-[320px] max-w-full">
      <CardHeader className="pb-3">
        <div style={{position: 'relative'}} className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl shrink-0">{getUserIcon(user.role, user.user_type)}</span>
              <h3 className="font-semibold text-lg md:text-xl text-foreground break-words leading-tight">{user.full_name}</h3>
              {/* <RoleBadge role={user.role} /> */}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <StatusBadge status={user.status} />
              <Badge variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium px-2 py-0.5 rounded-full">
                {user.user_type}
              </Badge>
              <RoleBadge role={user.role} />
            </div>
          </div>
          <div style={{position: 'absolute', right: 0, top: 0}} className="flex gap-1 pr-3 shrink-0">
            <Button size="icon" variant="ghost" onClick={() => onView(user)}><Eye className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(user)}><Edit className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(user)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">SĐT:</span>
            <span className="font-medium">{user.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Địa chỉ:</span>
            <span className="font-medium truncate">{user.address}</span>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              <span>Đang mượn: {user.loan_count}</span>
            </div>
            {user.overdue_count > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <AlertCircle className="h-3 w-3" />
                <span>Quá hạn: {user.overdue_count}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Tham gia: {new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            {user.last_login && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Đăng nhập: {new Date(user.last_login).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Loading skeleton
const UserSkeleton = () => (
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
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

// API helpers
const createUser = async (user: Partial<User> & { password: string }) => {
  const payload = { ...user, so_dien_thoai: user.phone, dia_chi: user.address };
  delete (payload as any).phone;
  delete (payload as any).address;
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Không thể tạo tài khoản');
  return res.json();
};
const updateUser = async (id: number, user: Partial<User>) => {
  const payload = { ...user, so_dien_thoai: user.phone, dia_chi: user.address };
  delete (payload as any).phone;
  delete (payload as any).address;
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('access_token') },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Không thể cập nhật tài khoản');
  return res.json();
};
const deleteUser = async (id: number) => {
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } });
  if (!res.ok) throw new Error('Không thể xóa tài khoản');
  return res.json();
};
const changeUserStatus = async (id: number, status: string) => {
  const res = await fetch(`/api/users/${id}/status?status=${status}`, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } });
  if (!res.ok) throw new Error('Không thể đổi trạng thái');
  return res.json();
};
const changeUserRole = async (id: number, role: string) => {
  const res = await fetch(`/api/users/${id}/role?role=${role}`, { method: 'PATCH', headers: { 'Authorization': 'Bearer ' + localStorage.getItem('access_token') } });
  if (!res.ok) throw new Error('Không thể đổi quyền');
  return res.json();
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    role: 'all',
    status: 'all',
    user_type: 'all',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  const itemsPerPage = 10;

  // Thêm state cho modal form
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});
  const [showDetail, setShowDetail] = useState<User | null>(null);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const result = await fetchUsers({
          filters,
          page: currentPage,
          limit: 12
        });
        if (currentPage === 1) {
          setUsers(result.items);
        } else {
          setUsers(prev => [...prev, ...result.items]);
        }
        setTotalPages(result.total_pages);
        setTotalUsers(result.total);
      } catch (error) {
        toast.error('Không thể tải danh sách người dùng');
        console.error('Error loading users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
    // eslint-disable-next-line
  }, [filters, currentPage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  // Thay đổi: bỏ phân trang số, thêm nút Xem thêm
  {!isLoading && users.length < totalUsers && (
    <div className="flex justify-center mt-6">
      <Button onClick={() => setCurrentPage(prev => prev + 1)}>
        Xem thêm
      </Button>
    </div>
  )}

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setUsers([]);
  };

  const clearFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      user_type: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  // Thêm các handler CRUD
  const handleAddUser = () => {
    setEditUser(null);
    setForm({ full_name: '', email: '', phone: '', address: '', role: 'user', user_type: 'student', status: 'active', password: '' });
    setShowDialog(true);
  };
  const handleEdit = (user: User) => {
    setEditUser(user);
    setForm({ ...user, password: '' });
    setShowDialog(true);
  };
  const handleDelete = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${user.full_name}"?`)) return;
    try {
      await deleteUser(user.id);
      toast.success('Đã xóa tài khoản');
      setUsers(users => users.filter(u => u.id !== user.id));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  // Khi gọi API create/update user, map phone <-> so_dien_thoai
  const handleSave = async () => {
    try {
      if (editUser) {
        await updateUser(editUser.id, form);
        toast.success('Cập nhật thành công');
      } else {
        if (!form.password) throw new Error('Vui lòng nhập mật khẩu');
        await createUser(form as any);
        toast.success('Tạo mới thành công');
      }
      setShowDialog(false);
      setCurrentPage(1);
      // Reload users
      const result = await fetchUsers({ filters, page: 1, limit: itemsPerPage });
      setUsers(result.items);
      setTotalPages(result.total_pages);
      setTotalUsers(result.total);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleChangeStatus = async (user: User, status: string) => {
    try {
      await changeUserStatus(user.id, status);
      toast.success('Đã đổi trạng thái');
      setUsers(users => users.map(u => u.id === user.id ? { ...u, status: normalizeStatus(status) } : u));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleChangeRole = async (user: User, role: string) => {
    try {
      await changeUserRole(user.id, role);
      toast.success('Đã đổi quyền');
      setUsers(users => users.map(u => u.id === user.id ? { ...u, role: normalizeRole(role) } : u));
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleView = (user: User) => {
    setShowDetail(user);
  };

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý thành viên</h1>
              <p className="text-gray-600">
                Quản lý thông tin và quyền hạn của tất cả thành viên thư viện
              </p>
            </div>
            <Button onClick={handleAddUser} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Thêm thành viên
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
                      placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
                  <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả vai trò</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                      <SelectItem value="user">Người dùng</SelectItem>
                      <SelectItem value="student">Sinh viên</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                      <SelectItem value="suspended">Tạm khóa</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.user_type} onValueChange={(value) => handleFilterChange('user_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Loại thành viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="student">Sinh viên</SelectItem>
                      <SelectItem value="teacher">Giáo viên</SelectItem>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="researcher">Nghiên cứu viên</SelectItem>
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
                    Tìm thấy {totalUsers} thành viên
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Users Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <UserSkeleton key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy thành viên</h3>
                <p className="text-muted-foreground mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {/* Sửa: bỏ phân trang số, thêm nút Xem thêm */}
          {!isLoading && users.length < totalUsers && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog Thêm/Sửa user */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editUser ? 'Sửa thành viên' : 'Thêm thành viên'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Họ tên" value={form.full_name || ''} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
            <Input placeholder="Email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <Input placeholder="Số điện thoại" value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input placeholder="Địa chỉ" value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            <Select value={form.role || 'user'} onValueChange={v => setForm(f => ({ ...f, role: normalizeRole(v) }))}>
              <SelectTrigger><SelectValue placeholder="Vai trò" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Quản trị viên</SelectItem>
                <SelectItem value="user">Người dùng</SelectItem>
                <SelectItem value="student">Sinh viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.user_type || 'student'} onValueChange={v => setForm(f => ({ ...f, user_type: v }))}>
              <SelectTrigger><SelectValue placeholder="Loại thành viên" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Sinh viên</SelectItem>
                <SelectItem value="teacher">Giáo viên</SelectItem>
                <SelectItem value="staff">Nhân viên</SelectItem>
                <SelectItem value="researcher">Nghiên cứu viên</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.status || 'active'} onValueChange={v => setForm(f => ({ ...f, status: normalizeStatus(v) }))}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="suspended">Tạm khóa</SelectItem>
              </SelectContent>
            </Select>
            {!editUser && (
              <Input placeholder="Mật khẩu" type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
              <Button onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal xem chi tiết user */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết thành viên</DialogTitle>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-2">
              <div><b>Họ tên:</b> {showDetail.full_name}</div>
              <div><b>Email:</b> {showDetail.email}</div>
              <div><b>SĐT:</b> {showDetail.phone}</div>
              <div><b>Địa chỉ:</b> {showDetail.address}</div>
              <div><b>Vai trò:</b> {showDetail.role}</div>
              <div><b>Loại:</b> {showDetail.user_type}</div>
              <div><b>Trạng thái:</b> {showDetail.status}</div>
              <div><b>Ngày tạo:</b> {new Date(showDetail.created_at).toLocaleString('vi-VN')}</div>
              {showDetail.last_login && <div><b>Đăng nhập cuối:</b> {new Date(showDetail.last_login).toLocaleString('vi-VN')}</div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
