import { apiClient, type ApiResponse } from './api';

export interface CommunityCommentItem {
  id: number;
  post_id: number;
  user_id: number;
  author_name: string;
  author_email: string;
  author_avatar: string | null;
  author_role: string;
  content: string;
  created_at: string;
  created_at_full: string;
}

export interface CommunityPostListItem {
  id: number;
  user_id: number;
  author_name: string;
  author_email: string;
  author_avatar: string | null;
  author_role: string;
  title: string;
  description: string;
  image: string | null;
  likes_count: number;
  comments_count: number;
  status: 'active' | 'deactivated';
  status_code: number;
  created_at: string;
  created_at_full: string;
}

export interface CommunityPostDetail extends CommunityPostListItem {
  comments: CommunityCommentItem[];
}

export interface CommunityMetrics {
  total_posts: number;
  total_likes: number;
  total_comments: number;
  total_deactivated_posts: number;
}

export const communityApi = {
  getMetrics: async (): Promise<CommunityMetrics> => {
    const res = await apiClient.get<ApiResponse<CommunityMetrics>>('/super-admin/community/metrics');
    return res.data.data;
  },

  getAll: async (
    search?: string,
    status?: 'all' | 'active' | 'deactivated'
  ): Promise<CommunityPostListItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;

    const res = await apiClient.get<ApiResponse<CommunityPostListItem[]>>('/super-admin/community', {
      params,
    });
    return res.data.data;
  },

  getById: async (id: number): Promise<CommunityPostDetail> => {
    const res = await apiClient.get<ApiResponse<CommunityPostDetail>>(`/super-admin/community/${id}`);
    return res.data.data;
  },

  toggleStatus: async (id: number, status?: number): Promise<CommunityPostListItem> => {
    const res = await apiClient.patch<ApiResponse<CommunityPostListItem>>(
      `/super-admin/community/${id}/toggle-status`,
      status !== undefined ? { status } : {}
    );
    return res.data.data;
  },

  delete: async (id: number): Promise<{ id: number; title: string; message: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; title: string; message: string }>>(
      `/super-admin/community/${id}`
    );
    return res.data.data;
  },
};

