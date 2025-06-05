import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * مكون المسار الخاص - يحمي المسارات التي تتطلب مصادقة
 * يتحقق من حالة المصادقة ويعيد توجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مصادقًا
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector(state => state.auth);
  const location = useLocation();

  // إذا كان التحميل جاريًا، نعرض شاشة تحميل
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جاري التحميل...</span>
        </div>
        <p className="mt-2">جاري التحقق من المصادقة...</p>
      </div>
    );
  }

  // إذا لم يكن المستخدم مصادقًا، نعيد توجيهه إلى صفحة تسجيل الدخول
  // مع تخزين المسار الحالي للعودة إليه بعد تسجيل الدخول
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname, message: 'يجب تسجيل الدخول للوصول إلى هذه الصفحة' }} replace />;
  }

  // إذا كان المستخدم مصادقًا، نعرض المحتوى المحمي
  return children;
};

export default PrivateRoute;
