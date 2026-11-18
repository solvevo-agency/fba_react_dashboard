import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponseData, LoginCredentials, User } from '@/features/auth/authTypes';

/**
 * Standard backend response envelope:
 * { success: boolean, status: number, message: string, data: T, error?: unknown }
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  error?: unknown;
}

const DEFAULT_API_URL = import.meta.env.DEV
  ? 'http://localhost:5040/api/v1'
  : 'https://2.25.242.196/api/v1';

export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() || DEFAULT_API_URL;

export const TOKEN_STORAGE_KEY = 'fba_super_admin_token';
export const USER_STORAGE_KEY = 'fba_super_admin_user';

/**
 * Helper to retrieve stored auth token
 */
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
};

/**
 * Central Axios Instance for all Super Admin HTTP requests
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CMS payloads embed large base64 images (~40MB); 15s is too low for Netlify→VPS.
  timeout: 120000,
});

// Request Interceptor: Attach JWT Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling & 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      // Clean up session if token expired or invalid
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login')) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Reusable helper to safely extract backend error messages
 */
export const getApiErrorMessage = (error: unknown, fallback = 'Operation failed'): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiResponse<unknown> | undefined;
    if (apiError?.message) {
      return apiError.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/**
 * Auth API Service Endpoints
 */
export const authApi = {
  /**
   * Super Admin Login
   * POST /api/v1/admin/auth/login
   */
  login: (credentials: Pick<LoginCredentials, 'email' | 'password'>) => {
    return apiClient.post<ApiResponse<AuthResponseData>>('/admin/auth/login', credentials);
  },

  /**
   * Get Current Authenticated User Profile
   * GET /api/v1/user/profile
   */
  getProfile: () => {
    return apiClient.get<ApiResponse<User>>('/user/profile');
  },
};

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  bio?: string | null;
}

/**
 * User & Profile API Service Endpoints
 */
export const userApi = {
  /**
   * GET /api/v1/user/profile
   */
  getProfile: () => {
    return apiClient.get<ApiResponse<User>>('/user/profile');
  },

  /**
   * PUT /api/v1/user/profile
   */
  updateProfile: (data: UpdateProfilePayload) => {
    return apiClient.put<ApiResponse<User>>('/user/profile', data);
  },

  /**
   * PUT /api/v1/user/change-password
   */
  changePassword: (data: ChangePasswordPayload) => {
    return apiClient.put<ApiResponse<{ message: string }>>('/user/change-password', data);
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    ADMIN_LOGIN: '/admin/auth/login',
    PROFILE: '/user/profile',
  },
  COURSES: {
    LIST: '/admin/courses',
    DETAILS: (id: string | number) => `/admin/courses/${id}`,
  },
  INSTRUCTORS: {
    LIST: '/admin/instructors',
    DETAILS: (id: string | number) => `/admin/instructors/${id}`,
  },
  STUDENTS: {
    LIST: '/admin/students',
    DETAILS: (id: string | number) => `/admin/students/${id}`,
  },
} as const;
