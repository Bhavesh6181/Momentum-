import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications";
import { useNotificationStore } from "../store/notificationStore";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { setNotifications } = useNotificationStore();

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await notificationsService.getNotifications();
      if (data) {
        setNotifications(data);
      }
      return data;
    },
  });

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Poll count every 30s
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });

  return {
    notifications: notificationsQuery.data,
    isLoadingNotifications: notificationsQuery.isLoading,

    unreadCount: unreadCountQuery.data,
    isLoadingUnreadCount: unreadCountQuery.isLoading,

    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
  };
};
