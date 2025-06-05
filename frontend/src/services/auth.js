import api from './api';
import { setToken, setTenantId, clearAuthData } from '../utils/authUtils';

// ✅ تسجيل الدخول
const login = async (email, password) => {
  console.log('محاولة تسجيل الدخول باستخدام:', { email, password: '***' });
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('استجابة تسجيل الدخول:', response.data);
    
    if (response.data.token) {
      setToken(response.data.token);
    }
    
    // ✅ حفظ tenantId في التخزين المحلي
    if (response.data.user?.tenant_id) {
      setTenantId(response.data.user.tenant_id);
    }
    
    return response.data;
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ استعادة كلمة المرور
const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// ✅ تسجيل مستخدم جديد
const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  
  if (response.data.token) {
    setToken(response.data.token);
  }
  
  // ✅ حفظ tenantId في حالة التسجيل أيضًا (اختياري)
  if (response.data.user?.tenant_id) {
    setTenantId(response.data.user.tenant_id);
  }
  
  return response.data;
};

// ✅ تسجيل الخروج
const logout = () => {
  clearAuthData();
};

// ✅ جلب بيانات البروفايل
const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// ✅ تصدير جميع الوظائف
const authService = {
  login,
  logout,
  getProfile,
  register,
  forgotPassword
};

export default authService;
