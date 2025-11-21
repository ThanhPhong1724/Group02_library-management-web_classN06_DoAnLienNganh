"use client";
import React, { useState, useEffect } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Footer } from './footer';
import { useAuth } from '@/contexts/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationProvider } from '@/contexts/notification-context';

interface DefaultLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function DefaultLayout({ children, showSidebar = false }: DefaultLayoutProps) {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <Header 
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onToggleSidebar={toggleSidebar}
        />

        <div className="flex">
          {/* Sidebar - Desktop */}
          {showSidebar && isAuthenticated && user?.role === 'admin' && (
            <div className="hidden lg:block w-64 min-h-screen bg-card border-r">
              <Sidebar />
            </div>
          )}

          {/* Sidebar - Mobile */}
          <AnimatePresence>
            {isSidebarOpen && showSidebar && isAuthenticated && user?.role === 'admin' && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r shadow-2xl lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="sm" onClick={toggleSidebar}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <Sidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-h-screen">
            {children}
          </main>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </NotificationProvider>
  );
}


