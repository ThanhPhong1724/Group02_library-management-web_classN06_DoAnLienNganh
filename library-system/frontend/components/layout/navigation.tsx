"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
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
  User,
  LogOut,
  Settings,
  Menu,
  X,
  Home,
  Search,
  MessageCircle,
  FileText,
  BarChart3,
  Users,
  Clock,
} from 'lucide-react';

export function Navigation() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">Thư viện</span>
          </div>
          <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-primary transition-colors">
              Thư viện
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-primary transition-colors">
              Tìm kiếm
            </Link>
            <Link href="/rules" className="text-gray-600 hover:text-primary transition-colors">
              Nội quy
            </Link>
            
            {isAuthenticated && (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">
                  Hồ sơ
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="text-gray-600 hover:text-primary transition-colors">
                    Quản trị
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
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
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span>Tìm kiếm</span>
              </Link>
              <Link
                href="/rules"
                className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span>Nội quy</span>
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Hồ sơ</span>
                  </Link>
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Quản trị</span>
                      </Link>
                      <Link
                        href="/admin/books"
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BookOpen className="h-4 w-4" />
                        <span>Quản lý sách</span>
                      </Link>
                      <Link
                        href="/admin/users"
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Quản lý thành viên</span>
                      </Link>
                      <Link
                        href="/admin/loans"
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Clock className="h-4 w-4" />
                        <span>Quản lý mượn trả</span>
                      </Link>
                      <Link
                        href="/admin/settings"
                        className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Cài đặt</span>
                      </Link>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 justify-start"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
