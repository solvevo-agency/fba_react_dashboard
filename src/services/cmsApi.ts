import { apiClient, type ApiResponse } from './api';

export interface AboutBannerContent {
  title: string;
  description: string;
  image: string;
  button_text?: string;
}

export interface ContactBannerContent {
  title: string;
  description: string;
  image: string;
}

export interface FaqItemContent {
  id: number;
  question: string;
  answer: string;
}

export interface FaqSectionContent {
  title: string;
  description: string;
  image: string;
  items: FaqItemContent[];
}

export interface CmsSectionRecord {
  id: number;
  page: string;
  section: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export interface CmsAllResponse {
  sections: CmsSectionRecord[];
  grouped: Record<string, Record<string, any>>;
}

export interface CmsMediaUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export const cmsApi = {
  /**
   * Get all CMS sections across all pages (both as a flat list and grouped by page and section)
   */
  getAll: async (): Promise<CmsAllResponse> => {
    const res = await apiClient.get<ApiResponse<CmsAllResponse>>('/super-admin/cms');
    return res.data.data;
  },

  /**
   * Get all sections for a single page
   */
  getPage: async (page: string): Promise<Record<string, any>> => {
    const res = await apiClient.get<ApiResponse<Record<string, any>>>(`/super-admin/cms/${page}`);
    return res.data.data;
  },

  /**
   * Get a specific CMS section
   */
  getSection: async (page: string, section: string): Promise<any> => {
    const res = await apiClient.get<ApiResponse<any>>(`/super-admin/cms/${page}/${section}`);
    return res.data.data;
  },

  /**
   * Update a specific section
   */
  updateSection: async (page: string, section: string, content: any): Promise<any> => {
    const res = await apiClient.put<ApiResponse<any>>(`/super-admin/cms/${page}/${section}`, { content });
    return res.data.data;
  },

  /**
   * Bulk update all sections belonging to a specific page
   */
  updatePage: async (page: string, sections: Record<string, any>): Promise<any> => {
    const res = await apiClient.put<ApiResponse<any>>(`/super-admin/cms/${page}`, sections);
    return res.data.data;
  },

  /**
   * Bulk save all CMS sections across all pages
   */
  updateAll: async (allData: Record<string, Record<string, any>>): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/super-admin/cms/all', allData);
    return res.data.data;
  },

  /**
   * Upload media file (images, videos, or PDFs) via multer disk storage
   */
  uploadMedia: async (file: File): Promise<CmsMediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post<ApiResponse<CmsMediaUploadResponse>>(
      '/super-admin/cms/upload-media',
      formData,
      {
        timeout: 60000,
      }
    );
    return res.data.data;
  },
};
