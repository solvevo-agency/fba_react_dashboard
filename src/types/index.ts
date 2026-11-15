export * from '@/features/auth/authTypes';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

