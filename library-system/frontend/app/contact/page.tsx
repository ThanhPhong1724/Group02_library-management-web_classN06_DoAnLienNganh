"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';
import { toast } from 'sonner';

// Mock data
const contactInfo = [
  {
    title: 'Địa chỉ',
    value: '123 Đường ABC, Quận 1, TP.HCM',
    icon: MapPin,
    description: 'Trung tâm thành phố, dễ dàng tiếp cận'
  },
  {
    title: 'Điện thoại',
    value: '(028) 1234-5678',
    icon: Phone,
    description: 'Hỗ trợ từ 7:00 - 21:00 hàng ngày'
  },
  {
    title: 'Email',
    value: 'thuvien@example.com',
    icon: Mail,
    description: 'Phản hồi trong vòng 24 giờ'
  },
  {
    title: 'Giờ mở cửa',
    value: '7:00 - 21:00',
    icon: Clock,
    description: 'Thứ 2 - Chủ nhật (kể cả ngày lễ)'
  }
];

const departments = [
  {
    name: 'Phòng phục vụ bạn đọc',
    phone: '(028) 1234-5679',
    email: 'service@example.com',
    description: 'Hỗ trợ mượn trả sách, đăng ký thẻ'
  },
  {
    name: 'Phòng kỹ thuật',
    phone: '(028) 1234-5680',
    email: 'tech@example.com',
    description: 'Hỗ trợ hệ thống thư viện số'
  },
  {
    name: 'Phòng quản lý sách',
    phone: '(028) 1234-5681',
    email: 'books@example.com',
    description: 'Quản lý bộ sưu tập và mua sắm sách'
  }
];

const transportationOptions = [
  {
    name: 'Xe buýt',
    routes: ['Tuyến 01', 'Tuyến 02', 'Tuyến 03'],
    icon: Bus,
    description: 'Dừng ngay trước cửa thư viện'
  },
  {
    name: 'Xe máy',
    icon: Car,
    description: 'Bãi xe miễn phí trong khuôn viên'
  },
  {
    name: 'Tàu điện ngầm',
    icon: Train,
    description: 'Ga Metro cách 500m'
  }
];

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Tin nhắn đã được gửi thành công! Chúng tôi sẽ phản hồi sớm nhất.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Gửi tin nhắn cho chúng tôi
        </CardTitle>
        <CardDescription>
          Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại trong thời gian sớm nhất
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nhập họ và tên"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Số điện thoại
              </label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="0123 456 789"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Chủ đề *
              </label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Chủ đề tin nhắn"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-2">
              Nội dung tin nhắn *
            </label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="Mô tả chi tiết vấn đề hoặc câu hỏi của bạn..."
              rows={5}
              required
            />
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Contact Info Card Component
const ContactInfoCard = ({ title, value, icon: Icon, description }: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) => (
  <Card>
    <CardContent className="p-6 text-center">
      <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-lg font-medium mb-2">{value}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Department Card Component
const DepartmentCard = ({ name, phone, email, description }: {
  name: string;
  phone: string;
  email: string;
  description: string;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{name}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <Phone className="w-4 h-4 text-muted-foreground" />
        <span>{phone}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <span>{email}</span>
      </div>
    </CardContent>
  </Card>
);

// Transportation Option Component
const TransportationOption = ({ name, routes, icon: Icon, description }: {
  name: string;
  routes?: string[];
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) => (
  <Card>
    <CardContent className="p-6 text-center">
      <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-semibold mb-2">{name}</h4>
      {routes && (
        <div className="mb-3">
          {routes.map((route, index) => (
            <Badge key={index} variant="secondary" className="mr-1 mb-1">
              {route}
            </Badge>
          ))}
        </div>
      )}
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function ContactPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full text-primary-foreground mb-6">
              <Library className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Liên hệ với chúng tôi</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn. 
              Hãy liên hệ với chúng tôi qua các kênh sau
            </p>
          </motion.div>
        </div>

        {/* Main Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div>
            <ContactForm />
          </div>
          
          {/* Contact Info Cards */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ContactInfoCard {...info} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Departments Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Các phòng ban</h2>
            <p className="text-muted-foreground">
              Liên hệ trực tiếp với phòng ban phù hợp để được hỗ trợ tốt nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {departments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <DepartmentCard {...dept} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Transportation Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Hướng dẫn đi lại</h2>
            <p className="text-muted-foreground">
              Các phương tiện và tuyến đường thuận tiện để đến thư viện
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {transportationOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TransportationOption {...option} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Map Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Vị trí thư viện
              </CardTitle>
              <CardDescription>
                Thư viện nằm tại trung tâm thành phố, dễ dàng tiếp cận từ mọi hướng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Bản đồ sẽ được hiển thị tại đây</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cần hỗ trợ thêm?</h3>
              <p className="text-muted-foreground mb-6">
                Đội ngũ nhân viên của chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Gọi ngay
                </Button>
                <Button variant="outline" size="lg">
                  <Mail className="w-4 h-4 mr-2" />
                  Gửi email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
