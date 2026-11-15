import { apiClient, type ApiResponse } from './api';

export interface QuizOption {
  id: number;
  text: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  explanation?: string;
  correct_option_index: number;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  title: string;
  instructions?: string;
  time_limit_minutes: number;
  passing_score: number;
  total_questions: number;
  status: number;
  created_at: string;
  updated_at?: string;
  course_title?: string;
  module_title?: string;
  questions?: QuizQuestion[];
}

export interface QuizStats {
  total_quizzes: number;
  total_questions: number;
  standard_pass_threshold: string;
}

export interface QuizPayload {
  title: string;
  instructions?: string;
  time_limit_minutes: number;
  passing_score: number;
  status?: number;
  questions: Array<{
    id?: number | string;
    question: string;
    explanation?: string;
    correct_option_index: number;
    options: Array<{
      id?: number | string;
      text: string;
    }>;
  }>;
}

export const quizApi = {
  /**
   * Get summary metrics for the quiz directory
   * GET /api/v1/super-admin/quizzes/stats
   */
  getStats: async (): Promise<QuizStats> => {
    const res = await apiClient.get<ApiResponse<QuizStats>>('/super-admin/quizzes/stats');
    return res.data.data;
  },

  /**
   * Get all quizzes with optional search and status filter
   * GET /api/v1/super-admin/quizzes
   */
  getAll: async (params?: { search?: string; status?: number }): Promise<Quiz[]> => {
    const res = await apiClient.get<ApiResponse<Quiz[]>>('/super-admin/quizzes', { params });
    return res.data.data;
  },

  /**
   * Get single quiz by ID with full questions and options
   * GET /api/v1/super-admin/quizzes/:id
   */
  getById: async (id: number): Promise<Quiz> => {
    const res = await apiClient.get<ApiResponse<Quiz>>(`/super-admin/quizzes/${id}`);
    return res.data.data;
  },

  /**
   * Create a new quiz with question sets
   * POST /api/v1/super-admin/quizzes
   */
  create: async (payload: QuizPayload): Promise<Quiz> => {
    const res = await apiClient.post<ApiResponse<Quiz>>('/super-admin/quizzes', payload);
    return res.data.data;
  },

  /**
   * Update existing quiz and question sets
   * PUT /api/v1/super-admin/quizzes/:id
   */
  update: async (id: number, payload: Partial<QuizPayload>): Promise<Quiz> => {
    const res = await apiClient.put<ApiResponse<Quiz>>(`/super-admin/quizzes/${id}`, payload);
    return res.data.data;
  },

  /**
   * Delete a quiz
   * DELETE /api/v1/super-admin/quizzes/:id
   */
  delete: async (id: number): Promise<{ id: number; title: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; title: string }>>(
      `/super-admin/quizzes/${id}`
    );
    return res.data.data;
  },
};

