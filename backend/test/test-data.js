/**
 * بيانات اختبار لنظام تأجير السيارات
 * يستخدم هذا الملف لإنشاء بيانات اختبار للتأكد من عمل النظام بشكل صحيح
 */

const { sequelize, Sequelize } = require('../models');
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
const bcrypt = require('bcryptjs');

// تاريخ اليوم
const today = new Date();

// إنشاء تاريخ مستقبلي (بعد أيام محددة)
const getFutureDate = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date;
};

// إنشاء تاريخ سابق (قبل أيام محددة)
const getPastDate = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() - days);
  return date;
};

// تنسيق التاريخ إلى YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// إنشاء بيانات الاختبار
const createTestData = async () => {
  try {
    console.log('بدء إنشاء بيانات الاختبار...');

    // إنشاء المستأجرين (Tenants)
    const tenant1 = await Tenant.create({
      name: 'شركة الرياض للسياحة',
      domain: 'riyadh-tourism',
      subscription_plan: 'premium',
      subscription_status: 'active',
      contact_email: 'info@riyadh-tourism.com',
      contact_phone: '0501234567',
      is_active: true
    });

    const tenant2 = await Tenant.create({
      name: 'شركة جدة للسفر',
      domain: 'jeddah-travel',
      subscription_plan: 'standard',
      subscription_status: 'active',
      contact_email: 'info@jeddah-travel.com',
      contact_phone: '0567891234',
      is_active: true
    });

    console.log('تم إنشاء المستأجرين بنجاح');

    // إنشاء المستخدمين
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      username: 'admin1',
      email: 'admin1@riyadh-tourism.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      tenant_id: tenant1.id
    });

    const user2 = await User.create({
      username: 'manager1',
      email: 'manager1@riyadh-tourism.com',
      password: hashedPassword,
      role: 'manager',
      is_active: true,
      tenant_id: tenant1.id
    });

    const user3 = await User.create({
      username: 'admin2',
      email: 'admin2@jeddah-travel.com',
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      tenant_id: tenant2.id
    });

    console.log('تم إنشاء المستخدمين بنجاح');

    // إنشاء الشركات
    const company1 = await Company.create({
      name: 'شركة الفيصل',
      contact_person: 'أحمد الفيصل',
      phone: '0512345678',
      email: 'info@faisal-company.com',
      address: 'الرياض، شارع الملك فهد',
      tenant_id: tenant1.id
    });

    const company2 = await Company.create({
      name: 'مؤسسة النور',
      contact_person: 'محمد النور',
      phone: '0523456789',
      email: 'info@alnoor.com',
      address: 'الرياض، شارع العليا',
      tenant_id: tenant1.id
    });

    const company3 = await Company.create({
      name: 'شركة البحر',
      contact_person: 'خالد البحر',
      phone: '0534567890',
      email: 'info@albahr.com',
      address: 'جدة، شارع الكورنيش',
      tenant_id: tenant2.id
    });

    console.log('تم إنشاء الشركات بنجاح');

    // إنشاء العملاء
    const customer1 = await Customer.create({
      full_name: 'عبدالله السعيد',
      phone: '0545678901',
      nationality: 'سعودي',
      whatsapp: '0545678901',
      company_id: company1.id,
      is_vip: true,
      balance: 0,
      tenant_id: tenant1.id
    });

    const customer2 = await Customer.create({
      full_name: 'سارة العمري',
      phone: '0556789012',
      nationality: 'سعودية',
      whatsapp: '0556789012',
      company_id: company1.id,
      is_vip: false,
      balance: 0,
      tenant_id: tenant1.id
    });

    const customer3 = await Customer.create({
      full_name: 'محمد الشمري',
      phone: '0567890123',
      nationality: 'سعودي',
      whatsapp: '0567890123',
      company_id: company2.id,
      is_vip: false,
      balance: 0,
      tenant_id: tenant1.id
    });

    const customer4 = await Customer.create({
      full_name: 'فهد القحطاني',
      phone: '0578901234',
      nationality: 'سعودي',
      whatsapp: '0578901234',
      company_id: company3.id,
      is_vip: true,
      balance: 0,
      tenant_id: tenant2.id
    });

    console.log('تم إنشاء العملاء بنجاح');

    // إنشاء موديلات السيارات
    const model1 = await VehicleModel.create({
      name: 'تويوتا كامري',
      category: 'sedan',
      seats: 5,
      transmission: 'automatic',
      fuel_type: 'petrol'
    });

    const model2 = await VehicleModel.create({
      name: 'تويوتا لاند كروزر',
      category: 'suv',
      seats: 7,
      transmission: 'automatic',
      fuel_type: 'petrol'
    });

    const model3 = await VehicleModel.create({
      name: 'هيونداي سوناتا',
      category: 'sedan',
      seats: 5,
      transmission: 'automatic',
      fuel_type: 'petrol'
    });

    console.log('تم إنشاء موديلات السيارات بنجاح');

    // إنشاء السيارات
    const vehicle1 = await Vehicle.create({
      model_id: model1.id,
      license_plate: 'أ ب ج 1234',
      year: 2022,
      color: 'أبيض',
      status: 'available',
      rental_type: 'standard',
      daily_rate: 200,
      tenant_id: tenant1.id
    });

    const vehicle2 = await Vehicle.create({
      model_id: model2.id,
      license_plate: 'د هـ و 5678',
      year: 2023,
      color: 'أسود',
      status: 'available',
      rental_type: 'with_driver',
      daily_rate: 500,
      driver_daily_rate: 200,
      tenant_id: tenant1.id
    });

    const vehicle3 = await Vehicle.create({
      model_id: model3.id,
      license_plate: 'ز ح ط 9012',
      year: 2021,
      color: 'فضي',
      status: 'available',
      rental_type: 'standard',
      daily_rate: 180,
      tenant_id: tenant2.id
    });

    console.log('تم إنشاء السيارات بنجاح');

    // إنشاء السائقين
    const driver1 = await Driver.create({
      name: 'أحمد علي',
      phone: '0590123456',
      license_number: 'DL12345',
      license_expiry: formatDate(getFutureDate(365)),
      languages: 'العربية، الإنجليزية',
      status: 'available',
      daily_rate: 200,
      tenant_id: tenant1.id
    });

    const driver2 = await Driver.create({
      name: 'محمد خالد',
      phone: '0501234567',
      license_number: 'DL67890',
      license_expiry: formatDate(getFutureDate(180)),
      languages: 'العربية',
      status: 'available',
      daily_rate: 180,
      tenant_id: tenant2.id
    });

    console.log('تم إنشاء السائقين بنجاح');

    // إنشاء حجوزات السيارات
    const booking1 = await Booking.create({
      customer_id: customer1.id,
      vehicle_id: vehicle1.id,
      pickup_date: formatDate(getFutureDate(5)),
      pickup_time: '10:00',
      return_date: formatDate(getFutureDate(10)),
      return_time: '10:00',
      pickup_location: 'مطار الملك خالد الدولي',
      return_location: 'مطار الملك خالد الدولي',
      status: 'confirmed',
      payment_status: 'pending',
      total_amount: 1000,
      tenant_id: tenant1.id
    });

    const booking2 = await Booking.create({
      customer_id: customer2.id,
      vehicle_id: vehicle2.id,
      driver_id: driver1.id,
      pickup_date: formatDate(getFutureDate(7)),
      pickup_time: '14:00',
      return_date: formatDate(getFutureDate(12)),
      return_time: '14:00',
      pickup_location: 'فندق الريتز كارلتون',
      return_location: 'فندق الريتز كارلتون',
      status: 'confirmed',
      payment_status: 'pending',
      total_amount: 3500,
      tenant_id: tenant1.id,
      company_id: company1.id
    });

    const booking3 = await Booking.create({
      customer_id: customer4.id,
      vehicle_id: vehicle3.id,
      pickup_date: formatDate(getFutureDate(3)),
      pickup_time: '12:00',
      return_date: formatDate(getFutureDate(6)),
      return_time: '12:00',
      pickup_location: 'مطار الملك عبدالعزيز الدولي',
      return_location: 'مطار الملك عبدالعزيز الدولي',
      status: 'confirmed',
      payment_status: 'pending',
      total_amount: 540,
      tenant_id: tenant2.id,
      company_id: company3.id
    });

    console.log('تم إنشاء حجوزات السيارات بنجاح');

    // إنشاء حجوزات الفنادق
    const hotelBooking1 = await HotelBooking.create({
      customer_id: customer1.id,
      hotel_name: 'فندق الريتز كارلتون',
      hotel_location: 'الرياض',
      room_type: 'جناح فاخر',
      check_in_date: formatDate(getFutureDate(5)),
      check_out_date: formatDate(getFutureDate(10)),
      number_of_guests: 2,
      number_of_rooms: 1,
      total_amount: 5000,
      cost_price: 4000,
      profit_amount: 1000,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: tenant1.id,
      company_id: company1.id
    });

    const hotelBooking2 = await HotelBooking.create({
      customer_id: customer4.id,
      hotel_name: 'فندق هيلتون',
      hotel_location: 'جدة',
      room_type: 'غرفة مزدوجة',
      check_in_date: formatDate(getFutureDate(3)),
      check_out_date: formatDate(getFutureDate(6)),
      number_of_guests: 2,
      number_of_rooms: 1,
      total_amount: 2400,
      cost_price: 2000,
      profit_amount: 400,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: tenant2.id,
      company_id: company3.id
    });

    console.log('تم إنشاء حجوزات الفنادق بنجاح');

    // إنشاء حجوزات الطيران
    const flightBooking1 = await FlightBooking.create({
      customer_id: customer1.id,
      airline: 'الخطوط السعودية',
      flight_number: 'SV1234',
      departure_city: 'الرياض',
      arrival_city: 'دبي',
      departure_date: formatDate(getFutureDate(5)),
      departure_time: '08:00',
      arrival_date: formatDate(getFutureDate(5)),
      arrival_time: '10:00',
      passenger_count: 1,
      ticket_class: 'business',
      total_amount: 2000,
      cost_price: 1700,
      profit_amount: 300,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: tenant1.id,
      company_id: company1.id
    });

    const flightBooking2 = await FlightBooking.create({
      customer_id: customer4.id,
      airline: 'طيران الإمارات',
      flight_number: 'EK5678',
      departure_city: 'جدة',
      arrival_city: 'القاهرة',
      departure_date: formatDate(getFutureDate(3)),
      departure_time: '14:00',
      arrival_date: formatDate(getFutureDate(3)),
      arrival_time: '16:00',
      passenger_count: 2,
      ticket_class: 'economy',
      total_amount: 3000,
      cost_price: 2600,
      profit_amount: 400,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: tenant2.id,
      company_id: company3.id
    });

    console.log('تم إنشاء حجوزات الطيران بنجاح');

    // إنشاء الباقات السياحية
    const tourPackage1 = await TourPackage.create({
      customer_id: customer1.id,
      package_name: 'رحلة دبي الشاملة',
      description: 'باقة شاملة تتضمن تذاكر الطيران، الإقامة في فندق 5 نجوم، والتنقلات',
      start_date: formatDate(getFutureDate(5)),
      end_date: formatDate(getFutureDate(10)),
      number_of_persons: 2,
      includes_hotel: true,
      includes_transport: true,
      includes_flight: true,
      total_amount: 10000,
      cost_price: 8500,
      profit_amount: 1500,
      payment_status: 'pending',
      tenant_id: tenant1.id,
      company_id: company1.id
    });

    const tourPackage2 = await TourPackage.create({
      customer_id: customer4.id,
      package_name: 'رحلة القاهرة',
      description: 'باقة تشمل تذاكر الطيران والإقامة في فندق 4 نجوم',
      start_date: formatDate(getFutureDate(3)),
      end_date: formatDate(getFutureDate(8)),
      number_of_persons: 2,
      includes_hotel: true,
      includes_transport: false,
      includes_flight: true,
      total_amount: 7000,
      cost_price: 6000,
      profit_amount: 1000,
      payment_status: 'pending',
      tenant_id: tenant2.id,
      company_id: company3.id
    });

    console.log('تم إنشاء الباقات السياحية بنجاح');

    // إنشاء المدفوعات
    const payment1 = await Payment.create({
      customer_id: customer1.id,
      booking_id: booking1.id,
      amount: 500,
      payment_date: formatDate(today),
      payment_method: 'cash',
      reference_number: 'REF123456',
      status: 'completed',
      tenant_id: tenant1.id,
      company_id: company1.id
    });

    const payment2 = await Payment.create({
      customer_id: customer4.id,
      booking_id: booking3.id,
      amount: 300,
      payment_date: formatDate(today),
      payment_method: 'credit_card',
      reference_number: 'REF789012',
      status: 'completed',
      tenant_id: tenant2.id,
      company_id: company3.id
    });

    console.log('تم إنشاء المدفوعات بنجاح');

    // تحديث أرصدة العملاء
    await customer1.update({ balance: 16500 }); // مجموع الحجوزات - المدفوعات
    await customer4.update({ balance: 12640 }); // مجموع الحجوزات - المدفوعات

    console.log('تم تحديث أرصدة العملاء بنجاح');

    console.log('تم إنشاء جميع بيانات الاختبار بنجاح');
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء بيانات الاختبار:', error);
    return false;
  }
};

