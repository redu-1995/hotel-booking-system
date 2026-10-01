'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { apiFetch, apiList } from '../../lib/api/client';

type StaffNotification = {
  id: number;
  booking_reference: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<StaffNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([
      apiList<StaffNotification>('/notifications/'),
      apiFetch<{ count: number }>('/notifications/unread-count/'),
    ]).then(([items, unread]) => {
      if (isCurrent) {
        setNotifications(items);
        setUnreadCount(unread.count);
      }
    }).catch(() => undefined);
    return () => { isCurrent = false; };
  }, []);

  async function markRead(notification: StaffNotification) {
    if (notification.is_read) return;
    try {
      await apiFetch<StaffNotification>(`/notifications/${notification.id}/mark_read/`, { method: 'POST' });
      setNotifications((items) => items.map((item) => (
        item.id === notification.id ? { ...item, is_read: true } : item
      )));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      return;
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="relative grid size-10 place-items-center border border-[#d8ded5] bg-[#f7f8f3] text-[#24352d] hover:bg-white"
      >
        <Bell aria-hidden="true" className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[var(--coral)] px-1 text-[10px] font-bold leading-5 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <section className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] border border-[#d8ded5] bg-[#fffefa] shadow-lg">
          <div className="flex items-center justify-between border-b border-[#d8ded5] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#24352d]">Notifications</h2>
            <span className="text-xs text-[#65736a]">{unreadCount} unread</span>
          </div>
          {notifications.length ? (
            <ul className="max-h-[min(28rem,70vh)] overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id} className="border-b border-[#e5e8e2] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => markRead(notification)}
                    className="flex w-full gap-3 px-4 py-3 text-left hover:bg-[#f3f5ef]"
                  >
                    <span className={notification.is_read ? 'mt-1 size-2 shrink-0' : 'mt-1 size-2 shrink-0 rounded-full bg-[var(--coral)]'} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#24352d]">{notification.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#65736a]">{notification.message}</span>
                      <span className="mt-1 block font-mono text-[11px] text-[#65736a]">{notification.booking_reference}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-6 text-sm text-[#65736a]">No notifications yet.</p>
          )}
        </section>
      )}
    </div>
  );
}