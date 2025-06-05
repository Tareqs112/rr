import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/auth';
import { isAuthenticated, getToken } from '../../utils/authUtils';

// تسجيل الدخول
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid credentials');
    }
  }
);

// تسجيل مستخدم جديد
export const register = createAsyncThunk(
  'auth/register',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      return await authService.register(username, email, password);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

// استعادة كلمة المرور
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send reset password email');
    }
  }
);

// تسجيل الخروج
export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

// جلب بيانات البروفايل
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getProfile();
    } catch (error) {
      // إذا فشل الطلب، نقوم بتسجيل الخروج لتجنب الحلقة المفرغة
      if (error.response && error.response.status === 401) {
        authService.logout();
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);

// تحقق من وجود توكن صالح
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      if (!isAuthenticated()) {
        return { isAuthenticated: false };
      }
      
      // محاولة جلب الملف الشخصي للتحقق من صلاحية التوكن
      const result = await dispatch(getUserProfile()).unwrap();
      return { isAuthenticated: true, user: result.user };
    } catch (error) {
      // إذا فشل التحقق، نقوم بتسجيل الخروج
      authService.logout();
      return { isAuthenticated: false };
    }
  }
);

const initialState = {
  user: null,
  token: getToken() || null,
  isAuthenticated: isAuthenticated(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // إضافة reducer لتحديث حالة المصادقة من localStorage
    syncAuthState: (state) => {
      const token = getToken();
      state.token = token;
      state.isAuthenticated = !!token;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true; // تأكيد حالة المصادقة عند نجاح جلب الملف الشخصي
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // لا نقوم بتغيير isAuthenticated هنا لأن checkAuth سيتعامل مع ذلك
      })
      
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, syncAuthState } = authSlice.actions;
export default authSlice.reducer;
