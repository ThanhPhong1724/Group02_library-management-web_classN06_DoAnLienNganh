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
  MapPin, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Building,
  Layers,
  Grid3X3,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Types
interface Location {
  id: number;
  code: string;
  floor: string;
  room: string;
  shelf: string;
  row: string;
  col: string;
  note: string;
}

interface LocationFilters {
  building: string;
  floor: string;
  shelf_type: string;
  status: string;
  search: string;
}

interface LocationsResponse {
  items: Location[];
  total: number;
  page: number;
  total_pages: number;
}

// 3. Các hàm API
const fetchLocations = async (): Promise<Location[]> => {
  const res = await fetch('/api/locations');
  if (!res.ok) throw new Error('Không thể tải danh sách vị trí');
  return await res.json();
};
const createLocation = async (data: Omit<Location, 'id'>) => {
  const res = await fetch('/api/locations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể thêm vị trí');
  return await res.json();
};
const updateLocation = async (id: number, data: Partial<Location>) => {
  const res = await fetch(`/api/locations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Không thể cập nhật vị trí');
  return await res.json();
};
const deleteLocation = async (id: number) => {
  const res = await fetch(`/api/locations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Không thể xóa vị trí');
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Hoạt động', className: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'maintenance':
        return { label: 'Bảo trì', className: 'bg-orange-100 text-orange-800', icon: AlertCircle };
      case 'full':
        return { label: 'Đầy', className: 'bg-red-100 text-red-800', icon: XCircle };
      case 'inactive':
        return { label: 'Không hoạt động', className: 'bg-gray-100 text-gray-800', icon: XCircle };
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

// Shelf Type Badge Component
const ShelfTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'standard':
        return { label: 'Tiêu chuẩn', className: 'bg-blue-100 text-blue-800' };
      case 'reference':
        return { label: 'Tham khảo', className: 'bg-purple-100 text-purple-800' };
      case 'special':
        return { label: 'Chuyên ngành', className: 'bg-indigo-100 text-indigo-800' };
      case 'reserve':
        return { label: 'Dự trữ', className: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Không xác định', className: 'bg-gray-100 text-gray-800' };
    }
  };

  const config = getTypeConfig(type);
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

// Capacity Progress Component
const CapacityProgress = ({ current, total }: { current: number; total: number }) => {
  const percentage = (current / total) * 100;
  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Sức chứa</span>
        <span className="font-medium">{current}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getColor(percentage)}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-right">
        {percentage.toFixed(1)}%
      </div>
    </div>
  );
};

// Location Card Component
const LocationCard = ({ location, onEdit, onDelete }: {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
}) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{location.code}</h3>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => onEdit(location)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(location)} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <div className="text-sm"><b>Tầng:</b> {location.floor}</div>
      <div className="text-sm"><b>Phòng:</b> {location.room}</div>
      <div className="text-sm"><b>Kệ:</b> {location.shelf}</div>
      <div className="text-sm"><b>Hàng:</b> {location.row}</div>
      <div className="text-sm"><b>Cột:</b> {location.col}</div>
      <div className="text-sm"><b>Ghi chú:</b> {location.note}</div>
    </CardContent>
  </Card>
);

