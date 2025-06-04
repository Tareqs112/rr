/**
 * وحدة التحكم الوسيطة للتعامل مع الأخطاء بشكل موحد
 * تقوم بتنسيق رسائل الخطأ وإرسالها للمستخدم بطريقة منظمة
 */
const errorHandler = (err, req, res, next) => {
  // تسجيل الخطأ في السجلات للتصحيح
  console.error('خطأ في النظام:', err);
  
  // تحديد نوع الخطأ ورمز الحالة
  let statusCode = err.statusCode || 500;
  let errorMessage = err.message || 'حدث خطأ في الخادم';
  let errorDetails = err.details || null;
  
  // التعامل مع أخطاء التحقق من الصحة
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'خطأ في التحقق من صحة البيانات';
    errorDetails = err.errors;
  }
  
  // التعامل مع أخطاء قاعدة البيانات
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    errorMessage = 'خطأ في بيانات قاعدة البيانات';
    errorDetails = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }
  
  // التعامل مع أخطاء المصادقة
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorMessage = 'خطأ في المصادقة';
  }
  
  // التعامل مع أخطاء الصلاحيات
  if (err.name === 'ForbiddenError') {
    statusCode = 403;
    errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد';
  }
  
  // التعامل مع أخطاء عدم العثور على المورد
  if (err.name === 'NotFoundError') {
    statusCode = 404;
    errorMessage = 'المورد المطلوب غير موجود';
  }
  
  // إرسال استجابة الخطأ
  res.status(statusCode).json({
    success: false,
    error: {
      message: errorMessage,
      details: errorDetails,
      code: err.code || null,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

module.exports = errorHandler;
