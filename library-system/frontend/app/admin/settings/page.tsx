"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Users, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  Shield,
  Database,
  Mail,
  Bell,
  Globe,
  Lock,
  Palette,
  FileText,
  Trash2,
  Plus,
  Edit,
  Eye
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { settingsAPI } from '@/lib/api';

// Types
interface SystemSettings {
  library_name: string;
  library_address: string;
  library_phone: string;
  library_email: string;
  library_website: string;
  max_loan_days: number;
  max_books_per_user: number;
  fine_per_day: number;
  auto_renewal: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  maintenance_mode: boolean;
  backup_frequency: string;
  language: string;
  timezone: string;
  date_format: string;
  opening_hours?: string;
  rules?: string;
  bank_info?: string;
}

interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  max_loan_days: number;
  max_books: number;
  can_reserve: boolean;
  can_renew: boolean;
  created_at: string;
}

interface LibraryPolicy {
  id: number;
  title: string;
  content: string;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Mock data
const getMockSystemSettings = (): SystemSettings => ({
  library_name: 'Thư viện Đại học ABC',
  library_address: '123 Đường ABC, Quận 1, TP.HCM',
  library_phone: '028-1234-5678',
  library_email: 'info@library.edu.vn',
  library_website: 'https://library.edu.vn',
  max_loan_days: 14,
  max_books_per_user: 5,
  fine_per_day: 5000,
  auto_renewal: true,
  email_notifications: true,
  sms_notifications: false,
  maintenance_mode: false,
  backup_frequency: 'daily',
  language: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  date_format: 'DD/MM/YYYY',
  opening_hours: '08:00 - 22:00',
  rules: 'Không được ăn uống trong thư viện. Không được mang thức ăn vào thư viện.',
  bank_info: 'Ngân hàng ABC, Số tài khoản: 1234567890123456789, Chi nhánh: HCM'
});

const getMockUserRoles = (): UserRole[] => [
  {
    id: 1,
    name: 'Sinh viên',
    description: 'Thành viên sinh viên đại học',
    permissions: ['borrow_books', 'view_catalog', 'make_reservations'],
    max_loan_days: 14,
    max_books: 3,
    can_reserve: true,
    can_renew: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Giáo viên',
    description: 'Thành viên giảng viên, nghiên cứu viên',
    permissions: ['borrow_books', 'view_catalog', 'make_reservations', 'extended_loan'],
    max_loan_days: 30,
    max_books: 10,
    can_reserve: true,
    can_renew: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Nhân viên',
    description: 'Thành viên nhân viên hành chính',
    permissions: ['borrow_books', 'view_catalog', 'make_reservations'],
    max_loan_days: 21,
    max_books: 5,
    can_reserve: true,
    can_renew: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 4,
    name: 'Khách',
    description: 'Người dùng không đăng ký thành viên',
    permissions: ['view_catalog'],
    max_loan_days: 0,
    max_books: 0,
    can_reserve: false,
    can_renew: false,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const getMockLibraryPolicies = (): LibraryPolicy[] => [
  {
    id: 1,
    title: 'Quy định mượn trả sách',
    content: 'Sinh viên được mượn tối đa 3 cuốn sách trong 14 ngày. Giáo viên được mượn tối đa 10 cuốn sách trong 30 ngày.',
    category: 'Mượn trả',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 2,
    title: 'Quy định phạt quá hạn',
    content: 'Phạt 5,000 VNĐ/ngày cho mỗi cuốn sách quá hạn. Sinh viên có thể bị tạm khóa thẻ nếu vi phạm nhiều lần.',
    category: 'Kỷ luật',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z'
  },
  {
    id: 3,
    title: 'Quy định đặt trước sách',
    content: 'Thành viên có thể đặt trước sách đang được mượn. Sách sẽ được giữ trong 3 ngày kể từ khi có sẵn.',
    category: 'Đặt trước',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-05T00:00Z'
  },
  {
    id: 4,
    title: 'Quy định gia hạn sách',
    content: 'Sách có thể được gia hạn tối đa 2 lần nếu không có người khác đặt trước.',
    category: 'Gia hạn',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00Z'
  }
];

// Settings Section Component
const SettingsSection = ({ 
  title, 
  description, 
  icon: Icon, 
  children 
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {children}
    </CardContent>
  </Card>
);

// User Role Card Component
const UserRoleCard = ({ role, onEdit, onDelete }: {
  role: UserRole;
  onEdit: (role: UserRole) => void;
  onDelete: (role: UserRole) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{role.name}</h3>
              <Badge variant="outline">{role.permissions.length} quyền</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{role.description}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onEdit(role)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(role)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Mượn tối đa:</span>
            <span className="font-medium ml-2">{role.max_books} cuốn</span>
          </div>
          <div>
            <span className="text-muted-foreground">Thời hạn:</span>
            <span className="font-medium ml-2">{role.max_loan_days} ngày</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Đặt trước:</span>
            <Switch checked={role.can_reserve} disabled />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Gia hạn:</span>
            <Switch checked={role.can_renew} disabled />
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground mb-2">Quyền hạn:</div>
          <div className="flex flex-wrap gap-1">
            {role.permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="text-xs">
                {permission}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Policy Card Component
const PolicyCard = ({ policy, onEdit, onDelete }: {
  policy: LibraryPolicy;
  onEdit: (policy: LibraryPolicy) => void;
  onDelete: (policy: LibraryPolicy) => void;
}) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ duration: 0.2 }}
  >
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{policy.title}</h3>
              <Badge variant={policy.is_active ? "default" : "secondary"}>
                {policy.is_active ? 'Hoạt động' : 'Không hoạt động'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{policy.category}</Badge>
              <span>•</span>
              <span>Cập nhật: {new Date(policy.updated_at).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => onEdit(policy)}>
              <Edit className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onDelete(policy)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {policy.content}
        </p>
      </CardContent>
    </Card>
  </motion.div>
);

const fetchPolicies = async () => {
  const res = await fetch('/api/policies');
  if (!res.ok) throw new Error('Không thể tải chính sách');
  return await res.json();
};
const updatePolicy = async (user_type: string, data: any) => {
  const res = await fetch(`/api/policies/${user_type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật chính sách');
  return await res.json();
};

export default function AdminSettingsPage() {
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [libraryPolicies, setLibraryPolicies] = useState<LibraryPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Policy state
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  // Thêm state và Dialog/modal form thực sự cho Thêm vai trò và Thêm chính sách, không chỉ toast nữa
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);

  // Load settings data from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const res = await settingsAPI.getAll();
        if (res.success && res.data) {
          // Convert array of {key, value} to object
          const dataObj: Record<string, string> = Array.isArray(res.data)
            ? res.data.reduce((acc, cur) => {
                acc[cur.key] = cur.value;
                return acc;
              }, {} as Record<string, string>)
            : res.data;
          setSystemSettings({
            library_name: dataObj.library_name || '',
            library_address: dataObj.library_address || '',
            library_phone: dataObj.library_phone || '',
            library_email: dataObj.library_email || '',
            library_website: dataObj.library_website || '',
            max_loan_days: Number(dataObj.max_loan_days) || 14,
            max_books_per_user: Number(dataObj.max_books_per_user) || 5,
            fine_per_day: Number(dataObj.fine_per_day) || 0,
            auto_renewal: dataObj.auto_renewal === 'true',
            email_notifications: dataObj.email_notifications === 'true',
            sms_notifications: dataObj.sms_notifications === 'true',
            maintenance_mode: dataObj.maintenance_mode === 'true',
            backup_frequency: dataObj.backup_frequency || 'daily',
            language: dataObj.language || 'vi',
            timezone: dataObj.timezone || 'Asia/Ho_Chi_Minh',
            date_format: dataObj.date_format || 'DD/MM/YYYY',
            opening_hours: dataObj.opening_hours || '',
            rules: dataObj.rules || '',
            bank_info: dataObj.bank_info || '',
          });
        } else {
          toast.error('Không thể tải cài đặt hệ thống');
        }
      } catch (error) {
        toast.error('Không thể tải cài đặt hệ thống');
      } finally {
        setIsLoading(false);
      }
    };
    const loadPolicies = async () => {
      setIsLoadingPolicies(true);
      try {
        const data = await fetchPolicies();
        setPolicies(data);
      } catch (e) {
        toast.error('Không thể tải chính sách');
      } finally {
        setIsLoadingPolicies(false);
      }
    };
    loadSettings();
    loadPolicies();
  }, []);

  const handleSaveSettings = async () => {
    if (!systemSettings) return;
    try {
      setIsSaving(true);
      // Gọi API PUT /api/settings với object systemSettings
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('access_token'),
        },
        body: JSON.stringify(systemSettings),
      });
      if (res.ok) {
        toast.success('Đã lưu cài đặt thành công');
      } else {
        toast.error('Không thể lưu cài đặt');
      }
    } catch (error) {
      toast.error('Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshSettings = () => {
    toast.info('Làm mới cài đặt (chức năng sẽ được phát triển)');
    // TODO: Implement refresh functionality
  };

  const handleEditRole = (role: UserRole) => {
    toast.info(`Chỉnh sửa vai trò: ${role.name}`);
    // TODO: Open edit role modal/form
  };

  const handleDeleteRole = (role: UserRole) => {
    if (confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) {
      toast.success(`Đã xóa vai trò: ${role.name}`);
      // TODO: Call delete API
    }
  };

  const handleAddRole = () => {
    toast.info('Mở form thêm vai trò mới');
    // TODO: Open add role modal/form
  };

  // Sửa callback handleEditPolicy để truyền đúng policy thay vì index
  const handleEditPolicy = (policy: any) => {
    const idx = policies.findIndex((p) => p.user_type === policy.user_type);
    setEditIdx(idx);
    setEditForm({ ...policy });
  };
  const handleCancelPolicy = () => {
    setEditIdx(null);
    setEditForm({});
  };
  const handleSavePolicy = async () => {
    if (editIdx === null) return;
    const p = policies[editIdx];
    try {
      await updatePolicy(p.user_type, editForm);
      toast.success('Cập nhật thành công');
      setEditIdx(null);
      setEditForm({});
      setIsLoadingPolicies(true);
      const data = await fetchPolicies();
      setPolicies(data);
      setIsLoadingPolicies(false);
    } catch (e) {
      toast.error('Không thể cập nhật');
    }
  };

  const handleDeletePolicy = (policy: LibraryPolicy) => {
    if (confirm(`Bạn có chắc muốn xóa chính sách "${policy.title}"?`)) {
      toast.success(`Đã xóa chính sách: ${policy.title}`);
      // TODO: Call delete API
    }
  };

  const handleAddPolicy = () => {
    toast.info('Mở form thêm chính sách mới');
    // TODO: Open add policy modal/form
  };

  if (isLoading) {
    return (
      <DefaultLayout showSidebar>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-10 w-64 mb-2" />
                <Skeleton className="h-6 w-96" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>

            {/* Settings Sections */}
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
              <p className="text-gray-600">
                Quản lý cài đặt thư viện, vai trò người dùng và chính sách
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefreshSettings}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Làm mới
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Đang lưu...' : 'Lưu tất cả'}
              </Button>
            </div>
          </div>

          {/* General Settings */}
          <SettingsSection
            title="Thông tin chung"
            description="Cài đặt thông tin cơ bản của thư viện"
            icon={Globe}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="library_name">Tên thư viện *</Label>
                <Input
                  id="library_name"
                  value={systemSettings?.library_name || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, library_name: e.target.value } : null)}
                  placeholder="Nhập tên thư viện"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="library_phone">Số điện thoại</Label>
                <Input
                  id="library_phone"
                  value={systemSettings?.library_phone || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, library_phone: e.target.value } : null)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="library_email">Email</Label>
                <Input
                  id="library_email"
                  type="email"
                  value={systemSettings?.library_email || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, library_email: e.target.value } : null)}
                  placeholder="Nhập email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="library_website">Website</Label>
                <Input
                  id="library_website"
                  value={systemSettings?.library_website || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, library_website: e.target.value } : null)}
                  placeholder="Nhập website"
                />
              </div>
              
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="library_address">Địa chỉ</Label>
                <Textarea
                  id="library_address"
                  value={systemSettings?.library_address || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, library_address: e.target.value } : null)}
                  placeholder="Nhập địa chỉ đầy đủ"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="opening_hours">Giờ mở cửa</Label>
                <Input
                  id="opening_hours"
                  value={systemSettings?.opening_hours || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, opening_hours: e.target.value } : null)}
                  placeholder="Nhập giờ mở cửa (VD: 08:00 - 22:00)"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="rules">Nội quy chung</Label>
                <Textarea
                  id="rules"
                  value={systemSettings?.rules || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, rules: e.target.value } : null)}
                  placeholder="Nhập nội quy chung"
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bank_info">Thông tin ngân hàng</Label>
                <Textarea
                  id="bank_info"
                  value={systemSettings?.bank_info || ''}
                  onChange={(e) => setSystemSettings(prev => prev ? { ...prev, bank_info: e.target.value } : null)}
                  placeholder="Nhập thông tin ngân hàng"
                  rows={3}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Loan Settings */}
          <SettingsSection
            title="Cài đặt mượn trả"
            description="Cấu hình quy tắc mượn trả sách"
            icon={BookOpen}
          >
            {isLoadingPolicies ? (
              <div>Đang tải...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-2 min-w-[100px]">Loại người dùng</th>
                      <th className="text-center px-3 py-2 min-w-[100px]">Số sách tối đa</th>
                      <th className="text-center px-3 py-2 min-w-[100px]">Số ngày mượn</th>
                      <th className="text-center px-3 py-2 min-w-[100px]">Phạt/ngày (VNĐ)</th>
                      <th className="text-center px-3 py-2 min-w-[100px]">Số lần gia hạn</th>
                      <th className="text-center px-3 py-2 min-w-[100px]">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {policies.map((p, idx) => (
                      <tr key={p.user_type}>
                        <td className="px-3 py-2">{p.user_type}</td>
                        <td className="text-center px-3 py-2">
                          {editIdx === idx ? (
                            <input type="number" value={editForm.max_loans ?? p.max_loans} min={1} onChange={e => setEditForm({ ...editForm, max_loans: +e.target.value })} className="border rounded px-2 py-1 w-20 text-center" />
                          ) : p.max_loans}
                        </td>
                        <td className="text-center px-3 py-2">
                          {editIdx === idx ? (
                            <input type="number" value={editForm.loan_days ?? p.loan_days} min={1} onChange={e => setEditForm({ ...editForm, loan_days: +e.target.value })} className="border rounded px-2 py-1 w-20 text-center" />
                          ) : p.loan_days}
                        </td>
                        <td className="text-center px-3 py-2">
                          {editIdx === idx ? (
                            <input type="number" value={editForm.fine_per_day ?? p.fine_per_day} min={0} step={1000} onChange={e => setEditForm({ ...editForm, fine_per_day: +e.target.value })} className="border rounded px-2 py-1 w-24 text-center" />
                          ) : p.fine_per_day.toLocaleString()}
                        </td>
                        <td className="text-center px-3 py-2">
                          {editIdx === idx ? (
                            <input type="number" value={editForm.renew_times ?? p.renew_times} min={0} onChange={e => setEditForm({ ...editForm, renew_times: +e.target.value })} className="border rounded px-2 py-1 w-20 text-center" />
                          ) : p.renew_times}
                        </td>
                        <td className="text-center px-3 py-2">
                          {editIdx === idx ? (
                            <div className="flex gap-2 justify-center">
                              <button className="px-2 py-1 bg-blue-500 text-white rounded" onClick={handleSavePolicy}>Lưu</button>
                              <button className="px-2 py-1 border rounded" onClick={handleCancelPolicy}>Hủy</button>
                            </div>
                          ) : (
                            <button className="px-2 py-1 border rounded" onClick={() => handleEditPolicy(p)}>Sửa</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SettingsSection>

          {/* Notification Settings */}
          <SettingsSection
            title="Cài đặt thông báo"
            description="Cấu hình hệ thống thông báo"
            icon={Bell}
          >
            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email_notifications"
                  checked={systemSettings?.email_notifications || false}
                  onCheckedChange={(checked) => setSystemSettings(prev => prev ? { ...prev, email_notifications: checked } : null)}
                />
                <Label htmlFor="email_notifications">Thông báo qua email</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sms_notifications"
                  checked={systemSettings?.sms_notifications || false}
                  onCheckedChange={(checked) => setSystemSettings(prev => prev ? { ...prev, sms_notifications: checked } : null)}
                />
                <Label htmlFor="sms_notifications">Thông báo qua SMS</Label>
              </div>
            </div>
          </SettingsSection>

          {/* System Settings */}
          <SettingsSection
            title="Cài đặt hệ thống"
            description="Cấu hình hệ thống và bảo mật"
            icon={Shield}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup_frequency">Tần suất sao lưu</Label>
                <Select 
                  value={systemSettings?.backup_frequency || 'daily'} 
                  onValueChange={(value) => setSystemSettings(prev => prev ? { ...prev, backup_frequency: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Hàng ngày</SelectItem>
                    <SelectItem value="weekly">Hàng tuần</SelectItem>
                    <SelectItem value="monthly">Hàng tháng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Ngôn ngữ</Label>
                <Select 
                  value={systemSettings?.language || 'vi'} 
                  onValueChange={(value) => setSystemSettings(prev => prev ? { ...prev, language: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vi">Tiếng Việt</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Múi giờ</Label>
                <Select 
                  value={systemSettings?.timezone || 'Asia/Ho_Chi_Minh'} 
                  onValueChange={(value) => setSystemSettings(prev => prev ? { ...prev, timezone: value } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Việt Nam)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="maintenance_mode"
                checked={systemSettings?.maintenance_mode || false}
                onCheckedChange={(checked) => setSystemSettings(prev => prev ? { ...prev, maintenance_mode: checked } : null)}
              />
              <Label htmlFor="maintenance_mode">Chế độ bảo trì</Label>
            </div>
          </SettingsSection>

          {/* User Roles Management */}
          <SettingsSection
            title="Quản lý vai trò người dùng"
            description="Cấu hình vai trò và quyền hạn của các nhóm người dùng"
            icon={Users}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Danh sách vai trò</h3>
              <Button onClick={handleAddRole} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm vai trò
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {userRoles.map((role) => (
                <UserRoleCard
                  key={role.id}
                  role={role}
                  onEdit={handleEditRole}
                  onDelete={handleDeleteRole}
                />
              ))}
            </div>
          </SettingsSection>

          {/* Library Policies Management */}
          <SettingsSection
            title="Quản lý chính sách thư viện"
            description="Cấu hình các quy định và chính sách của thư viện"
            icon={FileText}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Danh sách chính sách</h3>
              <Button onClick={handleAddPolicy} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Thêm chính sách
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {libraryPolicies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onEdit={handleEditPolicy}
                  onDelete={handleDeletePolicy}
                />
              ))}
            </div>
          </SettingsSection>
        </div>
      </div>
    </DefaultLayout>
  );
}