// Loading skeleton
const LocationSkeleton = () => (
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
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex justify-between pt-2 border-t">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </CardContent>
  </Card>
);

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bỏ toàn bộ phần tìm kiếm và filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  // Thay đổi: bỏ phân trang số, thêm nút Xem thêm
  const pagedLocations = locations.slice(0, currentPage * itemsPerPage);
  // Sửa pagedLocations để nối thêm dữ liệu khi ấn Xem thêm
  const totalPages = Math.ceil(locations.length / itemsPerPage);

  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [editForm, setEditForm] = useState<Partial<Location>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (location: Location) => {
    setEditLocation(location);
    setEditForm({ ...location });
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditLocation(null);
    setEditForm({});
  };
  const handleEditSave = async () => {
    if (!editLocation) return;
    setIsSaving(true);
    try {
      await updateLocation(editLocation.id, editForm);
      toast.success('Đã cập nhật vị trí!');
      setLocations(await fetchLocations());
      closeEditModal();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  // Load data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchLocations();
        console.log('API locations:', data); // debug
        setLocations(data);
      } catch (e) {
        setError((e as Error).message);
        setLocations([]);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // Khi load lại locations thì reset về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [locations]);

  // Chỉ render danh sách card vị trí và nút Thêm vị trí
  const handleAddLocation = async (data: Omit<Location, 'id'>) => {
    try {
      await createLocation(data);
      toast.success('Đã thêm vị trí mới!');
      setLocations(await fetchLocations());
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleEdit = async (location: Location, data: Partial<Location>) => {
    try {
      await updateLocation(location.id, data);
      toast.success('Đã cập nhật vị trí!');
      setLocations(await fetchLocations());
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const handleDelete = async (location: Location) => {
    if (!confirm(`Bạn có chắc muốn xóa vị trí "${location.code}"?`)) return;
    try {
      await deleteLocation(location.id);
      toast.success('Đã xóa vị trí!');
      setLocations(await fetchLocations());
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleView = (location: Location) => {
    toast.info(`Xem chi tiết: ${location.code}`);
    // TODO: Open view modal
  };

  // Get unique values for filters
  const buildings = ['Tòa A', 'Tòa B', 'Tòa C'];
  const floors = ['Tầng trệt', 'Tầng 1', 'Tầng 2', 'Tầng 3'];
  const shelfTypes = [
    { value: 'standard', label: 'Tiêu chuẩn' },
    { value: 'reference', label: 'Tham khảo' },
    { value: 'special', label: 'Chuyên ngành' },
    { value: 'reserve', label: 'Dự trữ' }
  ];
  const statuses = [
    { value: 'active', label: 'Hoạt động' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'full', label: 'Đầy' },
    { value: 'inactive', label: 'Không hoạt động' }
  ];

  return (
    <DefaultLayout showSidebar>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý vị trí kệ sách</h1>
              <p className="text-gray-600">
                Quản lý vị trí, sức chứa và trạng thái của các kệ sách trong thư viện
              </p>
            </div>
            <Button onClick={() => handleAddLocation({ code: '', floor: '', room: '', shelf: '', row: '', col: '', note: '' })} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm vị trí
            </Button>
          </div>

          {/* Search and Filters */}
          {/* Bỏ toàn bộ phần tìm kiếm và filter */}

          {/* Locations Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <LocationSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="text-center py-12 text-red-500">
                {error}
              </CardContent>
            </Card>
          ) : pagedLocations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy vị trí</h3>
                <p className="text-muted-foreground mb-4">
                  Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
                </p>
                {/* Bỏ nút Xóa bộ lọc */}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pagedLocations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {/* Thay đổi: bỏ phân trang số, thêm nút Xem thêm */}
          {!isLoading && pagedLocations.length + (currentPage - 1) * itemsPerPage < locations.length && (
            <div className="flex justify-center mt-6">
              <Button onClick={() => setCurrentPage(prev => prev + 1)}>
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal form Sửa vị trí */}
      <Dialog open={showEditModal} onOpenChange={closeEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa vị trí kệ sách</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Mã kệ" value={editForm.code || ''} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} />
            <Input placeholder="Tầng" value={editForm.floor || ''} onChange={e => setEditForm(f => ({ ...f, floor: e.target.value }))} />
            <Input placeholder="Phòng" value={editForm.room || ''} onChange={e => setEditForm(f => ({ ...f, room: e.target.value }))} />
            <Input placeholder="Kệ" value={editForm.shelf || ''} onChange={e => setEditForm(f => ({ ...f, shelf: e.target.value }))} />
            <Input placeholder="Hàng" value={editForm.row || ''} onChange={e => setEditForm(f => ({ ...f, row: e.target.value }))} />
            <Input placeholder="Cột" value={editForm.col || ''} onChange={e => setEditForm(f => ({ ...f, col: e.target.value }))} />
            <Input placeholder="Ghi chú" value={editForm.note || ''} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditModal}>Hủy</Button>
              <Button onClick={handleEditSave} disabled={isSaving}>{isSaving ? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DefaultLayout>
  );
}
