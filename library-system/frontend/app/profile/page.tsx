"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X, 
  BookOpen, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Tabs as UITabs, TabsList as UITabsList, TabsTrigger as UITabsTrigger, TabsContent as UITabsContent } from '@/components/ui/tabs';
import { useRef } from 'react';

// Types
interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  address: string;
}

interface Loan {
  id: number;
  book_title: string;
  copy_code: string;
  borrowed_date: string;
  due_date: string;
  returned_date?: string;
  status: 'requested' | 'borrowed' | 'return_requested' | 'returned' | 'overdue' | 'rejected';
  fine_amount?: number;
  fine_note?: string;
  fine_paid?: boolean;
  fine_paid_at?: string;
}

// Real API adapters based on API spec
async function fetchUserProfile(): Promise<ProfileForm> {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  if (!response.ok) {
    throw new Error('Không thể tải thông tin hồ sơ');
  }
  const data = await response.json();
  return {
    full_name: data.full_name || data.ho_ten || '',
    email: data.email || '',
    phone: data.phone || data.so_dien_thoai || '',
    address: data.address || data.dia_chi || ''
  };
}

async function fetchUserLoans(): Promise<Loan[]> {
  const response = await fetch('/api/me/loans?status=requested,borrowed,return_requested,returned,overdue,rejected', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  if (!response.ok) throw new Error('Không thể tải lịch sử mượn sách');
  const data = await response.json();
  return data.map((loan: any) => ({
    id: loan.id,
    book_title: loan.book_title || '',
    copy_code: loan.copy_code || '',
    borrowed_date: loan.borrowed_date || loan.borrowed_at || '',
    due_date: loan.due_date || loan.due_at || '',
    returned_date: loan.returned_date || loan.returned_at || undefined,
    status: loan.status,
    fine_amount: loan.fine_amount,
    fine_note: loan.fine_note,
    fine_paid: loan.fine_paid,
    fine_paid_at: loan.fine_paid_at,
  }));
}

async function updateUserProfile(data: ProfileForm): Promise<boolean> {
  const response = await fetch('/api/auth/me', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    },
    body: JSON.stringify({
      ho_ten: data.full_name,
      so_dien_thoai: data.phone,
      dia_chi: data.address,
      email: data.email
    })
  });
  if (!response.ok) return false;
  return true;
}

