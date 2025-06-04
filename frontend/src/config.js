/**
 * ملف التكوين الرئيسي للتطبيق
 */
// عنوان الخادم الأساسي - تصدير مباشر للاستخدام في الملفات الأخرى
export const API_BASE_URL = 'http://localhost:5000/api';

// إعدادات واجهة برمجة التطبيقات
const API_CONFIG = {
  // عنوان الخادم الأساسي
  BASE_URL: API_BASE_URL,
  
  // الإصدار الحالي للواجهة
  API_VERSION: 'v1',
  
  // مهلة الطلب بالمللي ثانية
  TIMEOUT: 30000,
  
  // رأس التوثيق
  AUTH_HEADER: 'Authorization',
  
  // بادئة رمز التوثيق
  TOKEN_PREFIX: 'Bearer',
};

// إعدادات التخزين المحلي
const STORAGE_CONFIG = {
  // مفتاح تخزين رمز التوثيق
  TOKEN_KEY: 'car_rental_token',
  
  // مفتاح تخزين بيانات المستخدم
  USER_KEY: 'car_rental_user',
  
  // مفتاح تخزين إعدادات التطبيق
  SETTINGS_KEY: 'car_rental_settings',
  
  // مدة صلاحية البيانات المخزنة (بالأيام)
  EXPIRY_DAYS: 7,
};

// إعدادات التطبيق
const APP_CONFIG = {
  // اسم التطبيق
  APP_NAME: 'نظام تأجير السيارات',
  
  // الشركة المالكة
  COMPANY_NAME: 'شركة السيارات المتميزة',
  
  // معلومات الاتصال
  CONTACT_INFO: {
    EMAIL: 'info@car-rental.com',
    PHONE: '+966 12 345 6789',
    ADDRESS: 'الرياض، المملكة العربية السعودية',
  },
  
  // روابط مواقع التواصل الاجتماعي
  SOCIAL_LINKS: {
    FACEBOOK: 'https://facebook.com/car-rental',
    TWITTER: 'https://twitter.com/car-rental',
    INSTAGRAM: 'https://instagram.com/car-rental',
  },
  
  // إعدادات الصفحة الرئيسية
  HOME_PAGE: {
    ITEMS_PER_PAGE: 10,
    FEATURED_VEHICLES_COUNT: 5,
  },
};

// إعدادات التقارير
const REPORT_CONFIG = {
  // تنسيق التاريخ الافتراضي
  DEFAULT_DATE_FORMAT: 'YYYY-MM-DD',
  
  // الفترات الزمنية المتاحة للتقارير
  TIME_PERIODS: {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    YEARLY: 'yearly',
    CUSTOM: 'custom',
  },
  
  // أنواع التقارير المتاحة
  REPORT_TYPES: {
    REVENUE: 'revenue',
    BOOKINGS: 'bookings',
    VEHICLES: 'vehicles',
    CUSTOMERS: 'customers',
  },
  
  // تنسيقات التصدير المتاحة
  EXPORT_FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv',
  },
};

// إعدادات الحجوزات
const BOOKING_CONFIG = {
  // حالات الحجز
  STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },
  
  // حالات الدفع
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    REFUNDED: 'refunded',
  },
  
  // الحد الأدنى لمدة الحجز (بالأيام)
  MIN_DURATION: 1,
  
  // الحد الأقصى لمدة الحجز (بالأيام)
  MAX_DURATION: 30,
  
  // عدد أيام الإلغاء المجاني قبل تاريخ البداية
  FREE_CANCELLATION_DAYS: 2,
  
  // رسوم الإلغاء المتأخر (نسبة مئوية)
  LATE_CANCELLATION_FEE: 20,
};

// إعدادات المركبات
const VEHICLE_CONFIG = {
  // حالات المركبة
  STATUS: {
    AVAILABLE: 'available',
    RENTED: 'rented',
    MAINTENANCE: 'maintenance',
    UNAVAILABLE: 'unavailable',
  },
  
  // أنواع الوقود
  FUEL_TYPES: {
    PETROL: 'petrol',
    DIESEL: 'diesel',
    ELECTRIC: 'electric',
    HYBRID: 'hybrid',
  },
  
  // أنواع ناقل الحركة
  TRANSMISSION_TYPES: {
    AUTOMATIC: 'automatic',
    MANUAL: 'manual',
  },
  
  // فئات المركبات
  CATEGORIES: {
    ECONOMY: 'economy',
    COMPACT: 'compact',
    MIDSIZE: 'midsize',
    FULLSIZE: 'fullsize',
    SUV: 'suv',
    LUXURY: 'luxury',
    VAN: 'van',
  },
};

// تصدير الإعدادات
export default {
  API: API_CONFIG,
  STORAGE: STORAGE_CONFIG,
  APP: APP_CONFIG,
  REPORT: REPORT_CONFIG,
  BOOKING: BOOKING_CONFIG,
  VEHICLE: VEHICLE_CONFIG,
};
