/**
 * تهيئة قاعدة البيانات للاختبار
 * يستخدم هذا الملف لإنشاء جداول قاعدة البيانات تلقائياً قبل تنفيذ الاختبارات
 */

const { sequelize } = require('../models');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const VehicleModel = require('../models/VehicleModel');
const Driver = require('../models/Driver');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const HotelBooking = require('../models/HotelBooking');
const FlightBooking = require('../models/FlightBooking');
const TourPackage = require('../models/TourPackage');

// تهيئة قاعدة البيانات
const initializeDatabase = async () => {
  try {
    console.log('بدء تهيئة قاعدة البيانات...');
    
    // إنشاء جميع الجداول تلقائياً
    await sequelize.sync({ force: true });
    
    console.log('تم تهيئة قاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة قاعدة البيانات:', error);
    return false;
  }
};

// تنفيذ التهيئة إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  initializeDatabase()
    .then(result => {
      console.log(`نتيجة تهيئة قاعدة البيانات: ${result ? 'ناجحة' : 'فاشلة'}`);
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('حدث خطأ غير متوقع:', error);
      process.exit(1);
    });
}

module.exports = {
  initializeDatabase
};