// Status badge component
const StatusBadge = ({ status }: { status: Loan['status'] }) => {
  const statusConfig = {
    requested: { label: 'Chờ duyệt mượn', className: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
    borrowed: { label: 'Đang mượn', className: 'bg-blue-100 text-blue-800', icon: Clock },
    return_requested: { label: 'Chờ duyệt trả', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    returned: { label: 'Đã trả', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Quá hạn', className: 'bg-red-100 text-red-800', icon: AlertCircle },
    rejected: { label: 'Từ chối', className: 'bg-gray-100 text-gray-800', icon: X },
  };
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge className={config.className}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Loading skeleton component
const ProfileSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<ProfileForm | null>(null);
  const [showPayFineModal, setShowPayFineModal] = useState<{ open: boolean, loan: Loan | null }>({ open: false, loan: null });
  const [payTab, setPayTab] = useState<'vnpay' | 'qr'>('vnpay');
  const [qrImage, setQrImage] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrChecked, setQrChecked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        const [profileData, loansData] = await Promise.all([
          fetchUserProfile(),
          fetchUserLoans()
        ]);
        setProfile(profileData);
        setEditForm(profileData);
        setLoans(loansData);
      } catch (error) {
        toast.error('Không thể tải thông tin hồ sơ');
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(profile);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      setIsSaving(true);
      const success = await updateUserProfile(editForm);
      
      if (success) {
        setProfile(editForm);
        setIsEditing(false);
        toast.success('Cập nhật hồ sơ thành công!');
      } else {
        throw new Error('Cập nhật thất bại');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Cập nhật thất bại';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof ProfileForm, value: string) => {
    if (editForm) {
      setEditForm(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // PayFineModal component
  const PayFineModal = () => (
    <Dialog open={showPayFineModal.open} onOpenChange={o => setShowPayFineModal({ open: o, loan: o ? showPayFineModal.loan : null })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thanh toán tiền phạt cho bản sao {showPayFineModal.loan?.copy_code}</DialogTitle>
        </DialogHeader>
        <UITabs value={payTab} onValueChange={v => setPayTab(v as 'vnpay' | 'qr')} className="w-full">
          <UITabsList className="grid grid-cols-2 mb-4">
            <UITabsTrigger value="vnpay">VNPay</UITabsTrigger>
            <UITabsTrigger value="qr">QR tĩnh</UITabsTrigger>
          </UITabsList>
          <UITabsContent value="vnpay">
            <div className="text-center py-6">
              <p className="mb-4">Tính năng thanh toán VNPay đang phát triển.</p>
              <Button disabled>Thanh toán qua VNPay</Button>
            </div>
          </UITabsContent>
          <UITabsContent value="qr">
            <div className="flex flex-col items-center gap-4">
              <img src="/static/qr-demo.png" alt="QR chuyển khoản" className="w-48 h-48 object-contain border rounded" />
              <div className="text-sm text-muted-foreground text-center">
                Quét mã QR để chuyển khoản.<br />
                <b>Nội dung chuyển khoản:</b><br />
                <span className="font-mono">{user?.email} {showPayFineModal.loan?.copy_code}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  setQrImage(file || null);
                  setQrPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                {qrImage ? 'Đổi ảnh xác nhận' : 'Tải ảnh xác nhận chuyển khoản'}
              </Button>
              {qrPreview && <img src={qrPreview} alt="Ảnh xác nhận" className="w-32 h-32 object-contain border rounded" />}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={qrChecked} onChange={e => setQrChecked(e.target.checked)} />
                Tôi cam kết đã chuyển khoản đúng nội dung trên
              </label>
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={async () => {
                  setShowPayFineModal({ open: false, loan: null });
                  toast.success('Đã gửi xác nhận nộp phạt, chờ admin duyệt!');
                  // TODO: Gửi ảnh và trạng thái lên backend nếu cần
                }}
                disabled={!qrImage || !qrChecked}
              >
                Xác nhận đã chuyển khoản
              </Button>
              <DialogClose asChild><Button variant="outline">Hủy</Button></DialogClose>
            </DialogFooter>
          </UITabsContent>
        </UITabs>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="container mx-auto max-w-screen-2xl px-4 py-8">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <ProfileSkeleton />
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
            <p className="text-gray-600">
              Quản lý thông tin cá nhân và xem lịch sử mượn sách
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="loans">Lịch sử mượn sách</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Thông tin cá nhân
                      </CardTitle>
                      <CardDescription>
                        Cập nhật thông tin cá nhân của bạn
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleSave} 
                          size="sm"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Đang lưu...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Lưu
                            </>
                          )}
                        </Button>
                        <Button onClick={handleCancel} variant="outline" size="sm">
                          <X className="w-4 h-4 mr-2" />
                          Hủy
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-medium">
                        Họ và tên
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={isEditing ? editForm?.full_name || '' : profile?.full_name || ''}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editForm?.email || '' : profile?.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Số điện thoại
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={isEditing ? editForm?.phone || '' : profile?.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">
                        Địa chỉ
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={isEditing ? editForm?.address || '' : profile?.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Loans Tab */}
            <TabsContent value="loans" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Lịch sử mượn sách
                  </CardTitle>
                  <CardDescription>
                    Xem danh sách sách đã mượn và trạng thái hiện tại
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {loans.length === 0 ? (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có lịch sử mượn sách</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên sách</TableHead>
                          <TableHead>Mã bản sao</TableHead>
                          <TableHead>Ngày mượn</TableHead>
                          <TableHead>Hạn trả</TableHead>
                          <TableHead>Ngày trả</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead>Tiền phạt</TableHead>
                          <TableHead>Hành động</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loans.map((loan) => (
                          <motion.tr
                            key={loan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TableCell className="font-medium">{loan.book_title}</TableCell>
                            <TableCell>{loan.copy_code}</TableCell>
                            <TableCell>{formatDate(loan.borrowed_date)}</TableCell>
                            <TableCell>{formatDate(loan.due_date)}</TableCell>
                            <TableCell>
                              {loan.returned_date ? formatDate(loan.returned_date) : '-'}
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={loan.status} />
                            </TableCell>
                            <TableCell>
                              {/* Chỉ hiển thị số tiền phạt và ghi chú nếu có phạt > 0 */}
                              {(loan.fine_amount ?? 0) > 0 ? (
                                <div>
                                  <span className="text-red-600 font-semibold">{loan.fine_amount?.toLocaleString('vi-VN')}đ</span>
                                  {loan.fine_note && <div className="text-xs text-muted-foreground">{loan.fine_note}</div>}
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {/* Hành động: */}
                              {(loan.fine_amount ?? 0) > 0 && !loan.fine_paid && loan.fine_paid_at ? (
                                <Badge className="bg-yellow-100 text-yellow-800">Đang chờ xác nhận nộp tiền</Badge>
                              ) : (loan.fine_amount ?? 0) > 0 && !loan.fine_paid ? (
                                <Button size="sm" variant="outline" onClick={() => setShowPayFineModal({ open: true, loan })}>Nộp phạt</Button>
                              ) : loan.fine_paid ? (
                                <Badge className="bg-green-100 text-green-800">Đã nộp phạt</Badge>
                              ) : loan.status === 'borrowed' ? (
                                <Button size="sm" variant="outline" onClick={async () => {
                                  try {
                                    await fetch(`/api/loans/${loan.id}/request-return`, {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                                      },
                                    });
                                    toast.success('Đã gửi yêu cầu trả sách, chờ admin duyệt!');
                                    setLoans(await fetchUserLoans());
                                  } catch {
                                    toast.error('Không thể gửi yêu cầu trả sách');
                                  }
                                }}>Yêu cầu trả sách</Button>
                              ) : loan.status === 'return_requested' ? (
                                <Button size="sm" variant="outline" disabled>Chờ admin duyệt trả</Button>
                              ) : (
                                <span>-</span>
                              )}
                            </TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Hiển thị modal thanh toán */}
      {showPayFineModal.open && <PayFineModal />}
    </DefaultLayout>
  );
}
