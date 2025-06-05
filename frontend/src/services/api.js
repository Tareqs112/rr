import axios from 'axios';
import { getToken, getTenantId, clearAuthData, setAuthError } from '../utils/authUtils';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    const tenantId = getTenantId();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenantId) {
      config.headers['x-tenant-id'] = tenantId;
    }
    
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // تحسين معالجة أخطاء 401 - إضافة رسالة وتزامن حالة المصادقة
    if (error.response && error.response.status === 401) {
      // حفظ سبب الخطأ لعرضه للمستخدم
      const errorMessage = error.response.data?.message || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى';
      setAuthError(errorMessage);
      
      // مسح بيانات المصادقة
      clearAuthData();
      
      // إعادة التوجيه إلى صفحة تسجيل الدخول
      window.location.href = '/login?error=session_expired';
    }
    
    return Promise.reject(error);
  }
);

export default api;
