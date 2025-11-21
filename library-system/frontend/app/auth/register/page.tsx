"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  Eye, 
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';

// Types
interface RegisterForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

// Form validation
const validateForm = (form: RegisterForm): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  if (!form.fullName) {
    errors.fullName = 'Họ tên là bắt buộc';
  }
  
  if (!form.email) {
    errors.email = 'Email là bắt buộc';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  if (!form.phone) {
    errors.phone = 'Số điện thoại là bắt buộc';
  } else if (!/^[0-9]{10,11}$/.test(form.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  if (!form.address) {
    errors.address = 'Địa chỉ là bắt buộc';
  }
  
  if (!form.password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (form.password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Mật khẩu không khớp';
  }
  
  if (!form.agreeToTerms) {
    errors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [form, setForm] = useState<RegisterForm>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof RegisterForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Use the auth context register function
      const success = await register({
        full_name: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        password: form.password
      });
      
      if (success) {
        toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
        router.push('/login');
      } else {
        throw new Error('Đăng ký thất bại');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng ký thất bại';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="w-full">
              <CardHeader className="space-y-1 text-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mx-auto mb-4"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-primary" />
                  </div>
                </motion.div>
                <CardTitle className="text-2xl font-bold">Đăng ký thành viên</CardTitle>
                <CardDescription>
                  Tạo tài khoản mới để sử dụng dịch vụ thư viện
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Họ và tên
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Nhập họ và tên"
                        value={form.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className={`pl-10 ${errors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      />
                    </div>
                    {errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="fullName-error"
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </motion.p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Nhập email của bạn"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="email-error"
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </motion.p>
                    )}
                                     </div>

                   {/* Phone Field */}
                   <div className="space-y-2">
                     <Label htmlFor="phone" className="text-sm font-medium">
                       Số điện thoại
                     </Label>
                     <div className="relative">
                       <Input
                         id="phone"
                         type="tel"
                         placeholder="Nhập số điện thoại"
                         value={form.phone}
                         onChange={(e) => handleInputChange('phone', e.target.value)}
                         className={errors.phone ? 'border-red-500 focus:border-red-500' : ''}
                         disabled={isSubmitting}
                         aria-describedby={errors.phone ? 'phone-error' : undefined}
                       />
                     </div>
                     {errors.phone && (
                       <motion.p
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         id="phone-error"
                         className="text-sm text-red-500 flex items-center gap-1"
                       >
                         <AlertCircle className="w-3 h-3" />
                         {errors.phone}
                       </motion.p>
                     )}
                   </div>

                   {/* Address Field */}
                   <div className="space-y-2">
                     <Label htmlFor="address" className="text-sm font-medium">
                       Địa chỉ
                     </Label>
                     <div className="relative">
                       <Input
                         id="address"
                         type="text"
                         placeholder="Nhập địa chỉ"
                         value={form.address}
                         onChange={(e) => handleInputChange('address', e.target.value)}
                         className={errors.address ? 'border-red-500 focus:border-red-500' : ''}
                         disabled={isSubmitting}
                         aria-describedby={errors.address ? 'address-error' : undefined}
                       />
                     </div>
                     {errors.address && (
                       <motion.p
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         id="address-error"
                         className="text-sm text-red-500 flex items-center gap-1"
                       >
                         <AlertCircle className="w-3 h-3" />
                         {errors.address}
                       </motion.p>
                     )}
                   </div>

                   {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu"
                        value={form.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        aria-describedby={errors.password ? 'password-error' : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="password-error"
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.password}
                      </motion.p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Xác nhận mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                        disabled={isSubmitting}
                        aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        id="confirmPassword-error"
                        className="text-sm text-red-500 flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>

                                     {/* Terms Agreement */}
                   <div className="space-y-2">
                     <div className="flex items-start space-x-2">
                       <Checkbox
                         id="agreeToTerms"
                         checked={form.agreeToTerms}
                         onCheckedChange={(checked) => 
                           handleInputChange('agreeToTerms', checked as boolean)
                         }
                         disabled={isSubmitting}
                       />
                       <div className="grid gap-1.5 leading-none">
                         <label
                           htmlFor="agreeToTerms"
                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                         >
                           Tôi đồng ý với{' '}
                           <Button
                             type="button"
                             variant="link"
                             className="h-auto p-0 text-sm underline"
                             onClick={() => window.open('/terms', '_blank')}
                           >
                             điều khoản sử dụng
                             <ExternalLink className="ml-1 h-3 w-3" />
                           </Button>
                           {' '}và{' '}
                           <Button
                             type="button"
                             variant="link"
                             className="h-auto p-0 text-sm underline"
                             onClick={() => window.open('/privacy', '_blank')}
                           >
                             chính sách bảo mật
                             <ExternalLink className="ml-1 h-3 w-3" />
                           </Button>
                         </label>
                       </div>
                     </div>
                     {errors.agreeToTerms && (
                       <motion.p
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="text-sm text-red-500 flex items-center gap-1"
                       >
                         <AlertCircle className="w-3 h-3" />
                         {errors.agreeToTerms}
                       </motion.p>
                     )}
                   </div>

                   {/* General Error */}
                   {errors.general && (
                     <motion.div
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-3 bg-red-50 border border-red-200 rounded-lg"
                     >
                       <p className="text-sm text-red-600 flex items-center gap-2">
                         <AlertCircle className="w-4 h-4" />
                         {errors.general}
                       </p>
                     </motion.div>
                   )}

                   {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Đăng ký
                      </>
                    )}
                  </Button>
                </form>

                {/* Navigation Links */}
                <div className="text-center space-y-2">
                  <Button
                    variant="link"
                    className="text-sm"
                    onClick={() => router.push('/login')}
                    disabled={isSubmitting}
                  >
                    Đã có tài khoản? Đăng nhập ngay
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-sm"
                    onClick={() => router.push('/')}
                    disabled={isSubmitting}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại trang chủ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DefaultLayout>
  );
}
