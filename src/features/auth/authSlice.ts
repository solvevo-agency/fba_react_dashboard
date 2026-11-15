import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, LoginCredentials, User } from './authTypes';
import { authApi, getApiErrorMessage, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/services/api';

// Initial state restored from localStorage or sessionStorage
const storedToken =
  localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
const storedUserRaw =
  localStorage.getItem(USER_STORAGE_KEY) || sessionStorage.getItem(USER_STORAGE_KEY);

let initialUser: User | null = null;
if (storedUserRaw) {
  try {
    initialUser = JSON.parse(storedUserRaw);
  } catch {
    initialUser = null;
  }
}

const initialState: AuthState = {
  user: initialUser,
  token: storedToken || null,
  isAuthenticated: Boolean(storedToken && initialUser),
  isLoading: false,
  error: null,
};

/**
 * Super Admin Login Thunk
 * Calls backend POST /api/v1/admin/auth/login
 */
export const loginUser = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { rejectValue: string }
>('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login({
      email: credentials.email.trim(),
      password: credentials.password,
    });

    const responseData = response.data.data;
    const rawUser = responseData.user;

    const fullName =
      [rawUser.first_name, rawUser.last_name].filter(Boolean).join(' ') ||
      rawUser.name ||
      'Super Admin';

    const normalizedUser: User = {
      id: String(rawUser.id),
      first_name: rawUser.first_name,
      last_name: rawUser.last_name,
      name: fullName,
      email: rawUser.email,
      role: rawUser.role,
      avatar: rawUser.avatar || null,
      phone: rawUser.phone || null,
      bio: rawUser.bio || null,
      status: rawUser.status,
    };

    const token = responseData.token;

    // Persist session
    if (credentials.rememberMe) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    } else {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
    }

    return { user: normalizedUser, token };
  } catch (err: unknown) {
    const message = getApiErrorMessage(err, 'Invalid email or password.');
    return rejectWithValue(message);
  }
});

/**
 * Fetch Current User Profile Thunk
 * Refreshes user data from GET /api/v1/user/profile
 */
export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: string }>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      const rawUser = response.data.data;

      const fullName =
        [rawUser.first_name, rawUser.last_name].filter(Boolean).join(' ') ||
        rawUser.name ||
        'Super Admin';

      const normalizedUser: User = {
        id: String(rawUser.id),
        first_name: rawUser.first_name,
        last_name: rawUser.last_name,
        name: fullName,
        email: rawUser.email,
        role: rawUser.role,
        avatar: rawUser.avatar || null,
        phone: rawUser.phone || null,
        bio: rawUser.bio || null,
        status: rawUser.status,
      };

      if (localStorage.getItem(TOKEN_STORAGE_KEY)) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      } else if (sessionStorage.getItem(TOKEN_STORAGE_KEY)) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
      }

      return normalizedUser;
    } catch (err: unknown) {
      const message = getApiErrorMessage(err, 'Failed to fetch current user profile.');
      return rejectWithValue(message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // loginUser
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Authentication failed.';
      })
      // fetchCurrentUser
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      });
  },
});

export const { logout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
