import { create } from 'zustand';
import { notificationsApi } from '@/services/api';

interface NotificationState {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  fetchCount: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    try {
      const notifications = await notificationsApi.list();
      set({ notifications });
    } catch {
      // silently fail
    }
  },

  fetchCount: async () => {
    try {
      const { count } = await notificationsApi.count();
      set({ unreadCount: count });
    } catch {
      set({ unreadCount: 0 });
    }
  },

  markRead: async (id) => {
    await notificationsApi.markRead(id);
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: 1 } : n
    );
    set({ notifications, unreadCount: Math.max(0, get().unreadCount - 1) });
  },

  markAllRead: async () => {
    await notificationsApi.markAllRead();
    const notifications = get().notifications.map((n) => ({ ...n, read: 1 }));
    set({ notifications, unreadCount: 0 });
  },
}));
