"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useNotification } from '@/contexts/notification-context';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  BookOpen, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Menu,
  BarChart3,
  Users,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { motion } from 'framer-motion';

// Thêm mảng các mục menu chính để gợi ý search
const MAIN_MENU_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Danh mục sách', href: '/books' },
  { label: 'Quản lý sách', href: '/admin/books' },
  { label: 'Bản sao', href: '/admin/copies' },
  { label: 'Vị trí kệ', href: '/admin/locations' },
  { label: 'Mượn trả', href: '/admin/loans' },
  { label: 'Nhà xuất bản', href: '/admin/publishers' },
  { label: 'Thành viên', href: '/admin/users' },
  { label: 'Báo cáo', href: '/admin/reports' },
  { label: 'Nội quy', href: '/admin/rules' },
  { label: 'Thông báo', href: '/admin/notifications' },
  { label: 'Cài đặt', href: '/admin/settings' },
];

// Sửa fetchBooksLite để gọi API thật
async function fetchBooksLite(query: string): Promise<Array<{id: number, title: string, author: string}>> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/books?search=${encodeURIComponent(query)}&limit=5`);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.items) return [];
  return data.items.map((b: any) => ({ id: b.id, title: b.title || b.tieu_de || '', author: b.authors || b.tac_gia || '' }));
}

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onToggleSidebar: () => void;
}

export function Header({ isDarkMode, onToggleDarkMode, onToggleSidebar }: HeaderProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{id?: number, title?: string, author?: string, label?: string, href?: string, type?: 'book' | 'menu'}>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sửa logic gợi ý search: gộp cả sách và menu
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        Promise.all([
          fetchBooksLite(searchQuery),
          Promise.resolve(
            MAIN_MENU_ITEMS.filter(item =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          )
        ]).then(([books, menus]) => {
          setSearchSuggestions([
            ...menus.map(m => ({ type: 'menu' as const, ...m })),
            ...books.map(b => ({ type: 'book' as const, ...b })),
          ]);
        }).finally(() => setIsSearching(false));
      } else {
        setSearchSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4 px-4">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <BookOpen className="h-5 w-5" aria-hidden />
            </motion.div>
            <span className="text-lg font-semibold">Thư viện</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link 
            href="/" 
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Trang chủ
          </Link>
          <Link 
            href="/books" 
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Danh mục sách
          </Link>
          <Link 
            href="/rules" 
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Nội quy
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="px-2"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/about">Giới thiệu</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/contact">Liên hệ</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">Trợ giúp</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/faq">FAQ</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Search Bar */}
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sách, tác giả..."
            className="pl-10 pr-4"
            aria-label="Tìm kiếm sách"
          />
          
          {/* Search Suggestions Dropdown */}
          {searchSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50"
            >
              {searchSuggestions.map((item, idx) =>
                item.type === 'menu' ? (
                  <Link
                    key={item.href || 'menu'}
                    href={item.href || '#'}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-semibold text-primary">{item.label}</span>
                  </Link>
                ) : (
                  <Link
                    key={item.id}
                    href={`/books/${item.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                  >
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.author}</p>
                    </div>
                  </Link>
                )
              )}
            </motion.div>
          )}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.div>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Thông báo" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 max-w-[95vw] p-0">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <span className="font-semibold text-base">Thông báo</span>
                {unreadCount > 0 && (
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={async (e) => { e.preventDefault(); await markAllRead(); }}
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">Đang tải...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">Không có thông báo nào.</div>
                ) : notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-accent transition-all ${!n.is_read ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}
                    onClick={async () => { if (!n.is_read) await markRead(n.id); }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <Bell className={`h-5 w-5 ${n.is_read ? 'text-muted-foreground' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${!n.is_read ? 'text-primary' : ''}`}>{n.title}</div>
                      {n.body && <div className="text-sm text-muted-foreground line-clamp-2">{n.body}</div>}
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: vi })}
                        {!n.is_read && <span className="ml-2 inline-block bg-primary text-primary-foreground rounded px-1 text-xs">Mới</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length > 10 && (
                  <div className="px-4 py-2 text-center">
                    <Link href="/admin/notifications" className="text-primary hover:underline text-sm">Xem tất cả thông báo</Link>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ cá nhân
                  </Link>
                </DropdownMenuItem>

                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/books" className="flex items-center">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Quản lý sách
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Quản lý thành viên
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/loans" className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Quản lý mượn trả
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Cài đặt
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="block border-t px-4 pb-3 pt-2 md:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm sách, tác giả..."
            className="pl-10"
            aria-label="Tìm kiếm sách"
          />
        </div>
      </div>
    </header>
  );
}
