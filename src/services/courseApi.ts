import { apiClient, type ApiResponse } from './api';

export interface CourseResource {
  id?: number;
  title: string;
  file_path: string;
  file_type?: string;
  file_size?: string;
}

export interface CourseLesson {
  id?: number;
  lesson_uid?: string;
  title: string;
  instructor_id?: number | null;
  instructor_name?: string;
  instructor_avatar?: string;
  lesson_time?: number;
  video_length?: number;
  description?: string;
  transcript_text?: string;
  thumbnail_image?: string;
  video_path?: string;
  sequence_order?: number;
  status?: number;
  resources: CourseResource[];
}

export interface CourseModule {
  id?: number;
  title: string;
  description?: string;
  quiz_id?: number | null;
  quiz_title?: string;
  quiz_passing_score?: number;
  quiz_eligible?: string;
  sequence_order?: number;
  status?: number;
  lessons: CourseLesson[];
}

export interface CoursePricingTier {
  id?: number;
  tier_name: string;
  title?: string;
  subtitle?: string;
  starting_price?: number;
  final_price: number;
  duration: string;
  benefits: string[];
  stripe_price_id?: string;
  status?: number;
}

export interface Course {
  id: number;
  course_uid: string;
  title: string;
  slug: string;
  description: string;
  what_to_learn: string[];
  banner_image: string;
  thumbnail?: string;
  total_modules: number;
  total_lessons: number;
  total_video_length: number;
  status: string;
  instructor_id?: number | null;
  instructor_name: string;
  instructor_avatar: string;
  instructor_designation?: string;
  instructor_bio?: string;
  instructor?: {
    id: number;
    name: string;
    designation: string;
    avatar: string;
    bio?: string;
  } | null;
  tiers: CoursePricingTier[];
  modules: CourseModule[];
  created_at: string;
  updated_at?: string;
}

export interface CourseStats {
  total_courses: number;
  total_modules: number;
  total_lessons: number;
  total_video_hours: number;
}

export interface CoursePayload {
  title: string;
  course_uid?: string;
  slug?: string;
  instructor_id: number | string;
  description: string;
  what_to_learn?: string[] | string;
  banner_image: string;
  thumbnail?: string | null;
  tiers: Array<{
    id?: number;
    tier_name: string;
    title?: string | null;
    subtitle?: string | null;
    starting_price?: number;
    final_price: number;
    duration: string;
    benefits?: string[];
  }>;
  modules: Array<{
    id?: number;
    title: string;
    description?: string | null;
    quiz_id?: number | null;
    quiz_eligible?: string;
    lessons: Array<{
      id?: number;
      lesson_uid?: string;
      title: string;
      instructor_id?: number | null;
      lesson_time?: number;
      description?: string | null;
      transcript_text?: string | null;
      thumbnail_image?: string | null;
      video_path?: string | null;
      resources?: Array<{
        id?: number;
        title: string;
        file_path: string;
        file_type?: string;
        file_size?: string;
      }>;
    }>;
  }>;
}

export interface UploadMediaResult {
  url: string;
  file_name: string;
  file_size: string;
  mimetype: string;
}

export const courseApi = {
  /**
   * Get high-level curriculum statistics
   * GET /api/v1/super-admin/courses/stats
   */
  getStats: async (): Promise<CourseStats> => {
    const res = await apiClient.get<ApiResponse<CourseStats>>('/super-admin/courses/stats');
    return res.data.data;
  },

  /**
   * List all courses with optional search
   * GET /api/v1/super-admin/courses
   */
  getAll: async (search?: string): Promise<Course[]> => {
    const res = await apiClient.get<ApiResponse<Course[]>>('/super-admin/courses', {
      params: search ? { search } : undefined,
    });
    return res.data.data;
  },

  /**
   * Get full course dossier by ID
   * GET /api/v1/super-admin/courses/:id
   */
  getById: async (id: number): Promise<Course> => {
    const res = await apiClient.get<ApiResponse<Course>>(`/super-admin/courses/${id}`);
    return res.data.data;
  },

  /**
   * Create and publish course
   * POST /api/v1/super-admin/courses
   */
  create: async (payload: CoursePayload): Promise<Course> => {
    const res = await apiClient.post<ApiResponse<Course>>('/super-admin/courses', payload);
    return res.data.data;
  },

  /**
   * Update existing course hierarchy
   * PUT /api/v1/super-admin/courses/:id
   */
  update: async (id: number, payload: Partial<CoursePayload>): Promise<Course> => {
    const res = await apiClient.put<ApiResponse<Course>>(`/super-admin/courses/${id}`, payload);
    return res.data.data;
  },

  /**
   * Delete course
   * DELETE /api/v1/super-admin/courses/:id
   */
  delete: async (id: number): Promise<{ id: number; title: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; title: string }>>(
      `/super-admin/courses/${id}`
    );
    return res.data.data;
  },

  /**
   * Upload video, image, or PDF file
   * POST /api/v1/super-admin/courses/upload-media
   */
  uploadMedia: async (file: File): Promise<UploadMediaResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<UploadMediaResult>>(
      '/super-admin/courses/upload-media',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },
};

