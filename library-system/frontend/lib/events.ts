import { useEffect } from 'react';

export const APP_EVENTS = {
  LOAN_UPDATED: 'library:loan_updated',
  NOTIFICATION_UPDATED: 'library:notification_updated',
  BOOK_STOCK_CHANGED: 'library:book_stock_changed',
} as const;

export type AppEventName = typeof APP_EVENTS[keyof typeof APP_EVENTS];

/**
 * Phát sự kiện toàn hệ thống trên window object một cách an toàn
 */
export function emitAppEvent(eventName: AppEventName | string, detail?: unknown) {
  if (typeof window === 'undefined') return;

  // Phát CustomEvent chuẩn
  window.dispatchEvent(new CustomEvent(eventName, { detail }));

  // Đồng thời phát các legacy event tên ngắn để tương thích ngược
  if (eventName === APP_EVENTS.LOAN_UPDATED) {
    window.dispatchEvent(new Event('loan_updated'));
  }
  if (eventName === APP_EVENTS.NOTIFICATION_UPDATED) {
    window.dispatchEvent(new Event('notification_updated'));
  }
}

/**
 * Custom React Hook giúp component lắng nghe event và tự động cleanup khi unmount
 */
export function useAppEvent(
  eventName: AppEventName | string,
  callback: (event?: CustomEvent | Event) => void
) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handler = (e: Event) => {
      callback(e);
    };

    window.addEventListener(eventName, handler);

    // Cũng lắng nghe legacy event tương ứng
    let legacyName: string | null = null;
    if (eventName === APP_EVENTS.LOAN_UPDATED) legacyName = 'loan_updated';
    if (eventName === APP_EVENTS.NOTIFICATION_UPDATED) legacyName = 'notification_updated';
    if (legacyName) {
      window.addEventListener(legacyName, handler);
    }

    return () => {
      window.removeEventListener(eventName, handler);
      if (legacyName) {
        window.removeEventListener(legacyName, handler);
      }
    };
  }, [eventName, callback]);
}
