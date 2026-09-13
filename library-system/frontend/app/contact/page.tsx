"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Library, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageSquare, 
  Send, 
  Globe, 
  Users, 
  Building, 
  Car, 
  Bus, 
  Train, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';

// Quick Contact Highlights
const contactHighlights = [
  {
    title: 'Địa chỉ thư viện',
    value: '123 Đường ABC, Quận 1, TP.HCM',
    detail: 'Trung tâm thành phố, tiện xe bus & metro',
    icon: MapPin,
    badge: 'Khuôn viên chính',
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
  },
  {
    title: 'Tổng đài hỗ trợ',
    value: '(028) 1234-5678',
    detail: 'Hỗ trợ từ 7:00 - 21:00 hàng ngày',
    icon: Phone,
    badge: 'Miễn phí cước',
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
  },
  {
    title: 'Hộp thư điện tử',
    value: 'hotro@thuvien.edu.vn',
    detail: 'Giải đáp thắc mắc trong 24 giờ',
    icon: Mail,
    badge: 'Trực tuyến 24/7',
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900',
  },
  {
    title: 'Thời gian phục vụ',
    value: '7:00 - 21:00',
    detail: 'Thứ 2 - Chủ nhật (kể cả lễ tết)',
    icon: Clock,
    badge: 'Mở cửa liên tục',
    color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
  }
];

// Department Directory
const departments = [
  {
    name: 'Phòng Phục vụ Bạn đọc & Thẻ',
    phone: '(028) 1234-5679',
    email: 'bandoc@thuvien.edu.vn',
    desc: 'Cấp đổi thẻ thư viện, hướng dẫn thủ tục mượn trả và gia hạn sách.'
  },
  {
    name: 'Phòng Quản lý Tài nguyên Sách',
    phone: '(028) 1234-5680',
    email: 'sach@thuvien.edu.vn',
    desc: 'Tiếp nhận đề xuất sách mới, bảo quản tài liệu quý và ấn phẩm khoa học.'
  },
  {
    name: 'Trung tâm Hỗ trợ Kỹ thuật & CNTT',
    phone: '(028) 1234-5681',
    email: 'support@thuvien.edu.vn',
    desc: 'Hỗ trợ tài khoản trực tuyến, chatbot AI, lỗi hệ thống và cổng tra cứu số.'
  }
];

// Transportation guide
const transitGuides = [
  {
    icon: Bus,
    title: 'Xe Buýt',
    desc: 'Tuyến 01, 02, 03, 19, 45 (Trạm dừng ngay cổng Thư viện)'
  },
  {
    icon: Car,
    title: 'Xe máy & Ô tô',
    desc: 'Bãi đỗ xe tầng hầm có mái che, bảo vệ trông giữ an ninh'
  },
  {
    icon: Train,
    title: 'Tàu điện Metro',
    desc: 'Ga Nhà hát Thành phố / Ga Bến Thành (Đi bộ 500m)'
  }
];

