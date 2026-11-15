export interface User {
  id: string | number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  role: string;
  avatar?: string | null;
  phone?: string | null;
  bio?: string | null;
  status?: number;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponseData {
  token: string;
  token_type: string;
  expires_in: string;
  user: User;
}
