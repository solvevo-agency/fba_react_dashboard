import { apiClient, type ApiResponse } from './api';

export interface SubscriptionListItem {
  id: number;
  student_name: string;
  student_email: string;
  course_title: string;
  course_id: number;
  tier_name: string;
  tier_id: number;
  price: number;
  status: 'active' | 'cancelled';
  status_code: number;
  status_note: string;
  start_date: string;
  valid_until: string | null;
  stripe_customer_id: string;
}

export interface SubscriptionMetrics {
  total_subscriptions: number;
  active_passes: number;
  lifetime_passes: number;
  revoked_inactive: number;
}

export interface GrantAccessPayload {
  student_name: string;
  student_email: string;
  course_id: number;
  tier_name?: string;
  duration?: string;
}

export const subscriptionApi = {
  getMetrics: async (): Promise<SubscriptionMetrics> => {
    const res = await apiClient.get<ApiResponse<SubscriptionMetrics>>(
      '/super-admin/subscriptions/metrics'
    );
    return res.data.data;
  },

  getAll: async (search?: string, status?: string): Promise<SubscriptionListItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;

    const res = await apiClient.get<ApiResponse<SubscriptionListItem[]>>(
      '/super-admin/subscriptions',
      { params }
    );
    return res.data.data;
  },

  updateStatus: async (
    id: number,
    status: number
  ): Promise<{ id: number; status: string; message: string }> => {
    const res = await apiClient.patch<ApiResponse<{ id: number; status: string; message: string }>>(
      `/super-admin/subscriptions/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  grantAccess: async (payload: GrantAccessPayload): Promise<SubscriptionListItem> => {
    const res = await apiClient.post<ApiResponse<SubscriptionListItem>>(
      '/super-admin/subscriptions/grant-access',
      payload
    );
    return res.data.data;
  },

  delete: async (id: number): Promise<{ id: number; message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; message: string }>>(
      `/super-admin/subscriptions/${id}`
    );
    return res.data.data;
  },
};

