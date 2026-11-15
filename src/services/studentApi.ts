import { apiClient, type ApiResponse } from './api';

export interface StudentListItem {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar: string | null;
  phone: string;
  bacb_id: string;
  has_bought_course: boolean;
  primary_course: string;
  course_id: number | null;
  enrolled_courses_count: number;
  progress_percentage: number;
  status: number; // 0: unverified, 1: active, 2: suspended
  created_at: string;
  last_login_at: string;
}

export interface StudentMetrics {
  total_registered: number;
  active_trainees: number;
  graduated_students: number;
  suspended_accounts: number;
}

export interface StudentEnrolledCourse {
  subscription_id: number;
  course_id: number;
  course_title: string;
  course_uid: string;
  tier_name: string;
  price: number;
  duration: string;
  start_date: string | null;
  valid_until: string;
  status: string;
}

export interface StudentCertificate {
  id: number;
  course_title: string;
  certificate_number: string;
  issue_date: string;
}

export interface StudentDetail {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  avatar: string | null;
  phone: string;
  bacb_id: string;
  bio: string;
  role: string;
  status: number;
  has_bought_course: boolean;
  primary_course: string;
  course_id: number | null;
  progress_percentage: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  created_at: string;
  last_login_at: string;
  enrolled_courses: StudentEnrolledCourse[];
  certificates: StudentCertificate[];
}

export interface CreateStudentPayload {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string;
  bacb_id?: string;
  avatar?: string;
  course_id?: number;
  tier_id?: number;
}

export const studentApi = {
  /** Get metrics counts for dashboard cards */
  getMetrics: async (): Promise<StudentMetrics> => {
    const res = await apiClient.get<ApiResponse<StudentMetrics>>('/super-admin/students/metrics');
    return res.data.data;
  },

  /** Get all students with optional search and status filter */
  getAll: async (search?: string, status?: string): Promise<StudentListItem[]> => {
    const params: Record<string, string> = {};
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;

    const res = await apiClient.get<ApiResponse<StudentListItem[]>>('/super-admin/students', {
      params,
    });
    return res.data.data;
  },

  /** Get comprehensive academic dossier for a student */
  getById: async (id: number): Promise<StudentDetail> => {
    const res = await apiClient.get<ApiResponse<StudentDetail>>(`/super-admin/students/${id}`);
    return res.data.data;
  },

  /** Update student access status (1: active, 2: suspended) */
  updateStatus: async (
    id: number,
    status: number
  ): Promise<{ id: number; email: string; status: number; message: string }> => {
    const res = await apiClient.patch<
      ApiResponse<{ id: number; email: string; status: number; message: string }>
    >(`/super-admin/students/${id}/status`, { status });
    return res.data.data;
  },

  /** Create student manually from admin portal */
  create: async (payload: CreateStudentPayload): Promise<StudentDetail> => {
    const res = await apiClient.post<ApiResponse<StudentDetail>>('/super-admin/students', payload);
    return res.data.data;
  },

  /** Delete student account */
  delete: async (id: number): Promise<{ id: number; name: string; email: string }> => {
    const res = await apiClient.delete<ApiResponse<{ id: number; name: string; email: string }>>(
      `/super-admin/students/${id}`
    );
    return res.data.data;
  },

  /** Trigger password reset */
  resetPassword: async (id: number): Promise<{ email: string; message: string }> => {
    const res = await apiClient.post<ApiResponse<{ email: string; message: string }>>(
      `/super-admin/students/${id}/reset-password`
    );
    return res.data.data;
  },
};

