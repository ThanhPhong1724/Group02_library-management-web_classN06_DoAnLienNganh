import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { notificationsAPI, Notification } from '@/lib/api';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  refetchUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const res = await notificationsAPI.getAll();
    if (res.success && Array.isArray(res.data)) {
      setNotifications(res.data);
    }
    setLoading(false);
  }, []);

  const refetchUnreadCount = useCallback(async () => {
    const res = await notificationsAPI.getUnreadCount();
    if (res.success && typeof res.data === 'number') {
      setUnreadCount(res.data);
    }
  }, []);

  const markRead = useCallback(async (id: number) => {
    await notificationsAPI.markRead(id);
    await fetchNotifications();
    await refetchUnreadCount();
  }, [fetchNotifications, refetchUnreadCount]);

  const markAllRead = useCallback(async () => {
    await notificationsAPI.markAllRead();
    await fetchNotifications();
    await refetchUnreadCount();
  }, [fetchNotifications, refetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    refetchUnreadCount();

    const handleUpdate = () => {
      fetchNotifications();
      refetchUnreadCount();
    };

    window.addEventListener('notification_updated', handleUpdate);
    window.addEventListener('loan_updated', handleUpdate);
    window.addEventListener('library:notification_updated', handleUpdate);
    window.addEventListener('library:loan_updated', handleUpdate);

    // Auto polling mỗi 15s để bắt kịp thông báo từ admin/user khác
    const interval = setInterval(() => {
      refetchUnreadCount();
    }, 15000);

    return () => {
      window.removeEventListener('notification_updated', handleUpdate);
      window.removeEventListener('loan_updated', handleUpdate);
      window.removeEventListener('library:notification_updated', handleUpdate);
      window.removeEventListener('library:loan_updated', handleUpdate);
      clearInterval(interval);
    };
  }, [fetchNotifications, refetchUnreadCount]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, refetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};
