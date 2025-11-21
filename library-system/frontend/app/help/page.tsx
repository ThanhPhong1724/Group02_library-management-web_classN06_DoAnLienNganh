"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Globe, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  ArrowRight, 
  Star, 
  Bookmark, 
  Calendar, 
  Shield, 
  CreditCard
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';

// Mock data
const helpCategories = [
  {
    id: 'general',
    title: 'Thông tin chung',
    description: 'Các câu hỏi cơ bản về thư viện',
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  {
    id: 'account',
    title: 'Tài khoản & Đăng ký',
    description: 'Hướng dẫn sử dụng tài khoản',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    id: 'borrowing',
    title: 'Mượn & Trả sách',
    description: 'Quy trình mượn trả sách',
    icon: Bookmark,
    color: 'bg-purple-500'
  },
  {
    id: 'technical',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Vấn đề về hệ thống',
    icon: Shield,
    color: 'bg-orange-500'
  }
];

const faqData = {
  general: [
    {
      question: 'Thư viện mở cửa vào những giờ nào?',
      answer: 'Thư viện mở cửa từ 7:00 - 21:00 từ thứ 2 đến chủ nhật, kể cả ngày lễ.'
    },
    {
      question: 'Làm thế nào để đăng ký thẻ thư viện?',
      answer: 'Bạn có thể đăng ký thẻ thư viện tại quầy dịch vụ với CMND/CCCD và ảnh 3x4.'
    },
    {
      question: 'Thẻ thư viện có phí không?',
      answer: 'Thẻ thư viện hoàn toàn miễn phí cho sinh viên và nhân viên của trường.'
    }
  ],
  account: [
    {
      question: 'Quên mật khẩu đăng nhập phải làm sao?',
      answer: 'Bạn có thể sử dụng chức năng "Quên mật khẩu" hoặc liên hệ nhân viên thư viện để được hỗ trợ.'
    },
    {
      question: 'Có thể thay đổi thông tin cá nhân không?',
      answer: 'Có, bạn có thể cập nhật thông tin cá nhân trong phần "Hồ sơ" của tài khoản.'
    },
    {
      question: 'Tài khoản bị khóa phải làm sao?',
      answer: 'Liên hệ ngay với nhân viên thư viện để được hỗ trợ mở khóa tài khoản.'
    }
  ],
  borrowing: [
    {
      question: 'Mỗi lần được mượn tối đa bao nhiêu cuốn sách?',
      answer: 'Mỗi thẻ thư viện được mượn tối đa 5 cuốn sách cùng lúc.'
    },
    {
      question: 'Thời hạn mượn sách là bao lâu?',
      answer: 'Thời hạn mượn sách là 14 ngày, có thể gia hạn thêm 7 ngày nếu không có người đặt trước.'
    },
    {
      question: 'Làm sao để đặt trước sách đang được mượn?',
      answer: 'Bạn có thể đặt trước sách thông qua hệ thống thư viện số hoặc liên hệ nhân viên thư viện.'
    }
  ],
  technical: [
    {
      question: 'Không thể đăng nhập vào hệ thống?',
      answer: 'Kiểm tra kết nối internet và thử xóa cache trình duyệt. Nếu vẫn không được, liên hệ phòng kỹ thuật.'
    },
    {
      question: 'Ứng dụng mobile không hoạt động?',
      answer: 'Cập nhật ứng dụng lên phiên bản mới nhất hoặc gỡ cài đặt và cài lại.'
    },
    {
      question: 'Tìm kiếm sách không hiển thị kết quả?',
      answer: 'Kiểm tra từ khóa tìm kiếm và thử sử dụng từ khóa khác. Nếu vẫn không có kết quả, liên hệ nhân viên.'
    }
  ]
};

const tutorials = [
  {
    title: 'Hướng dẫn sử dụng thư viện số',
    description: 'Video hướng dẫn chi tiết cách sử dụng hệ thống thư viện số',
    type: 'video',
    duration: '15 phút',
    icon: Video,
    url: '#'
  },
  {
    title: 'Hướng dẫn mượn trả sách online',
    description: 'Tài liệu hướng dẫn từng bước mượn và trả sách qua hệ thống',
    type: 'document',
    duration: '10 phút',
    icon: FileText,
    url: '#'
  },
  {
    title: 'Hướng dẫn đặt trước sách',
    description: 'Cách đặt trước sách đang được mượn và nhận thông báo',
    type: 'document',
    duration: '8 phút',
    icon: Bookmark,
    url: '#'
  },
  {
    title: 'Hướng dẫn sử dụng ứng dụng mobile',
    description: 'Video hướng dẫn cài đặt và sử dụng ứng dụng thư viện trên điện thoại',
    type: 'video',
    duration: '12 phút',
    icon: Video,
    url: '#'
  }
];

// Search Component
const SearchHelp = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Tìm kiếm trợ giúp
        </CardTitle>
        <CardDescription>
          Nhập từ khóa để tìm kiếm câu hỏi và hướng dẫn liên quan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Nhập từ khóa tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Help Category Card Component
const HelpCategoryCard = ({ category, isActive, onClick }: {
  category: (typeof helpCategories)[0];
  isActive: boolean;
  onClick: () => void;
}) => (
  <Card 
    className={`cursor-pointer transition-all ${
      isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'
    }`}
    onClick={onClick}
  >
    <CardContent className="p-6 text-center">
      <div className={`p-3 ${category.color} rounded-lg text-white w-fit mx-auto mb-4`}>
        <category.icon className="w-6 h-6" />
      </div>
      <h4 className="font-semibold mb-2">{category.title}</h4>
      <p className="text-sm text-muted-foreground">{category.description}</p>
    </CardContent>
  </Card>
);

// Tutorial Card Component
const TutorialCard = ({ tutorial }: { tutorial: (typeof tutorials)[0] }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary rounded-lg text-primary-foreground">
          <tutorial.icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{tutorial.title}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary" className="text-xs">
              {tutorial.type === 'video' ? 'Video' : 'Tài liệu'}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {tutorial.duration}
            </span>
          </div>
        </div>
      </div>
      <CardDescription>{tutorial.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="outline" className="w-full">
        <ExternalLink className="w-4 h-4 mr-2" />
        Xem hướng dẫn
      </Button>
    </CardContent>
  </Card>
);

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general');

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
              <HelpCircle className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Trung tâm trợ giúp</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Tìm kiếm câu trả lời cho các câu hỏi thường gặp và hướng dẫn sử dụng thư viện
            </p>
          </motion.div>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <SearchHelp />
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Danh mục trợ giúp</h2>
            <p className="text-muted-foreground">
              Chọn danh mục phù hợp để tìm kiếm thông tin cần thiết
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {helpCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HelpCategoryCard
                  category={category}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Câu hỏi thường gặp</h2>
            <p className="text-muted-foreground">
              Tìm kiếm câu trả lời cho các câu hỏi phổ biến
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {helpCategories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {helpCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="space-y-4">
                      {faqData[category.id as keyof typeof faqData]?.map((faq, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-start gap-3">
                                <div className="p-1 bg-primary rounded-full text-primary-foreground flex-shrink-0 mt-1">
                                  <HelpCircle className="w-3 h-3" />
                                </div>
                                {faq.question}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground pl-8">
                                {faq.answer}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Tutorials Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Hướng dẫn chi tiết</h2>
            <p className="text-muted-foreground">
              Video và tài liệu hướng dẫn sử dụng thư viện
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((tutorial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TutorialCard tutorial={tutorial} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Cần hỗ trợ thêm?
              </CardTitle>
              <CardDescription>
                Nếu bạn không tìm thấy câu trả lời, hãy liên hệ với chúng tôi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Điện thoại</h4>
                  <p className="text-sm text-muted-foreground">(028) 1234-5678</p>
                  <p className="text-xs text-muted-foreground mt-1">Hỗ trợ 24/7</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Email</h4>
                  <p className="text-sm text-muted-foreground">support@example.com</p>
                  <p className="text-xs text-muted-foreground mt-1">Phản hồi trong 24h</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Chat trực tuyến</h4>
                  <p className="text-sm text-muted-foreground">Hỗ trợ real-time</p>
                  <p className="text-xs text-muted-foreground mt-1">Có sẵn 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <Card className="p-8">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Liên kết hữu ích</h3>
              <p className="text-muted-foreground mb-6">
                Truy cập các trang liên quan để có thêm thông tin
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Nội quy thư viện
                </Button>
                <Button variant="outline" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Lịch hoạt động
                </Button>
                <Button variant="outline" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Website chính thức
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
