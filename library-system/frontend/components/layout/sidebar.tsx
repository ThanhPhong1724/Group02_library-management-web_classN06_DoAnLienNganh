"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  BookOpen,
  Copy,
  MapPin,
  Clock,
  BarChart3,
  FileText,
  Settings,
  Users,
  Bell
} from 'lucide-react';
import { reportsAPI } from '@/lib/api';

const adminLinks = [
  { 
    href: '/admin', 
    label: 'Dashboard', 
    icon: LayoutDashboard,
    description: 'Tổng quan hệ thống'
  },
  { 
    href: '/admin/books', 
    label: 'Quản lý sách', 
    icon: BookOpen,
    description: 'Thêm, sửa, xóa sách'
  },
  { 
    href: '/admin/copies', 
    label: 'Bản sao', 
    icon: Copy,
    description: 'Quản lý bản sao sách'
  },
  {
    href: '/admin/publishers',
    label: 'Nhà xuất bản',
    icon: FileText, // hoặc chọn icon phù hợp
    description: 'Quản lý nhà xuất bản'
  },
  { 
    href: '/admin/locations', 
    label: 'Vị trí kệ', 
    icon: MapPin,
    description: 'Quản lý vị trí sách'
  },
  { 
    href: '/admin/loans', 
    label: 'Mượn trả', 
    icon: Clock,
    description: 'Quản lý giao dịch'
  },
  { 
    href: '/admin/users', 
    label: 'Thành viên', 
    icon: Users,
    description: 'Quản lý người dùng'
  },
  { 
    href: '/admin/reports', 
    label: 'Báo cáo', 
    icon: BarChart3,
    description: 'Thống kê và báo cáo'
  },
  { 
    href: '/admin/rules', 
    label: 'Nội quy', 
    icon: FileText,
    description: 'Quản lý nội quy thư viện'
  },
  { 
    href: '/admin/notifications', 
    label: 'Thông báo', 
    icon: Bell,
    description: 'Gửi thông báo'
  },
  { 
    href: '/admin/settings', 
    label: 'Cài đặt', 
    icon: Settings,
    description: 'Cấu hình hệ thống'
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<{ total_books: number, total_loans: number, total_users: number } | null>(null);
  useEffect(() => {
    reportsAPI.getOverview().then(res => {
      if (res.success && res.data) setStats(res.data);
    });
  }, []);

  return (
    <aside className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground">Quản trị</h2>
          <p className="text-sm text-muted-foreground">Quản lý thư viện</p>
        </div>

        <nav className="space-y-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted hover:text-foreground",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground"
                )}
                title={link.description}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                <span className="truncate">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-sm font-medium text-foreground mb-3">Thống kê nhanh</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tổng sách:</span>
              <span className="font-medium">{stats ? stats.total_books : '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đang mượn:</span>
              <span className="font-medium">{stats ? stats.total_loans : '...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Thành viên:</span>
              <span className="font-medium">{stats ? stats.total_users : '...'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