// تنظيف قاعدة البيانات (حذف جميع البيانات)
const cleanDatabase = async () => {
  try {
    console.log('بدء تنظيف قاعدة البيانات...');

    // حذف جميع البيانات من الجداول بترتيب معكوس للعلاقات
    await Payment.destroy({ where: {}, force: true });
    await TourPackage.destroy({ where: {}, force: true });
    await FlightBooking.destroy({ where: {}, force: true });
    await HotelBooking.destroy({ where: {}, force: true });
    await Booking.destroy({ where: {}, force: true });
    await Driver.destroy({ where: {}, force: true });
    await Vehicle.destroy({ where: {}, force: true });
    await VehicleModel.destroy({ where: {}, force: true });
    await Customer.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Tenant.destroy({ where: {}, force: true });

    console.log('تم تنظيف قاعدة البيانات بنجاح');
    return true;
  } catch (error) {
    console.error('حدث خطأ أثناء تنظيف قاعدة البيانات:', error);
    return false;
  }
};

// تشغيل الاختبار
const runTest = async () => {
  try {
    // تنظيف قاعدة البيانات أولاً
    await cleanDatabase();

    // إنشاء بيانات الاختبار
    await createTestData();

    console.log('تم تنفيذ الاختبار بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('حدث خطأ أثناء تنفيذ الاختبار:', error);
    process.exit(1);
  }
};

// تنفيذ الاختبار إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runTest();
}

module.exports = {
  createTestData,
  cleanDatabase,
  runTest
};
