import { apiClient, type ApiResponse } from './api';

export interface PaymentListItem {
  id: string; // Stripe Payment ID
  payment_db_id: number;
  invoice_id: string;
  student_name: string;
  student_email: string;
  student_avatar: string | null;
  course_title: string;
  course_id: number;
  tier_name: string;
  amount: number;
  currency: string;
  payment_method: string;
  date: string;
  status: 'succeeded' | 'failed';
  stripe_payment_id: string;
  stripe_customer_id: string;
  stripe_invoice_url: string;
  dashboard_url: string;
}

export interface PaymentMetrics {
  total_gross_revenue: number;
  monthly_revenue: number;
  completed_invoices: number;
  failed_invoices?: number;
  total_transactions: number;
}

export interface PaymentDetail extends PaymentListItem {
  student_phone?: string;
  course_uid?: string;
  subscription?: {
    id: number;
    status: string;
    valid_until: string;
  } | null;
}

export const paymentApi = {
  getMetrics: async (): Promise<PaymentMetrics> => {
    const res = await apiClient.get<ApiResponse<PaymentMetrics>>('/super-admin/payments/metrics');
    return res.data.data;
  },

  getAll: async (search?: string): Promise<PaymentListItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();

    const res = await apiClient.get<ApiResponse<PaymentListItem[]>>('/super-admin/payments', {
      params,
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<PaymentDetail> => {
    const res = await apiClient.get<ApiResponse<PaymentDetail>>(`/super-admin/payments/${id}`);
    return res.data.data;
  },

  delete: async (id: string): Promise<{ id: string; invoice_id: string; message: string }> => {
    const res = await apiClient.delete<
      ApiResponse<{ id: string; invoice_id: string; message: string }>
    >(`/super-admin/payments/${id}`);
    return res.data.data;
  },
};

