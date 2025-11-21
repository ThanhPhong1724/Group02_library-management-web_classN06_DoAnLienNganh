"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Library, 
  BookOpen, 
  Users, 
  Award, 
  Globe, 
  Target, 
  Heart, 
  Lightbulb, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  CheckCircle, 
  Star, 
  TrendingUp, 
  Shield
} from 'lucide-react';
import { DefaultLayout } from '@/components/layout/default-layout';

// Mock data
const libraryStats = [
  { label: 'Sách', value: '50,000+', icon: BookOpen, description: 'Đầu sách đa dạng' },
  { label: 'Thành viên', value: '15,000+', icon: Users, description: 'Người dùng tích cực' },
  { label: 'Danh mục', value: '200+', icon: Library, description: 'Chủ đề phong phú' },
  { label: 'Năm thành lập', value: '1995', icon: Award, description: 'Lịch sử lâu đời' }
];

const libraryFeatures = [
  {
    title: 'Thư viện số hiện đại',
    description: 'Hệ thống quản lý sách tự động, tìm kiếm nhanh chóng',
    icon: Library,
    benefits: ['Tìm kiếm thông minh', 'Đặt trước online', 'Thông báo tự động']
  },
  {
    title: 'Không gian học tập',
    description: 'Phòng đọc rộng rãi, yên tĩnh với đầy đủ tiện nghi',
    icon: BookOpen,
    benefits: ['Phòng đọc yên tĩnh', 'WiFi miễn phí', 'Điều hòa không khí']
  },
  {
    title: 'Dịch vụ hỗ trợ',
    description: 'Đội ngũ nhân viên chuyên nghiệp, nhiệt tình hỗ trợ',
    icon: Users,
    benefits: ['Tư vấn chọn sách', 'Hướng dẫn sử dụng', 'Giải đáp thắc mắc']
  }
];

const libraryHistory = [
  {
    year: '1995',
    title: 'Thành lập',
    description: 'Thư viện được thành lập với 5,000 đầu sách ban đầu'
  },
  {
    year: '2005',
    title: 'Mở rộng',
    description: 'Xây dựng thêm 2 tầng với phòng đọc chuyên biệt'
  },
  {
    year: '2015',
    title: 'Số hóa',
    description: 'Triển khai hệ thống quản lý thư viện số'
  },
  {
    year: '2023',
    title: 'Hiện đại hóa',
    description: 'Cập nhật công nghệ mới, mở rộng bộ sưu tập sách'
  }
];

const teamMembers = [
  {
    name: 'Nguyễn Văn A',
    position: 'Giám đốc thư viện',
    experience: '15 năm kinh nghiệm',
    expertise: 'Quản lý thông tin, Phát triển bộ sưu tập'
  },
  {
    name: 'Trần Thị B',
    position: 'Phó giám đốc',
    experience: '12 năm kinh nghiệm',
    expertise: 'Dịch vụ người dùng, Đào tạo nhân viên'
  },
  {
    name: 'Lê Văn C',
    position: 'Trưởng phòng kỹ thuật',
    experience: '10 năm kinh nghiệm',
    expertise: 'Hệ thống thông tin, Công nghệ thư viện'
  }
];

// Component for displaying statistics
const StatCard = ({ label, value, icon: Icon, description }: {
  label: string;
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
      <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Component for displaying features
const FeatureCard = ({ title, description, icon: Icon, benefits }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  benefits: string[];
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-primary rounded-lg text-primary-foreground">
          <Icon className="w-6 h-6" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-primary" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// Component for timeline items
const TimelineItem = ({ year, title, description }: {
  year: string;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
        {year}
      </div>
    </div>
    <div className="flex-1 pt-2">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// Component for team member cards
const TeamMemberCard = ({ name, position, experience, expertise }: {
  name: string;
  position: string;
  experience: string;
  expertise: string;
}) => (
  <Card>
    <CardContent className="p-6 text-center">
      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
        {name.charAt(0)}
      </div>
      <h4 className="font-semibold mb-1">{name}</h4>
      <p className="text-sm text-primary mb-2">{position}</p>
      <p className="text-xs text-muted-foreground mb-3">{experience}</p>
      <p className="text-xs text-muted-foreground">{expertise}</p>
    </CardContent>
  </Card>
);

export default function AboutPage() {
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
            <h1 className="text-4xl font-bold mb-4">Về chúng tôi</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Thư viện ABC là một trong những thư viện hàng đầu tại TP.HCM, 
              cung cấp dịch vụ thông tin chất lượng cao cho cộng đồng học tập và nghiên cứu
            </p>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {libraryStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Target className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Sứ mệnh</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Cung cấp nguồn thông tin đa dạng, chất lượng cao và dịch vụ thư viện 
                chuyên nghiệp để hỗ trợ việc học tập, nghiên cứu và phát triển cộng đồng.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Tầm nhìn</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Trở thành thư viện tiên tiến, hiện đại, là trung tâm thông tin 
                và văn hóa quan trọng của thành phố và khu vực.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Tính năng nổi bật</h2>
            <p className="text-muted-foreground">
              Những điểm mạnh và dịch vụ đặc biệt của thư viện
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {libraryFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* History Timeline */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Lịch sử phát triển</h2>
            <p className="text-muted-foreground">
              Hành trình xây dựng và phát triển của thư viện
            </p>
          </div>
          
          <Card>
            <CardContent className="p-8">
              <div className="space-y-8">
                {libraryHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <TimelineItem {...item} />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Đội ngũ nhân viên</h2>
            <p className="text-muted-foreground">
              Những người đang làm việc để phục vụ bạn tốt nhất
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TeamMemberCard {...member} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Giá trị cốt lõi</h2>
            <p className="text-muted-foreground">
              Những nguyên tắc và giá trị định hướng hoạt động của chúng tôi
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Tận tâm</h4>
                <p className="text-sm text-muted-foreground">
                  Phục vụ người dùng với sự nhiệt tình và tận tâm
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
                  <Shield className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Chất lượng</h4>
                <p className="text-sm text-muted-foreground">
                  Đảm bảo chất lượng dịch vụ và thông tin cung cấp
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Đổi mới</h4>
                <p className="text-sm text-muted-foreground">
                  Không ngừng cải tiến và áp dụng công nghệ mới
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-primary rounded-lg text-primary-foreground w-fit mx-auto mb-4">
                  <Globe className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Hội nhập</h4>
                <p className="text-sm text-muted-foreground">
                  Mở rộng hợp tác và hội nhập quốc tế
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                  <MapPin className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Thông tin liên hệ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Địa chỉ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>123 Đường ABC, Quận 1, TP.HCM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Thứ 2 - Chủ nhật: 7:00 - 21:00</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Liên hệ</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>(028) 1234-5678</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>info@library.edu.vn</span>
                    </div>
                  </div>
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
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Khám phá thư viện</h3>
              <p className="text-muted-foreground mb-6">
                Hãy đến và trải nghiệm dịch vụ thư viện chất lượng cao của chúng tôi
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Đăng ký thẻ thư viện
                </Button>
                <Button variant="outline" size="lg">
                  <MapPin className="w-4 h-4 mr-2" />
                  Xem bản đồ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
