import { apiClient, type ApiResponse } from './api';

export interface ReviewItem {
  id: number;
  student_name: string;
  student_avatar: string | null;
  student_email: string;
  course_id: number;
  course_title: string;
  rating: number;
  review_title: string;
  review_text: string;
  is_featured: boolean;
  status: string;
  created_at: string;
  created_at_full: string;
}

export interface ReviewMetrics {
  total_reviews: number;
  average_rating: number;
  five_star_count: number;
  top_satisfaction_percentage: number;
}

export const reviewApi = {
  getMetrics: async (): Promise<ReviewMetrics> => {
    const res = await apiClient.get<ApiResponse<ReviewMetrics>>('/super-admin/reviews/metrics');
    return res.data.data;
  },

  getAll: async (search?: string, rating?: number): Promise<ReviewItem[]> => {
    const params: Record<string, string | number> = {};
    if (search && search.trim()) params.search = search.trim();
    if (rating !== undefined && rating > 0) params.rating = rating;

    const res = await apiClient.get<ApiResponse<ReviewItem[]>>('/super-admin/reviews', {
      params,
    });
    return res.data.data;
  },

  getById: async (id: number): Promise<ReviewItem> => {
    const res = await apiClient.get<ApiResponse<ReviewItem>>(`/super-admin/reviews/${id}`);
    return res.data.data;
  },

  delete: async (id: number): Promise<{ id: number; message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; message: string }>>(
      `/super-admin/reviews/${id}`
    );
    return res.data.data;
  },
};

