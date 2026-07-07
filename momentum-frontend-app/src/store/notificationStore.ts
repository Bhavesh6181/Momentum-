import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: "invite" | "achievement" | "mention" | "streak" | "group";
  timestamp: string;
  initials?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (notification: Omit<NotificationItem, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  setNotifications: (notifications: NotificationItem[]) => void;
}

const defaultNotifications: NotificationItem[] = [
  { id: "n1", type: "invite", title: "Group Invite", message: "Priya Sharma invited you to join Machine Learning Research.", timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), read: false, initials: "PS" },
  { id: "n2", type: "achievement", title: "Achievement Unlocked!", message: "You earned the '14-Day Streak' badge. Keep going! 🔥", timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), read: false },
  { id: "n3", type: "mention", title: "Mentioned in Quantum Physics II", message: "Alex Chen: @you can you share your notes on wave functions?", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), read: false, initials: "AC" },
  { id: "n4", type: "streak", title: "Streak at Risk!", message: "You haven't studied today. 14-day streak will reset at midnight.", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: true },
  { id: "n5", type: "group", title: "New Session in Algorithms", message: "Anjali Patel started a 60-minute focus session. Join now!", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true, initials: "AP" },
];

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: defaultNotifications,
  unreadCount: defaultNotifications.filter((n) => !n.read).length,
  addNotification: (notification) =>
    set((state) => {
      const newItem: NotificationItem = {
        ...notification,
        id: Math.random().toString(36).substring(7),
        read: false,
        timestamp: new Date().toISOString(),
      };
      const updated = [newItem, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((state) => {
      const updated = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
}));
