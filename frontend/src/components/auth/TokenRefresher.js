import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { syncAuthState } from '../../redux/slices/authSlice';
import { isAuthenticated } from '../../utils/authUtils';

/**
 * مكون لتحديث حالة التوكن تلقائياً
 * يتحقق من صلاحية التوكن على فترات منتظمة ويحدث حالة المصادقة في Redux
 */
const TokenRefresher = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // تحديث حالة المصادقة عند تحميل المكون
    dispatch(syncAuthState());

    // إعداد فاصل زمني لتحديث حالة المصادقة كل 5 دقائق
    const refreshInterval = setInterval(() => {
      // التحقق من وجود توكن قبل محاولة التحديث
      if (isAuthenticated()) {
        dispatch(syncAuthState());
      }
    }, 5 * 60 * 1000); // 5 دقائق

    // تنظيف الفاصل الزمني عند إلغاء تحميل المكون
    return () => clearInterval(refreshInterval);
  }, [dispatch]);

  // هذا المكون لا يعرض أي واجهة مستخدم
  return null;
};

export default TokenRefresher;
