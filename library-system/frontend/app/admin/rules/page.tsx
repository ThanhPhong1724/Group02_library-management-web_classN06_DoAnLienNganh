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
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Shield,
  FileText,
  Calendar
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Định nghĩa interface Rule đồng bộ backend
export interface Rule {
  id: number;
  tieu_de: string;
  mo_ta?: string;
  danh_muc: 'borrowing' | 'behavior' | 'penalty' | 'general' | 'technical';
  trang_thai: 'active' | 'inactive' | 'draft';
  muc_do: 'low' | 'medium' | 'high' | 'critical';
  doi_tuong: 'all' | 'students' | 'teachers' | 'staff' | 'specific';
  ngay_hieu_luc?: string;
  ngay_het_hieu_luc?: string;
  so_tien_phat?: number;
  loai_phat?: 'fine' | 'suspension' | 'warning' | 'none';
  don_vi_tien?: string;
  nguoi_tao?: string;
  nguoi_cap_nhat?: string;
  tao_luc?: string;
  cap_nhat_luc?: string;
}

interface RuleFilters {
  category: string;
  status: string;
  priority: string;
  applies_to: string;
  search: string;
}

interface RulesResponse {
  items: Rule[];
  total: number;
  page: number;
  total_pages: number;
}

// API thật cho policies
interface Policy {
  user_type: string;
  max_loans: number;
  loan_days: number;
  fine_per_day: number;
  renew_times: number;
}

const fetchPolicies = async (): Promise<Policy[]> => {
  const res = await fetch('/api/policies');
  if (!res.ok) throw new Error('Không thể tải danh sách chính sách');
  return await res.json();
};

