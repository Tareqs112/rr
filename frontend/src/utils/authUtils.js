/**
 * ملف مساعد للتعامل مع المصادقة
 * يحتوي على وظائف مستقلة لا تعتمد على redux أو api مباشرة
 */

// استرجاع التوكن من التخزين المحلي
export const getToken = () => {
  return localStorage.getItem('token');
};

// حفظ التوكن في التخزين المحلي
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

// مسح التوكن من التخزين المحلي
export const clearToken = () => {
  localStorage.removeItem('token');
};

// استرجاع معرف المستأجر من التخزين المحلي
export const getTenantId = () => {
  return localStorage.getItem('tenantId');
};

// حفظ معرف المستأجر في التخزين المحلي
export const setTenantId = (tenantId) => {
  if (tenantId) {
    localStorage.setItem('tenantId', tenantId);
  }
};

// مسح معرف المستأجر من التخزين المحلي
export const clearTenantId = () => {
  localStorage.removeItem('tenantId');
};

// مسح جميع بيانات المصادقة
export const clearAuthData = () => {
  clearToken();
  clearTenantId();
  localStorage.removeItem('auth_error');
};

// استرجاع حالة المصادقة
export const isAuthenticated = () => {
  return !!getToken();
};

// حفظ رسالة خطأ المصادقة
export const setAuthError = (message) => {
  localStorage.setItem('auth_error', message || 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى');
};

// استرجاع رسالة خطأ المصادقة
export const getAuthError = () => {
  return localStorage.getItem('auth_error');
};

// مسح رسالة خطأ المصادقة
export const clearAuthError = () => {
  localStorage.removeItem('auth_error');
};
