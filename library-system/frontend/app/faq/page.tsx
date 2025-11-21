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
  CreditCard, 
  Info, 
  Library, 
  GraduationCap, 
  MapPin
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';

// Mock data
const faqCategories = [
  {
    id: 'general',
    title: 'Thông tin chung',
    description: 'Các câu hỏi cơ bản về thư viện',
    icon: Library,
    count: 8
  },
  {
    id: 'account',
    title: 'Tài khoản & Đăng ký',
    description: 'Hướng dẫn sử dụng tài khoản',
    icon: Users,
    count: 6
  },
  {
    id: 'borrowing',
    title: 'Mượn & Trả sách',
    description: 'Quy trình mượn trả sách',
    icon: BookOpen,
    count: 10
  },
  {
    id: 'technical',
    title: 'Hỗ trợ kỹ thuật',
    description: 'Vấn đề về hệ thống',
    icon: Shield,
    count: 5
  },
  {
    id: 'rules',
    title: 'Nội quy & Quy định',
    description: 'Các quy định của thư viện',
    icon: Info,
    count: 7
  }
];

const faqData = {
  general: [
    {
      question: 'Thư viện mở cửa vào những giờ nào?',
      answer: 'Thư viện mở cửa từ 7:00 - 21:00 từ thứ 2 đến chủ nhật, kể cả ngày lễ. Vào các ngày cuối tuần, thư viện mở cửa từ 8:00 - 20:00.',
      tags: ['Giờ mở cửa', 'Thời gian']
    },
    {
      question: 'Làm thế nào để đăng ký thẻ thư viện?',
      answer: 'Để đăng ký thẻ thư viện, bạn cần đến quầy dịch vụ với CMND/CCCD, ảnh 3x4 và đơn đăng ký. Hoặc có thể đăng ký trực tuyến qua website của thư viện.',
      tags: ['Đăng ký', 'Thẻ thư viện']
    },
    {
      question: 'Thẻ thư viện có phí không?',
      answer: 'Thẻ thư viện hoàn toàn miễn phí cho sinh viên và nhân viên của trường. Đối với người ngoài, phí đăng ký là 50.000đ/năm.',
      tags: ['Phí', 'Miễn phí']
    },
    {
      question: 'Thư viện có WiFi miễn phí không?',
      answer: 'Có, thư viện cung cấp WiFi miễn phí cho tất cả thành viên. Tốc độ kết nối ổn định và phủ sóng toàn bộ khu vực thư viện.',
      tags: ['WiFi', 'Internet']
    },
    {
      question: 'Có thể mang đồ ăn vào thư viện không?',
      answer: 'Không được phép mang đồ ăn vào khu vực đọc sách để giữ gìn vệ sinh. Tuy nhiên, bạn có thể sử dụng khu vực ăn uống riêng biệt.',
      tags: ['Đồ ăn', 'Nội quy']
    },
    {
      question: 'Thư viện có phòng học nhóm không?',
      answer: 'Có, thư viện có 5 phòng học nhóm với sức chứa từ 4-8 người. Bạn có thể đặt trước phòng qua hệ thống online hoặc tại quầy dịch vụ.',
      tags: ['Phòng học nhóm', 'Đặt phòng']
    },
    {
      question: 'Có thể sử dụng máy tính tại thư viện không?',
      answer: 'Có, thư viện có 20 máy tính công cộng với kết nối internet. Bạn cần đăng ký sử dụng tại quầy dịch vụ và có thời gian sử dụng tối đa 2 giờ.',
      tags: ['Máy tính', 'Internet']
    },
    {
      question: 'Thư viện có tủ khóa không?',
      answer: 'Có, thư viện cung cấp tủ khóa miễn phí cho thành viên. Bạn có thể gửi đồ cá nhân và nhận chìa khóa tại quầy dịch vụ.',
      tags: ['Tủ khóa', 'Gửi đồ']
    }
  ],
  account: [
    {
      question: 'Quên mật khẩu đăng nhập phải làm sao?',
      answer: 'Bạn có thể sử dụng chức năng "Quên mật khẩu" trên trang đăng nhập. Hệ thống sẽ gửi link đặt lại mật khẩu về email đã đăng ký.',
      tags: ['Mật khẩu', 'Đăng nhập']
    },
    {
      question: 'Có thể thay đổi thông tin cá nhân không?',
      answer: 'Có, bạn có thể cập nhật thông tin cá nhân trong phần "Hồ sơ" của tài khoản. Một số thông tin quan trọng cần xác nhận với nhân viên thư viện.',
      tags: ['Thông tin cá nhân', 'Cập nhật']
    },
    {
      question: 'Tài khoản bị khóa phải làm sao?',
      answer: 'Liên hệ ngay với nhân viên thư viện để được hỗ trợ mở khóa tài khoản. Tài khoản có thể bị khóa do vi phạm nội quy hoặc nợ phạt.',
      tags: ['Tài khoản bị khóa', 'Hỗ trợ']
    },
    {
      question: 'Có thể đăng ký nhiều email không?',
      answer: 'Hiện tại mỗi tài khoản chỉ được đăng ký một email chính. Bạn có thể thay đổi email trong phần cài đặt tài khoản.',
      tags: ['Email', 'Đăng ký']
    },
    {
      question: 'Làm sao để xóa tài khoản?',
      answer: 'Để xóa tài khoản, bạn cần trả hết sách đang mượn và thanh toán các khoản phạt (nếu có). Liên hệ nhân viên thư viện để được hỗ trợ.',
      tags: ['Xóa tài khoản', 'Hủy thẻ']
    },
    {
      question: 'Có thể chuyển nhượng thẻ thư viện không?',
      answer: 'Không, thẻ thư viện không được phép chuyển nhượng cho người khác. Mỗi thẻ chỉ được sử dụng bởi người đăng ký.',
      tags: ['Chuyển nhượng', 'Sử dụng']
    }
  ],
  borrowing: [
    {
      question: 'Mỗi lần được mượn tối đa bao nhiêu cuốn sách?',
      answer: 'Mỗi thẻ thư viện được mượn tối đa 5 cuốn sách cùng lúc. Sinh viên năm cuối có thể mượn thêm 2 cuốn.',
      tags: ['Số lượng sách', 'Giới hạn']
    },
    {
      question: 'Thời hạn mượn sách là bao lâu?',
      answer: 'Thời hạn mượn sách là 14 ngày, có thể gia hạn thêm 7 ngày nếu không có người đặt trước. Sách quý hiếm chỉ được mượn 7 ngày.',
      tags: ['Thời hạn', 'Gia hạn']
    },
    {
      question: 'Làm sao để đặt trước sách đang được mượn?',
      answer: 'Bạn có thể đặt trước sách thông qua hệ thống thư viện số hoặc liên hệ nhân viên thư viện. Sách sẽ được giữ trong 3 ngày kể từ khi có sẵn.',
      tags: ['Đặt trước', 'Sách đang mượn']
    },
    {
      question: 'Có thể mượn sách qua điện thoại không?',
      answer: 'Có, bạn có thể mượn sách qua ứng dụng mobile hoặc gọi điện đến quầy dịch vụ. Sách sẽ được giữ tại quầy trong 3 ngày.',
      tags: ['Mượn qua điện thoại', 'Ứng dụng']
    },
    {
      question: 'Làm sao để gia hạn sách?',
      answer: 'Bạn có thể gia hạn sách qua website, ứng dụng mobile hoặc gọi điện đến thư viện. Mỗi cuốn sách có thể được gia hạn tối đa 2 lần.',
      tags: ['Gia hạn', 'Thời hạn']
    },
    {
      question: 'Sách bị mất hoặc hư hỏng phải làm sao?',
      answer: 'Báo cáo ngay với nhân viên thư viện. Bạn cần bồi thường 100% giá trị sách hoặc mua sách mới tương đương.',
      tags: ['Sách mất', 'Bồi thường']
    },
    {
      question: 'Có thể mượn sách khi có sách quá hạn không?',
      answer: 'Không, bạn không thể mượn sách mới khi có sách quá hạn chưa trả. Hãy trả sách đúng hạn để tiếp tục sử dụng dịch vụ.',
      tags: ['Sách quá hạn', 'Hạn chế mượn']
    },
    {
      question: 'Làm sao để biết sách có sẵn không?',
      answer: 'Bạn có thể kiểm tra trạng thái sách qua website hoặc ứng dụng mobile. Hệ thống sẽ hiển thị số lượng sách có sẵn và vị trí đặt sách.',
      tags: ['Kiểm tra sách', 'Trạng thái']
    },
    {
      question: 'Có thể mượn sách ngoài giờ mở cửa không?',
      answer: 'Có, thư viện cung cấp dịch vụ mượn sách tự động 24/7 tại khu vực cửa chính. Bạn cần có thẻ thư viện để sử dụng.',
      tags: ['Mượn 24/7', 'Tự động']
    },
    {
      question: 'Làm sao để trả sách khi thư viện đóng cửa?',
      answer: 'Bạn có thể trả sách qua hộp thả sách tự động tại cửa chính. Sách sẽ được xử lý vào ngày làm việc tiếp theo.',
      tags: ['Trả sách', 'Hộp thả tự động']
    }
  ],
  technical: [
    {
      question: 'Không thể đăng nhập vào hệ thống?',
      answer: 'Kiểm tra kết nối internet và thử xóa cache trình duyệt. Nếu vẫn không được, liên hệ phòng kỹ thuật qua số (028) 1234-5680.',
      tags: ['Đăng nhập', 'Lỗi hệ thống']
    },
    {
      question: 'Ứng dụng mobile không hoạt động?',
      answer: 'Cập nhật ứng dụng lên phiên bản mới nhất hoặc gỡ cài đặt và cài lại. Nếu vẫn có vấn đề, liên hệ hỗ trợ kỹ thuật.',
      tags: ['Ứng dụng mobile', 'Lỗi']
    },
    {
      question: 'Tìm kiếm sách không hiển thị kết quả?',
      answer: 'Kiểm tra từ khóa tìm kiếm và thử sử dụng từ khóa khác. Nếu vẫn không có kết quả, liên hệ nhân viên thư viện để được hỗ trợ.',
      tags: ['Tìm kiếm', 'Kết quả']
    },
    {
      question: 'Không nhận được email thông báo?',
      answer: 'Kiểm tra thư mục spam và cài đặt email trong tài khoản. Đảm bảo email đăng ký chính xác và hoạt động.',
      tags: ['Email', 'Thông báo']
    },
    {
      question: 'Hệ thống bị lỗi khi thanh toán phí?',
      answer: 'Thử lại sau vài phút hoặc sử dụng phương thức thanh toán khác. Nếu vẫn gặp vấn đề, liên hệ phòng kỹ thuật.',
      tags: ['Thanh toán', 'Lỗi hệ thống']
    }
  ],
  rules: [
    {
      question: 'Phạt quá hạn bao nhiêu tiền?',
      answer: 'Phạt quá hạn là 5.000đ/ngày cho mỗi cuốn sách. Thẻ thư viện sẽ bị khóa nếu nợ phạt quá 50.000đ.',
      tags: ['Phạt quá hạn', 'Số tiền']
    },
    {
      question: 'Có được ăn uống trong thư viện không?',
      answer: 'Không được phép ăn uống trong khu vực đọc sách để giữ gìn vệ sinh và trật tự chung. Sử dụng khu vực ăn uống riêng biệt.',
      tags: ['Ăn uống', 'Nội quy']
    },
    {
      question: 'Có được sử dụng điện thoại trong thư viện không?',
      answer: 'Có thể sử dụng điện thoại nhưng phải để chế độ im lặng. Không được nói chuyện điện thoại trong khu vực đọc sách.',
      tags: ['Điện thoại', 'Im lặng']
    },
    {
      question: 'Có được mang cặp sách vào phòng đọc không?',
      answer: 'Có thể mang cặp sách vào phòng đọc nhưng phải để gọn gàng dưới gầm bàn. Không được đặt cặp lên bàn đọc.',
      tags: ['Cặp sách', 'Phòng đọc']
    },
    {
      question: 'Có được chụp ảnh tài liệu không?',
      answer: 'Có thể chụp ảnh tài liệu cho mục đích học tập và nghiên cứu. Không được chụp ảnh để thương mại hoặc chia sẻ công khai.',
      tags: ['Chụp ảnh', 'Tài liệu']
    },
    {
      question: 'Có được mang sách riêng vào thư viện không?',
      answer: 'Có thể mang sách riêng vào thư viện để tham khảo. Tuy nhiên, không được để sách riêng trên bàn đọc khi rời khỏi.',
      tags: ['Sách riêng', 'Tham khảo']
    },
    {
      question: 'Có được ngủ trong thư viện không?',
      answer: 'Không được phép ngủ trong thư viện để đảm bảo trật tự và vệ sinh. Nhân viên sẽ nhắc nhở nếu phát hiện.',
      tags: ['Ngủ', 'Trật tự']
    }
  ]
};

