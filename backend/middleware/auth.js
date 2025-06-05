const jwt = require('jsonwebtoken');
const { User } = require('../models');
const config = require('../config/auth');
/**
 * وحدة التحكم الوسيطة للتحقق من المصادقة
 * تتحقق من وجود وصلاحية رمز JWT في الطلب
 */
const authenticate = async (req, res, next) => {
  try {
    // استخراج الرمز من رأس الطلب
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'لم يتم توفير رمز المصادقة'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // التحقق من صلاحية الرمز - إصلاح اسم المتغير من jwtSecret إلى JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // التحقق من وجود المستخدم في قاعدة البيانات
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود أو غير نشط'
      });
    }
    
    // إضافة معلومات المستخدم إلى الطلب
    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    
    // إضافة معرف المستأجر إلى الطلب إذا كان متوفرًا
    if (user.tenant_id) {
      req.tenantId = user.tenant_id;
    }
    
    // التحقق من معرف المستأجر في رأس الطلب إذا كان متوفرًا
    const headerTenantId = req.headers['x-tenant-id'];
    if (headerTenantId && user.tenant_id && headerTenantId != user.tenant_id) {
      return res.status(403).json({
        success: false,
        message: 'معرف المستأجر غير صالح'
      });
    }
    
    // المتابعة إلى الخطوة التالية
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية رمز المصادقة'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }
    
    console.error('خطأ في المصادقة:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء المصادقة'
    });
  }
};
/**
 * وحدة التحكم الوسيطة للتحقق من صلاحيات المستخدم
 * @param {Array} roles - قائمة الأدوار المسموح لها بالوصول
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // التحقق من وجود المستخدم (يجب أن يكون بعد وحدة المصادقة)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'يجب تسجيل الدخول أولاً'
      });
    }
    
    // التحقق من الصلاحيات
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
      });
    }
    
    // المتابعة إلى الخطوة التالية
    next();
  };
};
/**
 * وحدة التحكم الوسيطة للتحقق من صلاحيات المشرف الرئيسي
 */
const isSuperAdmin = (req, res, next) => {
  // التحقق من وجود المستخدم (يجب أن يكون بعد وحدة المصادقة)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'يجب تسجيل الدخول أولاً'
    });
  }
  
  // التحقق من أن المستخدم هو مشرف رئيسي
  if (req.user.role !== 'admin' || req.user.tenant_id !== null) {
    return res.status(403).json({
      success: false,
      message: 'هذه العملية متاحة فقط للمشرفين الرئيسيين'
    });
  }
  
  // المتابعة إلى الخطوة التالية
  next();
};
module.exports = {
  authenticate,
  authorize,
  isSuperAdmin
};