const updatePolicy = async (user_type: string, data: Partial<Policy>) => {
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

// API CRUD Rule
const fetchRules = async (params: any): Promise<{ items: Rule[]; total: number; page: number; total_pages: number }> => {
  const searchParams = new URLSearchParams();
  if (params.filters.search) searchParams.append('search', params.filters.search);
  if (params.filters.category && params.filters.category !== 'all') searchParams.append('category', params.filters.category);
  if (params.filters.status && params.filters.status !== 'all') searchParams.append('status', params.filters.status);
  if (params.filters.priority && params.filters.priority !== 'all') searchParams.append('priority', params.filters.priority);
  if (params.filters.applies_to && params.filters.applies_to !== 'all') searchParams.append('applies_to', params.filters.applies_to);
  searchParams.append('page', params.page);
  searchParams.append('limit', params.limit);
  const res = await fetch(`/api/rules?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Không thể tải danh sách quy định');
  const data = await res.json();
  // Nếu backend trả về total, dùng luôn, nếu không thì lấy data.length
  const total = data.total ?? data.length;
  return {
    items: data.items ?? data,
    total,
    page: params.page,
    total_pages: Math.ceil(total / params.limit)
  };
};

const createRule = async (rule: Partial<Rule>) => {
  const res = await fetch('/api/rules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  if (!res.ok) throw new Error('Không thể tạo quy định');
  return await res.json();
};

const updateRule = async (id: number, rule: Partial<Rule>) => {
  const res = await fetch(`/api/rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  if (!res.ok) throw new Error('Không thể cập nhật quy định');
  return await res.json();
};

const deleteRule = async (id: number) => {
  const res = await fetch(`/api/rules/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Không thể xóa quy định');
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Hoạt động', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'inactive':
        return { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800', icon: XCircle };
      case 'draft':
        return { label: 'Bản nháp', className: 'bg-orange-100 text-orange-800', icon: AlertCircle };
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

// Priority Badge Component
const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'low':
        return { label: 'Thấp', className: 'bg-blue-100 text-blue-800' };
      case 'medium':
        return { label: 'Trung bình', className: 'bg-yellow-100 text-yellow-800' };
      case 'high':
        return { label: 'Cao', className: 'bg-orange-100 text-orange-800' };
      case 'critical':
        return { label: 'Quan trọng', className: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getPriorityConfig(priority);
  
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

// Category Badge Component
const CategoryBadge = ({ category }: { category: string }) => {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'borrowing':
        return { label: 'Mượn trả', className: 'bg-blue-100 text-blue-800', icon: BookOpen };
      case 'behavior':
        return { label: 'Hành vi', className: 'bg-green-100 text-green-800', icon: Users };
      case 'penalty':
        return { label: 'Xử phạt', className: 'bg-red-100 text-red-800', icon: AlertCircle };
      case 'general':
        return { label: 'Chung', className: 'bg-purple-100 text-purple-800', icon: FileText };
      case 'technical':
        return { label: 'Kỹ thuật', className: 'bg-orange-100 text-orange-800', icon: Shield };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;
  
  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Helper: icon theo danh mục
const getRuleIcon = (category: string) => {
  switch (category) {
    case 'borrowing': return '📚';
    case 'behavior': return '⚠️';
    case 'penalty': return '🚫';
    case 'general': return '📜';
    case 'technical': return '🛠️';
    default: return '📖';
  }
};
// Helper: label tiếng Việt
const getCategoryLabel = (cat: string) => {
  switch (cat) {
    case 'borrowing': return 'Mượn trả';
    case 'behavior': return 'Hành vi';
    case 'penalty': return 'Xử phạt';
    case 'general': return 'Chung';
    case 'technical': return 'Kỹ thuật';
    default: return cat;
  }
};
const getPriorityLabel = (p: string) => {
  switch (p) {
    case 'low': return 'Thấp';
    case 'medium': return 'Trung bình';
    case 'high': return 'Cao';
    case 'critical': return 'Quan trọng';
    default: return p;
  }
};
const getStatusLabel = (s: string) => {
  switch (s) {
    case 'active': return 'Hoạt động';
    case 'inactive': return 'Không hoạt động';
    case 'draft': return 'Bản nháp';
    default: return s;
  }
};

// Rule Card Component UI mới
const RuleCard = ({ rule, onEdit, onDelete, onView }: {
  rule: Rule;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
  onView: (rule: Rule) => void;
}) => {
  const [showFullDesc, setShowFullDesc] = React.useState(false);
  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card className="h-full flex flex-col shadow-lg rounded-2xl transition-all hover:scale-[1.01] hover:shadow-2xl p-6 md:p-8">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl shrink-0">{getRuleIcon(rule.danh_muc)}</span>
            <h3 className="font-bold text-lg md:text-xl text-foreground break-words leading-tight">
              {rule.tieu_de}
            </h3>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" onClick={() => onView(rule)}><Eye className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onEdit(rule)}><Edit className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(rule)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium px-2 py-0.5 rounded-full">{getCategoryLabel(rule.danh_muc)}</Badge>
          <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 font-medium px-2 py-0.5 rounded-full">{getPriorityLabel(rule.muc_do)}</Badge>
          <Badge className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 font-medium px-2 py-0.5 rounded-full">{getStatusLabel(rule.trang_thai)}</Badge>
        </div>
        <div className="flex-1 text-sm text-muted-foreground mb-2 min-h-[2.5em]">
          {rule.mo_ta && rule.mo_ta.length > 120 && !showFullDesc ? (
            <>
              {rule.mo_ta.slice(0, 120)}...{' '}
              <Button variant="link" size="sm" className="p-0 h-auto align-baseline" onClick={() => setShowFullDesc(true)}>Xem thêm</Button>
            </>
          ) : rule.mo_ta}
        </div>
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground items-center pb-1">
          <span>👤 {rule.doi_tuong === 'all' ? 'Tất cả' : rule.doi_tuong}</span>
          <span>📅 {rule.ngay_hieu_luc && new Date(rule.ngay_hieu_luc).toLocaleDateString('vi-VN')}</span>
          {rule.so_tien_phat && <span>💸 {rule.so_tien_phat.toLocaleString()} {rule.don_vi_tien}</span>}
          <span>🛠️ {rule.nguoi_tao}</span>
        </div>
      </Card>
    </motion.div>
  );
};

// Rule Skeleton Component
const RuleSkeleton = () => (
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
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </CardContent>
  </Card>
);

export default function AdminRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRules, setTotalRules] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<RuleFilters>({
    category: 'all',
    status: 'all',
    priority: 'all',
    applies_to: 'all',
    search: ''
  });
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Policy>>({});
  const [showDialog, setShowDialog] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [form, setForm] = useState<Partial<Rule>>({});
  const [showDetail, setShowDetail] = useState<Rule | null>(null);

  // Fetch rules
  const loadRules = async () => {
    setIsLoading(true);
    try {
      const response = await fetchRules({
        filters,
        page: currentPage,
        limit: 12
      });
      
      setRules(response.items);
      setTotalRules(response.total);
      setTotalPages(response.total_pages);
    } catch (error) {
      toast.error('Không thể tải danh sách quy định');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch policies
  const loadPolicies = async () => {
    setIsLoadingPolicies(true);
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (e) {
      toast.error('Không thể tải danh sách chính sách');
    } finally {
      setIsLoadingPolicies(false);
    }
  };

  useEffect(() => {
    loadRules();
    loadPolicies();
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof RuleFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    setRules([]);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRules();
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      category: 'all',
      status: 'all',
      priority: 'all',
      applies_to: 'all',
      search: ''
    });
    setCurrentPage(1);
  };

  // Handle actions
  const handleEdit = (rule: Rule) => {
    setEditRule(rule);
    setForm({ ...rule });
    setShowDialog(true);
  };
  const handleDelete = async (rule: Rule) => {
    if (!confirm(`Bạn có chắc muốn xóa quy định "${rule.tieu_de}"?`)) return;
    try {
      await deleteRule(rule.id);
      toast.success('Đã xóa quy định');
      loadRules();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleView = (rule: Rule) => {
    setShowDetail(rule);
  };
  const handleCreate = () => {
    setEditRule(null);
    setForm({ tieu_de: '', mo_ta: '', danh_muc: 'borrowing', trang_thai: 'active', muc_do: 'low', doi_tuong: 'all', ngay_hieu_luc: '', so_tien_phat: 0, loai_phat: 'none', don_vi_tien: 'VND' });
    setShowDialog(true);
  };
  const handleSave = async () => {
    try {
      if (editRule) {
        await updateRule(editRule.id, form);
        toast.success('Cập nhật thành công');
      } else {
        await createRule(form);
        toast.success('Tạo mới thành công');
      }
      setShowDialog(false);
      loadRules();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleEditPolicy = (idx: number) => {
    setEditIdx(idx);
    setEditForm({ ...policies[idx] });
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
      loadPolicies();
    } catch (e) {
      toast.error('Không thể cập nhật');
    }
  };

  return (
    <DefaultLayout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Quản lý quy định</h1>
              <p className="text-muted-foreground">
                Tạo và quản lý các quy định của thư viện
              </p>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tạo quy định mới
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
                      placeholder="Tìm kiếm theo tiêu đề hoặc mô tả quy định..."
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
                  <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-category" value="all">Tất cả danh mục</SelectItem>
                      <SelectItem value="borrowing">Mượn trả</SelectItem>
                      <SelectItem value="behavior">Hành vi</SelectItem>
                      <SelectItem value="penalty">Xử phạt</SelectItem>
                      <SelectItem value="general">Chung</SelectItem>
                      <SelectItem value="technical">Kỹ thuật</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-status" value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                      <SelectItem value="draft">Bản nháp</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mức độ ưu tiên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-priority" value="all">Tất cả mức độ</SelectItem>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                      <SelectItem value="critical">Quan trọng</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filters.applies_to} onValueChange={(value) => handleFilterChange('applies_to', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Đối tượng áp dụng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="all-applies" value="all">Tất cả đối tượng</SelectItem>
                      <SelectItem value="students">Sinh viên</SelectItem>
                      <SelectItem value="teachers">Giáo viên</SelectItem>
                      <SelectItem value="staff">Nhân viên</SelectItem>
                      <SelectItem value="specific">Cụ thể</SelectItem>
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
                    Tìm thấy {totalRules} quy định
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Rules Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 12 }).map((_, i) => (
                <RuleSkeleton key={i} />
              ))}
            </div>
          ) : rules.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy quy định</h3>
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
              {rules.map((rule) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>
          )}

          {/* Thay đổi: bỏ phân trang số, thêm nút Xem thêm */}
          {!isLoading && rules.length < totalRules && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}

          {/* Chính sách mượn trả */}
          <Card>
            <CardHeader>
              <CardTitle>Chính sách mượn trả</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingPolicies ? (
                <div>Đang tải...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại người dùng</TableHead>
                      <TableHead>Số sách tối đa</TableHead>
                      <TableHead>Số ngày mượn</TableHead>
                      <TableHead>Phạt/ngày (VNĐ)</TableHead>
                      <TableHead>Số lần gia hạn</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((p, idx) => (
                      <TableRow key={p.user_type}>
                        <TableCell>{p.user_type}</TableCell>
                        <TableCell>
                          {editIdx === idx ? (
                            <Input type="number" value={editForm.max_loans ?? p.max_loans} min={1} onChange={e => setEditForm(f => ({ ...f, max_loans: +e.target.value }))} />
                          ) : p.max_loans}
                        </TableCell>
                        <TableCell>
                          {editIdx === idx ? (
                            <Input type="number" value={editForm.loan_days ?? p.loan_days} min={1} onChange={e => setEditForm(f => ({ ...f, loan_days: +e.target.value }))} />
                          ) : p.loan_days}
                        </TableCell>
                        <TableCell>
                          {editIdx === idx ? (
                            <Input type="number" value={editForm.fine_per_day ?? p.fine_per_day} min={0} step={1000} onChange={e => setEditForm(f => ({ ...f, fine_per_day: +e.target.value }))} />
                          ) : p.fine_per_day.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {editIdx === idx ? (
                            <Input type="number" value={editForm.renew_times ?? p.renew_times} min={0} onChange={e => setEditForm(f => ({ ...f, renew_times: +e.target.value }))} />
                          ) : p.renew_times}
                        </TableCell>
                        <TableCell>
                          {editIdx === idx ? (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSavePolicy}>Lưu</Button>
                              <Button size="sm" variant="outline" onClick={handleCancelPolicy}>Hủy</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleEditPolicy(idx)}>Sửa</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Dialog Thêm/Sửa quy định */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editRule ? 'Sửa quy định' : 'Thêm quy định'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Tiêu đề" value={form.tieu_de || ''} onChange={e => setForm(f => ({ ...f, tieu_de: e.target.value }))} />
            <Input placeholder="Mô tả" value={form.mo_ta || ''} onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))} />
            <Select value={form.danh_muc || 'borrowing'} onValueChange={v => setForm(f => ({ ...f, danh_muc: v as Rule['danh_muc'] }))}>
              <SelectTrigger><SelectValue placeholder="Danh mục" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="borrowing">Mượn trả</SelectItem>
                <SelectItem value="behavior">Hành vi</SelectItem>
                <SelectItem value="penalty">Xử phạt</SelectItem>
                <SelectItem value="general">Chung</SelectItem>
                <SelectItem value="technical">Kỹ thuật</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.trang_thai || 'active'} onValueChange={v => setForm(f => ({ ...f, trang_thai: v as Rule['trang_thai'] }))}>
              <SelectTrigger><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
                <SelectItem value="draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.muc_do || 'low'} onValueChange={v => setForm(f => ({ ...f, muc_do: v as Rule['muc_do'] }))}>
              <SelectTrigger><SelectValue placeholder="Mức độ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Thấp</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="critical">Quan trọng</SelectItem>
              </SelectContent>
            </Select>
            <Select value={form.doi_tuong || 'all'} onValueChange={v => setForm(f => ({ ...f, doi_tuong: v as Rule['doi_tuong'] }))}>
              <SelectTrigger><SelectValue placeholder="Đối tượng áp dụng" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="students">Sinh viên</SelectItem>
                <SelectItem value="teachers">Giáo viên</SelectItem>
                <SelectItem value="staff">Nhân viên</SelectItem>
                <SelectItem value="specific">Cụ thể</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Ngày hiệu lực" value={form.ngay_hieu_luc || ''} onChange={e => setForm(f => ({ ...f, ngay_hieu_luc: e.target.value }))} />
            <Input type="number" placeholder="Số tiền phạt" value={form.so_tien_phat || 0} onChange={e => setForm(f => ({ ...f, so_tien_phat: +e.target.value }))} />
            <Select value={form.loai_phat || 'none'} onValueChange={v => setForm(f => ({ ...f, loai_phat: v as Rule['loai_phat'] }))}>
              <SelectTrigger><SelectValue placeholder="Loại phạt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Không</SelectItem>
                <SelectItem value="fine">Phạt tiền</SelectItem>
                <SelectItem value="suspension">Đình chỉ</SelectItem>
                <SelectItem value="warning">Cảnh cáo</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Đơn vị tiền" value={form.don_vi_tien || 'VND'} onChange={e => setForm(f => ({ ...f, don_vi_tien: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Hủy</Button>
              <Button onClick={handleSave}>Lưu</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Dialog xem chi tiết quy định */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết quy định</DialogTitle>
          </DialogHeader>
          {showDetail && (
            <div className="space-y-2">
              <div><b>Tiêu đề:</b> {showDetail.tieu_de}</div>
              <div><b>Mô tả:</b> {showDetail.mo_ta}</div>
              <div><b>Danh mục:</b> {getCategoryLabel(showDetail.danh_muc)}</div>
              <div><b>Trạng thái:</b> {getStatusLabel(showDetail.trang_thai)}</div>
              <div><b>Mức độ:</b> {getPriorityLabel(showDetail.muc_do)}</div>
              <div><b>Đối tượng:</b> {showDetail.doi_tuong}</div>
              <div><b>Ngày hiệu lực:</b> {showDetail.ngay_hieu_luc}</div>
              <div><b>Số tiền phạt:</b> {showDetail.so_tien_phat?.toLocaleString()} {showDetail.don_vi_tien}</div>
              <div><b>Loại phạt:</b> {showDetail.loai_phat}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
