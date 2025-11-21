"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle,
  Star,
  Award,
  Bookmark,
  Library,
  GraduationCap,
  ExternalLink,
  Clock,
  MapPin,
  Phone,
  Mail,
  Info
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';

// Mock data for library rules
const libraryRules = [
  {
    id: 1,
    title: 'Quy định mượn sách',
    category: 'Mượn trả',
    icon: Bookmark,
    rules: [
      'Mỗi thẻ thư viện được mượn tối đa 5 cuốn sách',
      'Thời hạn mượn sách là 14 ngày',
      'Có thể gia hạn thêm 7 ngày nếu không có người đặt trước',
      'Sách quý hiếm chỉ được đọc tại chỗ, không được mượn về'
    ]
  },
  {
    id: 2,
    title: 'Quy định sử dụng thư viện',
    category: 'Nội quy',
    icon: Library,
    rules: [
      'Giữ trật tự, không làm ồn ảnh hưởng người khác',
      'Không mang đồ ăn, thức uống vào phòng đọc',
      'Tắt điện thoại hoặc để chế độ im lặng',
      'Bảo quản sách, không làm rách, bẩn hoặc ghi chú'
    ]
  },
  {
    id: 3,
    title: 'Quy định đặt trước sách',
    category: 'Đặt trước',
    icon: Star,
    rules: [
      'Có thể đặt trước sách đang được mượn',
      'Thời gian giữ sách đặt trước là 3 ngày',
      'Thông báo qua email hoặc SMS khi sách có sẵn',
      'Không nhận sách sau 3 ngày sẽ bị hủy đặt trước'
    ]
  },
  {
    id: 4,
    title: 'Quy định xử phạt',
    category: 'Xử phạt',
    icon: Award,
    rules: [
      'Phạt 5.000đ/ngày cho sách trả muộn',
      'Phạt 50.000đ cho sách bị mất hoặc hư hỏng',
      'Tạm khóa thẻ 1 tháng nếu vi phạm nghiêm trọng',
      'Bồi thường 100% giá trị sách nếu làm mất'
    ]
  }
];

// Component for displaying individual rules
const RuleCard = ({ rule }: { rule: (typeof libraryRules)[0] }) => {
  const Icon = rule.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-lg text-primary-foreground">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold mb-2">{rule.title}</CardTitle>
              <Badge variant="secondary" className="text-xs font-medium">
                {rule.category}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {rule.rules.map((ruleText, index) => (
              <motion.li
                key={index}
                className="flex items-start gap-3 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="p-1 rounded-full bg-primary text-primary-foreground flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <span className="leading-relaxed">{ruleText}</span>
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Component for displaying information cards
const InfoCard = ({ 
  title, 
  children, 
  icon: Icon 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary rounded-lg text-primary-foreground">
          <Icon className="w-5 h-5" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

// Component for displaying statistics
const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  description 
}: { 
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
      <h3 className="text-2xl font-bold mb-2">{value}</h3>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default function RulesPage() {
  return (
    <DefaultLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Header */}
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
            <h1 className="text-4xl font-bold mb-4">Nội quy thư viện</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Những quy định và hướng dẫn cần thiết để sử dụng thư viện một cách hiệu quả và văn minh
            </p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard
            title="Tổng số quy định"
            value="4"
            icon={Bookmark}
            description="Các nhóm quy định chính"
          />
          <StatCard
            title="Thời gian mượn"
            value="14 ngày"
            icon={Clock}
            description="Thời hạn mượn sách tiêu chuẩn"
          />
          <StatCard
            title="Sách tối đa"
            value="5 cuốn"
            icon={Library}
            description="Số sách có thể mượn cùng lúc"
          />
          <StatCard
            title="Phí trễ hạn"
            value="5.000đ"
            icon={Award}
            description="Phí phạt mỗi ngày trễ hạn"
          />
        </div>

        {/* Library Information */}
        <div className="mb-12">
          <InfoCard title="Thông tin thư viện" icon={Info}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Thông tin liên hệ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>123 Đường ABC, Quận 1, TP.HCM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>(028) 1234-5678</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>thuvien@example.com</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Giờ mở cửa</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Thứ 2 - Thứ 6: 7:00 - 21:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Thứ 7: 8:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Chủ nhật: 8:00 - 17:00</span>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Rules Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Các quy định chi tiết</h2>
            <p className="text-muted-foreground">
              Tìm hiểu chi tiết về các quy định và hướng dẫn sử dụng thư viện
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {libraryRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <Card className="mb-12 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Info className="w-5 h-5" />
              Lưu ý quan trọng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-orange-700">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Vui lòng đọc kỹ nội quy trước khi sử dụng thư viện</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Mọi thắc mắc vui lòng liên hệ nhân viên thư viện</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>Thư viện có quyền từ chối phục vụ nếu vi phạm nội quy</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="mb-12">
          <InfoCard title="Liên hệ hỗ trợ" icon={Phone}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Phone className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Điện thoại</h4>
                <p className="text-sm text-muted-foreground">(028) 1234-5678</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Mail className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Email</h4>
                <p className="text-sm text-muted-foreground">thuvien@example.com</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-1">Địa chỉ</h4>
                <p className="text-sm text-muted-foreground">123 Đường ABC, Q1, TP.HCM</p>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground mb-4">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bắt đầu sử dụng thư viện</h3>
              <p className="text-muted-foreground mb-6">
                Đăng ký thẻ thư viện ngay hôm nay để tận hưởng dịch vụ tốt nhất
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Đăng ký thẻ thư viện
                </Button>
                <Button variant="outline" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Liên hệ tư vấn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
