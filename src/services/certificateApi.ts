import { apiClient, type ApiResponse } from './api';

export interface CertificateItem {
  id: number;
  cert_uid: string;
  user_id: number;
  course_id: number;
  tier_id: number | null;
  applicant_name: string;
  applicant_bacb_id: string;
  course_title: string;
  course_uid: string;
  tier_name: string | null;
  student_email: string;
  student_avatar: string | null;
  organization_name?: string | null;
  trainer_name: string | null;
  trainer_certification: string | null;
  assist_trainer_name: string | null;
  assist_trainer_cert_id: string | null;
  trainer_signature: string | null;
  watermark: string | null;
  training_start: string | null;
  training_end: string | null;
  training_time: number;
  training_time_display?: string;
  issue_date: string;
  pdf_file_path: string | null;
  verification_hash: string | null;
  status: 'valid' | 'revoked';
  created_at: string;
}

export interface CertificateMetrics {
  total: number;
  valid: number;
  revoked: number;
}

export interface CertificateMetadata {
  id?: number;
  organization_name: string;
  assist_trainer_name: string;
  assist_trainer_cert_id: string;
  trainer_signature: string;
  watermark: string;
}

export const certificateApi = {
  /** Get metrics count for summary cards */
  getMetrics: async (): Promise<CertificateMetrics> => {
    const res = await apiClient.get<ApiResponse<CertificateMetrics>>('/super-admin/certificates/metrics');
    return res.data.data;
  },

  /** Get template metadata configuration */
  getMetadata: async (): Promise<CertificateMetadata> => {
    const res = await apiClient.get<ApiResponse<CertificateMetadata>>('/super-admin/certificates/meta');
    return res.data.data;
  },

  /** Save / update template metadata */
  updateMetadata: async (payload: Partial<CertificateMetadata>): Promise<CertificateMetadata> => {
    const res = await apiClient.post<ApiResponse<CertificateMetadata>>(
      '/super-admin/certificates/meta',
      payload
    );
    return res.data.data;
  },

  /** Upload asset such as digital signature or watermark seal */
  uploadAsset: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<ApiResponse<{ url: string; filename: string }>>(
      '/super-admin/certificates/upload-asset',
      formData,
      {
        timeout: 60000,
      }
    );
    return res.data.data;
  },

  /** Get all issued certificates with search and filter */
  getAll: async (
    search?: string,
    status?: string,
    page = 1,
    limit = 50
  ): Promise<CertificateItem[]> => {
    const params: Record<string, string | number> = { page, limit };
    if (search && search.trim()) params.search = search.trim();
    if (status && status !== 'all') params.status = status;

    const res = await apiClient.get<ApiResponse<CertificateItem[]>>('/super-admin/certificates', {
      params,
    });
    return res.data.data;
  },

  /** Get single certificate details by id or UID */
  getById: async (idOrUid: number | string): Promise<CertificateItem> => {
    const res = await apiClient.get<ApiResponse<CertificateItem>>(
      `/super-admin/certificates/${idOrUid}`
    );
    return res.data.data;
  },

  /** Update certificate status (valid or revoked) */
  updateStatus: async (
    id: number,
    status: 'valid' | 'revoked'
  ): Promise<CertificateItem> => {
    const res = await apiClient.patch<ApiResponse<CertificateItem>>(
      `/super-admin/certificates/${id}/status`,
      { status }
    );
    return res.data.data;
  },

  /** Delete a certificate record */
  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete<ApiResponse<null>>(`/super-admin/certificates/${id}`);
    return { message: res.data.message };
  },
};
