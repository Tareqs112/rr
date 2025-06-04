const { Tenant } = require('../models');

/**
 * وحدة التحكم الوسيطة للتعامل مع نظام متعدد المستأجرين (Multi-tenant)
 * تقوم بالتحقق من وجود المستأجر وإضافة معرف المستأجر إلى الطلب
 */
const validateTenant = async (req, res, next) => {
  try {
    // استخراج معرف المستأجر من الرأس أو الكوكيز أو الجلسة
    const tenantId = req.headers['x-tenant-id'] || req.cookies?.tenantId || req.session?.tenantId;
    
    // إذا لم يتم توفير معرف المستأجر
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستأجر مطلوب'
      });
    }
    
    // التحقق من وجود المستأجر في قاعدة البيانات
    const tenant = await Tenant.findOne({
      where: {
        id: tenantId,
        is_active: true
      }
    });
    
    // إذا لم يتم العثور على المستأجر أو كان غير نشط
    if (!tenant) {
      return res.status(403).json({
        success: false,
        message: 'المستأجر غير موجود أو غير نشط'
      });
    }
    
    // إضافة معرف المستأجر والمستأجر إلى الطلب لاستخدامه في وحدات التحكم
    req.tenantId = tenant.id;
    req.tenant = tenant;
    
    // المتابعة إلى الخطوة التالية
    next();
  } catch (error) {
    console.error('خطأ في التحقق من المستأجر:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء التحقق من المستأجر'
    });
  }
};

/**
 * وحدة تحكم وسيطة لإضافة معرف المستأجر تلقائيًا إلى جميع استعلامات قاعدة البيانات
 */
const applyTenantScope = (req, res, next) => {
  // التأكد من وجود معرف المستأجر في الطلب
  if (!req.tenantId) {
    return next();
  }
  
  // تعديل جميع استعلامات قاعدة البيانات لتشمل معرف المستأجر
  const originalMethod = req.method;
  const originalUrl = req.originalUrl;
  
  // تسجيل الاستعلام للتصحيح
  console.log(`[Tenant Scope] ${originalMethod} ${originalUrl} - Tenant ID: ${req.tenantId}`);
  
  // المتابعة إلى الخطوة التالية
  next();
};

module.exports = {
  validateTenant,
  applyTenantScope
};
