import { apiClient, type ApiResponse } from './api';

export interface ContactInquiryItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'responded';
  status_code: number;
  created_at: string;
  created_at_full: string;
}

export interface NewsletterSubscriberItem {
  id: number;
  email: string;
  date: string;
  date_full: string;
  status: 'active' | 'unsubscribed';
}

export interface InquiryMetrics {
  total_inquiries: number;
  pending_inquiries: number;
  responded_inquiries: number;
  newsletter_subscribers: number;
}

export const inquiryApi = {
  getMetrics: async (): Promise<InquiryMetrics> => {
    const res = await apiClient.get<ApiResponse<InquiryMetrics>>('/super-admin/inquiries/metrics');
    return res.data.data;
  },

  getAllInquiries: async (
    search?: string,
    status?: 'all' | 'new' | 'responded'
  ): Promise<ContactInquiryItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;

    const res = await apiClient.get<ApiResponse<ContactInquiryItem[]>>('/super-admin/inquiries', {
      params,
    });
    return res.data.data;
  },

  getInquiryById: async (id: number): Promise<ContactInquiryItem> => {
    const res = await apiClient.get<ApiResponse<ContactInquiryItem>>(`/super-admin/inquiries/${id}`);
    return res.data.data;
  },

  updateInquiryStatus: async (id: number, status: number): Promise<ContactInquiryItem> => {
    const res = await apiClient.patch<ApiResponse<ContactInquiryItem>>(
      `/super-admin/inquiries/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  deleteInquiry: async (id: number): Promise<{ id: number; message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; message: string }>>(
      `/super-admin/inquiries/${id}`
    );
    return res.data.data;
  },

  getAllNewsletters: async (search?: string): Promise<NewsletterSubscriberItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();

    const res = await apiClient.get<ApiResponse<NewsletterSubscriberItem[]>>(
      '/super-admin/inquiries/newsletters',
      { params }
    );
    return res.data.data;
  },

  deleteNewsletter: async (id: number): Promise<{ id: number; message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; message: string }>>(
      `/super-admin/inquiries/newsletters/${id}`
    );
    return res.data.data;
  },
};