// Search Component
const SearchFAQ = () => {
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
          Tìm kiếm câu hỏi
        </CardTitle>
        <CardDescription>
          Nhập từ khóa để tìm kiếm câu hỏi và câu trả lời liên quan
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

// FAQ Category Card Component
const FAQCategoryCard = ({ category, isActive, onClick }: {
  category: (typeof faqCategories)[0];
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
      <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
        <category.icon className="w-6 h-6" />
      </div>
      <h4 className="font-semibold mb-2">{category.title}</h4>
      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
      <Badge variant="secondary">{category.count} câu hỏi</Badge>
    </CardContent>
  </Card>
);

// FAQ Item Component
const FAQItem = ({ faq }: { faq: (typeof faqData.general)[0] }) => (
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
      <p className="text-muted-foreground pl-8 mb-3">
        {faq.answer}
      </p>
      <div className="flex flex-wrap gap-2 pl-8">
        {faq.tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function FAQPage() {
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
            <h1 className="text-4xl font-bold mb-4">Câu hỏi thường gặp</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Tìm kiếm câu trả lời cho các câu hỏi phổ biến về thư viện và dịch vụ
            </p>
          </motion.div>
        </div>

        {/* Search Section */}
        <div className="mb-12">
          <SearchFAQ />
        </div>

        {/* FAQ Categories */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Danh mục câu hỏi</h2>
            <p className="text-muted-foreground">
              Chọn danh mục phù hợp để tìm kiếm câu trả lời cần thiết
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {faqCategories.map((category) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <FAQCategoryCard
                  category={category}
                  isActive={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Câu hỏi chi tiết</h2>
            <p className="text-muted-foreground">
              Tìm kiếm câu trả lời cho các câu hỏi trong danh mục đã chọn
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  {faqCategories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {faqCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="space-y-4">
                      {faqData[category.id as keyof typeof faqData]?.map((faq, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <FAQItem faq={faq} />
                        </motion.div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Contact Support Section */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Không tìm thấy câu trả lời?
              </CardTitle>
              <CardDescription>
                Nếu bạn không tìm thấy câu trả lời, hãy liên hệ với chúng tôi để được hỗ trợ
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
