"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';

// Mock adapter for library rules/settings
async function fetchLibraryInfo(): Promise<{
  opening_hours: string;
  address: string;
  phone: string;
  email: string;
  social_links: Array<{ platform: string; url: string }>;
}> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: replace with real API call to /api/settings
  return {
    opening_hours: 'Thứ 2–6: 8:00–20:00; Thứ 7: 8:00–17:00; Chủ nhật: 9:00–16:00',
    address: '123 Trần Quang Khải, Quận 1, TP.HCM',
    phone: '0123 456 789',
    email: 'thuvien@example.com',
    social_links: [
      { platform: 'Facebook', url: 'https://facebook.com/thuvien' },
      { platform: 'Instagram', url: 'https://instagram.com/thuvien' },
      { platform: 'Twitter', url: 'https://twitter.com/thuvien' }
    ]
  };
}

export function Footer() {
  const [libraryInfo, setLibraryInfo] = useState<Awaited<ReturnType<typeof fetchLibraryInfo>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    fetchLibraryInfo()
      .then((info) => {
        if (isMounted) {
          setLibraryInfo(info);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'instagram':
        return <Instagram className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-screen-2xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Thư viện</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Khám phá kho tàng tri thức với hàng nghìn đầu sách chất lượng. 
              Đăng ký thành viên để mượn sách và sử dụng các dịch vụ thư viện.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Thông tin liên hệ</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-48" />
                  ) : (
                    libraryInfo?.address
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-32" />
                  ) : (
                    libraryInfo?.phone
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-40" />
                  ) : (
                    libraryInfo?.email
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Giờ mở cửa</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Giờ hoạt động</span>
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-full" />
              ) : (
                <div className="space-y-1">
                  {libraryInfo?.opening_hours.split(';').map((time, index) => (
                    <p key={index} className="text-xs">{time.trim()}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Social Links & Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Kết nối</h3>
            <div className="space-y-3">
              {/* Social Links */}
              <div className="flex gap-2">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded" />
                  ))
                ) : (
                  libraryInfo?.social_links.map((social) => (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors"
                      aria-label={`Theo dõi chúng tôi trên ${social.platform}`}
                    >
                      {getSocialIcon(social.platform)}
                    </a>
                  ))
                )}
              </div>

              {/* Quick Links */}
              <div className="space-y-2 text-sm">
                <Link href="/books" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Danh sách sách
                </Link>
                <Link href="/rules" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Nội quy thư viện
                </Link>
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Giới thiệu
                </Link>
                <Link href="/contact" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Liên hệ
                </Link>
                <Link href="/help" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Trợ giúp
                </Link>
                <Link href="/faq" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <p>© {new Date().getFullYear()} Thư viện. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Chính sách bảo mật
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Điều khoản sử dụng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