// FAQs
const faqs = [
  {
    q: 'Thủ tục đăng ký tài khoản / thẻ thư viện như thế nào?',
    a: 'Bạn chỉ cần nhấn nút "Đăng ký" trên website hoặc đến trực tiếp quầy Dịch vụ Bạn đọc mang theo CCCD/Thẻ học sinh, sinh viên để được kích hoạt thẻ trong vòng 5 phút.'
  },
  {
    q: 'Tôi được mượn tối đa bao nhiêu cuốn sách và trong bao lâu?',
    a: 'Mỗi độc giả được mượn tối đa 5 cuốn cùng lúc trong thời hạn 14 ngày. Bạn có thể yêu cầu gia hạn thêm 7 ngày trực tiếp trong trang Hồ sơ cá nhân nếu sách chưa có người đặt trước.'
  },
  {
    q: 'Quy định về trả sách trễ hạn và tiền phạt ra sao?',
    a: 'Phí phạt quá hạn là 10.000đ / ngày / cuốn sách trễ. Độc giả có thể thanh toán tiền phạt trực tuyến qua quét mã QR hoặc nộp trực tiếp tại quầy thủ thư.'
  },
  {
    q: 'Làm thế nào để mượn sách thông qua Chatbot AI?',
    a: 'Bạn chỉ cần mở biểu tượng Trợ lý AI ở góc dưới màn hình, gõ tin nhắn "Tôi muốn mượn sách [Tên sách]" hoặc hỏi vị trí kệ sách, bot sẽ kiểm tra bản sao còn lại và hỗ trợ bạn mượn ngay trong khung chat.'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'support',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Tin nhắn của bạn đã được gửi thành công! Ban quản trị sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({ name: '', email: '', phone: '', topic: 'support', message: '' });
    setIsSubmitting(false);
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 space-y-10">
        {/* Header / Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-muted/60 text-xs font-semibold text-primary">
            <Headphones className="w-3.5 h-3.5" />
            Trung Tâm Hỗ Trợ Độc Giả 24/7
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Liên Hệ Với Thư Viện
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Chúng tôi luôn lắng nghe ý kiến đóng góp và sẵn sàng giải đáp mọi thắc mắc của bạn về dịch vụ thư viện số.
          </p>
        </div>

        {/* 4-Card Quick Contact Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactHighlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
              >
                <Card className="h-full border hover:shadow-md transition-all">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-xs font-normal">
                        {item.badge}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        {item.title}
                      </div>
                      <div className="text-base font-bold text-foreground mt-0.5">
                        {item.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.detail}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Main 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (60%): Interactive Contact Form */}
          <div className="lg:col-span-7">
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Gửi Tin Nhắn Cho Chúng Tôi
                </CardTitle>
                <CardDescription>
                  Điền biểu mẫu dưới đây để gửi phản hồi, báo lỗi hoặc yêu cầu mượn/đề xuất sách mới.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Địa chỉ Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="nguyenvana@example.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Số điện thoại
                      </label>
                      <Input
                        placeholder="0912 345 678"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        Chủ đề liên hệ
                      </label>
                      <Select
                        value={formData.topic}
                        onValueChange={v => setFormData({ ...formData, topic: v })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Chọn chủ đề" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="support">Hỗ trợ mượn trả & Thẻ</SelectItem>
                          <SelectItem value="book_request">Đề xuất mua sách mới</SelectItem>
                          <SelectItem value="technical">Báo lỗi hệ thống / Chatbot</SelectItem>
                          <SelectItem value="feedback">Góp ý cải tiến dịch vụ</SelectItem>
                          <SelectItem value="other">Chủ đề khác</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nội dung chi tiết <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Mô tả cụ thể câu hỏi hoặc yêu cầu hỗ trợ của bạn..."
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="resize-none"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Thông tin của bạn luôn được bảo mật tuyệt đối.
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-6 font-semibold">
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Đang gửi...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="w-4 h-4" />
                          Gửi Tin Nhắn
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (40%): Departments, Transit & Location Map */}
          <div className="lg:col-span-5 space-y-6">
            {/* Departments */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  Danh Bạ Phòng Ban Chuyên Trách
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {departments.map((dept, i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30 space-y-1 text-sm">
                    <div className="font-semibold text-foreground">{dept.name}</div>
                    <p className="text-xs text-muted-foreground">{dept.desc}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Phone className="w-3 h-3 text-primary" /> {dept.phone}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Mail className="w-3 h-3 text-primary" /> {dept.email}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Transit & Parking */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Bus className="w-4 h-4 text-primary" />
                  Chỉ Dẫn Đường Đi & Bãi Đỗ Xe
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5 pt-0">
                {transitGuides.map((tg, i) => {
                  const Icon = tg.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border bg-background">
                      <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">{tg.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{tg.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Map Preview */}
            <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Vị Trí Bản Đồ
                  </CardTitle>
                  <a
                    href="https://maps.google.com/?q=Ho+Chi+Minh+City"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    Mở Google Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative w-full h-48 bg-muted border-t flex items-center justify-center overflow-hidden">
                  <iframe
                    title="Bản đồ Thư viện"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602377317774!2d106.69752831480084!3d10.776019992321855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f385570472f%3A0x17874917372365e4!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Câu Hỏi Thường Gặp (FAQ)</CardTitle>
                <CardDescription>Giải đáp nhanh những thắc mắc phổ biến của bạn đọc</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-lg border bg-background transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-4 font-semibold text-sm flex items-center justify-between gap-4 hover:bg-muted/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-sm text-muted-foreground border-t bg-muted/20 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DefaultLayout>
  );
}
