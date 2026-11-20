import { apiClient, type ApiResponse } from './api';

export interface Instructor {
  id: number;
  name: string;
  designation: string;
  email: string;
  avatar: string;
  bio: string;
  instructor_type: 'lead' | 'regular';
  certificate_id?: string;
  status: number;
  courses_count: number;
  lessons_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface InstructorStats {
  total: number;
  lead: number;
  regular: number;
  verified_percent: string;
}

export interface InstructorPayload {
  name: string;
  designation: string;
  email?: string;
  bio?: string;
  avatar?: string;
  instructor_type: 'lead' | 'regular';
  certificate_id?: string;
  status?: number;
}

export const instructorApi = {
  /**
   * Get summary statistics for the instructor directory
   * GET /api/v1/super-admin/instructors/stats
   */
  getStats: async (): Promise<InstructorStats> => {
    const res = await apiClient.get<ApiResponse<InstructorStats>>(
      '/super-admin/instructors/stats'
    );
    return res.data.data;
  },

  /**
   * Get all instructors with optional role/status filter
   * GET /api/v1/super-admin/instructors
   */
  getAll: async (params?: {
    role?: 'all' | 'lead' | 'regular';
    search?: string;
    status?: number;
  }): Promise<Instructor[]> => {
    const res = await apiClient.get<ApiResponse<Instructor[]>>(
      '/super-admin/instructors',
      { params }
    );
    return res.data.data;
  },

  /**
   * Get single instructor by ID
   * GET /api/v1/super-admin/instructors/:id
   */
  getById: async (id: number): Promise<Instructor> => {
    const res = await apiClient.get<ApiResponse<Instructor>>(
      `/super-admin/instructors/${id}`
    );
    return res.data.data;
  },

  /**
   * Create a new instructor
   * POST /api/v1/super-admin/instructors
   */
  create: async (payload: InstructorPayload): Promise<Instructor> => {
    const res = await apiClient.post<ApiResponse<Instructor>>(
      '/super-admin/instructors',
      payload
    );
    return res.data.data;
  },

  /**
   * Update existing instructor
   * PUT /api/v1/super-admin/instructors/:id
   */
  update: async (
    id: number,
    payload: Partial<InstructorPayload>
  ): Promise<Instructor> => {
    const res = await apiClient.put<ApiResponse<Instructor>>(
      `/super-admin/instructors/${id}`,
      payload
    );
    return res.data.data;
  },

  /**
   * Delete an instructor
   * DELETE /api/v1/super-admin/instructors/:id
   */
  delete: async (id: number): Promise<{ id: number; name: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; name: string }>>(
      `/super-admin/instructors/${id}`
    );
    return res.data.data;
  },

  /**
   * Upload an avatar image directly via Multer/Cloudinary
   * POST /api/v1/super-admin/instructors/upload-avatar
   */
  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await apiClient.post<ApiResponse<{ url: string }>>(
      '/super-admin/instructors/upload-avatar',
      formData,
      {
        timeout: 60000,
      }
    );
    return res.data.data.url;
  },
};
