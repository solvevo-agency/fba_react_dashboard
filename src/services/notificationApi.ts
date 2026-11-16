import { apiClient, type ApiResponse } from './api';

export interface NotificationItem {
  id: number;
  user_id?: number | null;
  type:
    | 'system_update'
    | 'feature_release'
    | 'thread_reply'
    | 'thread_upvote'
    | 'course_update'
    | 'quiz_result'
    | 'certificate_issued'
    | 'subscription_alert'
    | 'user_registered'
    | 'course_enrolled'
    | 'community_post'
    | string;
  title: string;
  message: string;
  action_url?: string | null;
  metadata?: Record<string, unknown> | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
  } | null;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  unread_count: number;
}

export const notificationApi = {
  getAll: async (
    status: 'all' | 'unread' | 'read' = 'all',
    page = 1,
    limit = 20
  ): Promise<{ meta: NotificationListMeta; data: NotificationItem[] }> => {
    const res = await apiClient.get<
      ApiResponse<{ meta: NotificationListMeta; notifications: NotificationItem[] }>
    >('/super-admin/notifications', {
      params: { status, page, limit },
    });
    return {
      meta: res.data.data.meta,
      data: res.data.data.notifications,
    };
  },

  getUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get<ApiResponse<{ unread_count: number }>>(
      '/super-admin/notifications/unread-count'
    );
    return res.data.data.unread_count;
  },

  markAsRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.patch<ApiResponse<NotificationItem>>(
      `/super-admin/notifications/${id}/read`
    );
    return res.data.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/super-admin/notifications/mark-all-read');
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/super-admin/notifications/${id}`);
  },

  clearAll: async (): Promise<void> => {
    await apiClient.delete('/super-admin/notifications/clear-all');
  },
};
