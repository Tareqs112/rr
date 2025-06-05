import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { syncAuthState, checkAuth } from '../../redux/slices/authSlice';

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  // التحقق من حالة المصادقة عند تحميل المكون
  useEffect(() => {
    // مزامنة حالة المصادقة مع localStorage
    dispatch(syncAuthState());
    
    // إذا كان هناك توكن ولكن لا يوجد مستخدم، نقوم بالتحقق من المصادقة
    if (token && !user) {
      dispatch(checkAuth());
    }
  }, [dispatch, token, user]);

  // إذا كان المستخدم مسجل دخوله، اعرض المحتوى الداخلي
  if (isAuthenticated && token) {
    return children ? children : <Outlet />;
  }

  // غير مسجل → إعادة التوجيه إلى صفحة تسجيل الدخول
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
