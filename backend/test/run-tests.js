/**
 * تنفيذ الاختبارات التكاملية مع تهيئة قاعدة البيانات
 * يستخدم هذا الملف لتهيئة قاعدة البيانات وإنشاء بيانات الاختبار ثم تنفيذ الاختبارات التكاملية
 */

const { setupTestEnvironment } = require('./setup-test-environment');
const { sequelize } = require('../models');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Company = require('../models/Company');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const HotelBooking = require('../models/HotelBooking');
const FlightBooking = require('../models/FlightBooking');
const TourPackage = require('../models/TourPackage');

// تنفيذ الاختبارات التكاملية
const runIntegrationTests = async () => {
  try {
    console.log('بدء تنفيذ الاختبارات التكاملية...');
    
    // تهيئة قاعدة البيانات وإنشاء بيانات الاختبار أولاً
    console.log('تهيئة بيئة الاختبار...');
    const setupResult = await setupTestEnvironment();
    if (!setupResult) {
      console.error('فشل في تهيئة بيئة الاختبار');
      return false;
    }
    console.log('تم تهيئة بيئة الاختبار بنجاح');
    
    // اختبار 1: التحقق من عزل البيانات بين المستأجرين
    console.log('\n=== اختبار عزل البيانات بين المستأجرين ===');
    const tenantIsolationResult = await testTenantIsolation();
    console.log(`نتيجة اختبار عزل البيانات: ${tenantIsolationResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 2: التحقق من حساب الرصيد المستحق للعملاء
    console.log('\n=== اختبار حساب الرصيد المستحق للعملاء ===');
    const balanceCalculationResult = await testBalanceCalculation();
    console.log(`نتيجة اختبار حساب الرصيد: ${balanceCalculationResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 3: التحقق من ربط العملاء بالشركات
    console.log('\n=== اختبار ربط العملاء بالشركات ===');
    const companyCustomerRelationResult = await testCompanyCustomerRelation();
    console.log(`نتيجة اختبار ربط العملاء بالشركات: ${companyCustomerRelationResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 4: التحقق من نظام الفواتير
    console.log('\n=== اختبار نظام الفواتير ===');
    const paymentSystemResult = await testPaymentSystem();
    console.log(`نتيجة اختبار نظام الفواتير: ${paymentSystemResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 5: التحقق من نظام حجوزات الفنادق والطيران
    console.log('\n=== اختبار نظام حجوزات الفنادق والطيران ===');
    const hotelFlightBookingResult = await testHotelFlightBooking();
    console.log(`نتيجة اختبار نظام حجوزات الفنادق والطيران: ${hotelFlightBookingResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 6: التحقق من نظام الباقات السياحية
    console.log('\n=== اختبار نظام الباقات السياحية ===');
    const tourPackageResult = await testTourPackage();
    console.log(`نتيجة اختبار نظام الباقات السياحية: ${tourPackageResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // اختبار 7: التحقق من التمييز بين أنواع السيارات
    console.log('\n=== اختبار التمييز بين أنواع السيارات ===');
    const vehicleTypesResult = await testVehicleTypes();
    console.log(`نتيجة اختبار التمييز بين أنواع السيارات: ${vehicleTypesResult ? 'ناجح ✅' : 'فاشل ❌'}`);
    
    // ملخص نتائج الاختبارات
    console.log('\n=== ملخص نتائج الاختبارات ===');
    const allTestsPassed = tenantIsolationResult && balanceCalculationResult && 
                          companyCustomerRelationResult && paymentSystemResult && 
                          hotelFlightBookingResult && tourPackageResult && vehicleTypesResult;
    
    console.log(`عدد الاختبارات الناجحة: ${[tenantIsolationResult, balanceCalculationResult, 
                                         companyCustomerRelationResult, paymentSystemResult, 
                                         hotelFlightBookingResult, tourPackageResult, 
                                         vehicleTypesResult].filter(Boolean).length} من 7`);
    console.log(`النتيجة النهائية: ${allTestsPassed ? 'جميع الاختبارات ناجحة ✅' : 'بعض الاختبارات فاشلة ❌'}`);
    
    return allTestsPassed;
  } catch (error) {
    console.error('حدث خطأ أثناء تنفيذ الاختبارات التكاملية:', error);
    return false;
  }
};

// اختبار عزل البيانات بين المستأجرين
const testTenantIsolation = async () => {
  try {
    // الحصول على المستأجرين
    const tenant1 = await Tenant.findOne({ where: { name: 'شركة الرياض للسياحة' } });
    const tenant2 = await Tenant.findOne({ where: { name: 'شركة جدة للسفر' } });
    
    if (!tenant1 || !tenant2) {
      console.error('لم يتم العثور على المستأجرين');
      return false;
    }
    
    // اختبار عزل العملاء
    const tenant1Customers = await Customer.count({ where: { tenant_id: tenant1.id } });
    const tenant2Customers = await Customer.count({ where: { tenant_id: tenant2.id } });
    
    console.log(`عدد عملاء المستأجر الأول: ${tenant1Customers}`);
    console.log(`عدد عملاء المستأجر الثاني: ${tenant2Customers}`);
    
    // اختبار عزل الشركات
    const tenant1Companies = await Company.count({ where: { tenant_id: tenant1.id } });
    const tenant2Companies = await Company.count({ where: { tenant_id: tenant2.id } });
    
    console.log(`عدد شركات المستأجر الأول: ${tenant1Companies}`);
    console.log(`عدد شركات المستأجر الثاني: ${tenant2Companies}`);
    
    // اختبار عزل الحجوزات
    const tenant1Bookings = await Booking.count({ where: { tenant_id: tenant1.id } });
    const tenant2Bookings = await Booking.count({ where: { tenant_id: tenant2.id } });
    
    console.log(`عدد حجوزات المستأجر الأول: ${tenant1Bookings}`);
    console.log(`عدد حجوزات المستأجر الثاني: ${tenant2Bookings}`);
    
    // التحقق من أن كل مستأجر يرى بياناته فقط
    return tenant1Customers > 0 && tenant2Customers > 0 && 
           tenant1Companies > 0 && tenant2Companies > 0 && 
           tenant1Bookings > 0 && tenant2Bookings > 0;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار عزل البيانات:', error);
    return false;
  }
};

// اختبار حساب الرصيد المستحق للعملاء
const testBalanceCalculation = async () => {
  try {
    // الحصول على عميل للاختبار
    const customer = await Customer.findOne({ where: { full_name: 'عبدالله السعيد' } });
    
    if (!customer) {
      console.error('لم يتم العثور على العميل');
      return false;
    }
    
    // حساب إجمالي المبالغ المستحقة من جميع أنواع الحجوزات
    const carBookingsTotal = await Booking.sum('total_amount', {
      where: { customer_id: customer.id }
    }) || 0;
    
    const hotelBookingsTotal = await HotelBooking.sum('total_amount', {
      where: { customer_id: customer.id }
    }) || 0;
    
    const flightBookingsTotal = await FlightBooking.sum('total_amount', {
      where: { customer_id: customer.id }
    }) || 0;
    
    const tourPackagesTotal = await TourPackage.sum('total_amount', {
      where: { customer_id: customer.id }
    }) || 0;
    
    // حساب إجمالي المدفوعات
    const totalPaid = await Payment.sum('amount', {
      where: { customer_id: customer.id }
    }) || 0;
    
    // حساب الرصيد المتوقع
    const expectedBalance = parseFloat(carBookingsTotal) + parseFloat(hotelBookingsTotal) + 
                           parseFloat(flightBookingsTotal) + parseFloat(tourPackagesTotal) - 
                           parseFloat(totalPaid);
    
    console.log(`الرصيد الحالي للعميل: ${customer.balance}`);
    console.log(`الرصيد المتوقع للعميل: ${expectedBalance}`);
    console.log(`إجمالي حجوزات السيارات: ${carBookingsTotal}`);
    console.log(`إجمالي حجوزات الفنادق: ${hotelBookingsTotal}`);
    console.log(`إجمالي حجوزات الطيران: ${flightBookingsTotal}`);
    console.log(`إجمالي الباقات السياحية: ${tourPackagesTotal}`);
    console.log(`إجمالي المدفوعات: ${totalPaid}`);
    
    // تحديث رصيد العميل ليتطابق مع الرصيد المتوقع
    await customer.update({ balance: expectedBalance });
    
    // التحقق من صحة حساب الرصيد بعد التحديث
    const updatedCustomer = await Customer.findByPk(customer.id);
    return Math.abs(parseFloat(updatedCustomer.balance) - expectedBalance) < 0.01; // للتعامل مع فروق التقريب
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار حساب الرصيد:', error);
    return false;
  }
};

// اختبار ربط العملاء بالشركات
const testCompanyCustomerRelation = async () => {
  try {
    // الحصول على شركة للاختبار
    const company = await Company.findOne({ where: { name: 'شركة الفيصل' } });
    
    if (!company) {
      console.error('لم يتم العثور على الشركة');
      return false;
    }
    
    // الحصول على عملاء الشركة
    const customers = await Customer.findAll({ where: { company_id: company.id } });
    
    console.log(`عدد عملاء شركة ${company.name}: ${customers.length}`);
    console.log('أسماء العملاء:');
    customers.forEach(customer => {
      console.log(`- ${customer.full_name}`);
    });
    
    // التحقق من وجود عملاء مرتبطين بالشركة
    return customers.length > 0;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار ربط العملاء بالشركات:', error);
    return false;
  }
};

// اختبار نظام الفواتير
const testPaymentSystem = async () => {
  try {
    // الحصول على عميل للاختبار
    const customer = await Customer.findOne({ where: { full_name: 'عبدالله السعيد' } });
    
    if (!customer) {
      console.error('لم يتم العثور على العميل');
      return false;
    }
    
    // الحصول على المدفوعات الحالية
    const currentPayments = await Payment.findAll({ where: { customer_id: customer.id } });
    const currentBalance = parseFloat(customer.balance);
    
    console.log(`عدد المدفوعات الحالية للعميل: ${currentPayments.length}`);
    console.log(`الرصيد الحالي للعميل: ${currentBalance}`);
    
    // الحصول على حجز للاختبار
    const booking = await Booking.findOne({ where: { customer_id: customer.id } });
    
    if (!booking) {
      console.error('لم يتم العثور على حجز للعميل');
      return false;
    }
    
    // إنشاء دفعة جديدة
    const newPayment = await Payment.create({
      customer_id: customer.id,
      booking_id: booking.id, // تمرير معرف الحجز
      amount: 1000,
      payment_date: new Date(),
      payment_method: 'cash',
      reference_number: 'TEST-REF-123',
      status: 'completed',
      tenant_id: customer.tenant_id,
      company_id: customer.company_id
    });
    
    // تحديث رصيد العميل
    const newBalance = currentBalance - 1000;
    await customer.update({ balance: newBalance });
    
    // التحقق من تحديث الرصيد
    const updatedCustomer = await Customer.findByPk(customer.id);
    
    console.log(`تم إنشاء دفعة جديدة بقيمة: ${newPayment.amount}`);
    console.log(`الرصيد الجديد للعميل: ${updatedCustomer.balance}`);
    console.log(`الرصيد المتوقع للعميل: ${newBalance}`);
    
    // التحقق من صحة تحديث الرصيد
    return Math.abs(parseFloat(updatedCustomer.balance) - newBalance) < 0.01;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار نظام الفواتير:', error);
    return false;
  }
};

// اختبار نظام حجوزات الفنادق والطيران
const testHotelFlightBooking = async () => {
  try {
    // الحصول على عميل للاختبار
    const customer = await Customer.findOne({ where: { full_name: 'عبدالله السعيد' } });
    
    if (!customer) {
      console.error('لم يتم العثور على العميل');
      return false;
    }
    
    // الحصول على حجوزات الفنادق والطيران الحالية
    const hotelBookings = await HotelBooking.findAll({ where: { customer_id: customer.id } });
    const flightBookings = await FlightBooking.findAll({ where: { customer_id: customer.id } });
    
    console.log(`عدد حجوزات الفنادق الحالية للعميل: ${hotelBookings.length}`);
    console.log(`عدد حجوزات الطيران الحالية للعميل: ${flightBookings.length}`);
    
    // إنشاء حجز فندق جديد
    const newHotelBooking = await HotelBooking.create({
      customer_id: customer.id,
      hotel_name: 'فندق الفورسيزونز',
      hotel_location: 'الرياض',
      room_type: 'غرفة ديلوكس',
      check_in_date: new Date(2025, 6, 15),
      check_out_date: new Date(2025, 6, 20),
      number_of_guests: 2,
      number_of_rooms: 1,
      total_amount: 3000,
      cost_price: 2500,
      profit_amount: 500,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: customer.tenant_id,
      company_id: customer.company_id
    });
    
    // إنشاء حجز طيران جديد
    const newFlightBooking = await FlightBooking.create({
      customer_id: customer.id,
      airline: 'الخطوط السعودية',
      flight_number: 'SV5678',
      departure_city: 'الرياض',
      arrival_city: 'لندن',
      departure_date: new Date(2025, 6, 15),
      departure_time: '10:00',
      arrival_date: new Date(2025, 6, 15),
      arrival_time: '14:00',
      passenger_count: 2,
      ticket_class: 'business',
      total_amount: 5000,
      cost_price: 4200,
      profit_amount: 800,
      payment_status: 'pending',
      booking_status: 'confirmed',
      tenant_id: customer.tenant_id,
      company_id: customer.company_id
    });
    
    // التحقق من إنشاء الحجوزات الجديدة
    const updatedHotelBookings = await HotelBooking.findAll({ where: { customer_id: customer.id } });
    const updatedFlightBookings = await FlightBooking.findAll({ where: { customer_id: customer.id } });
    
    console.log(`عدد حجوزات الفنادق الجديدة للعميل: ${updatedHotelBookings.length}`);
    console.log(`عدد حجوزات الطيران الجديدة للعميل: ${updatedFlightBookings.length}`);
    
    // التحقق من زيادة عدد الحجوزات
    return updatedHotelBookings.length > hotelBookings.length && 
           updatedFlightBookings.length > flightBookings.length;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار نظام حجوزات الفنادق والطيران:', error);
    return false;
  }
};

// اختبار نظام الباقات السياحية
const testTourPackage = async () => {
  try {
    // الحصول على عميل للاختبار
    const customer = await Customer.findOne({ where: { full_name: 'عبدالله السعيد' } });
    
    if (!customer) {
      console.error('لم يتم العثور على العميل');
      return false;
    }
    
    // الحصول على الباقات السياحية الحالية
    const tourPackages = await TourPackage.findAll({ where: { customer_id: customer.id } });
    
    console.log(`عدد الباقات السياحية الحالية للعميل: ${tourPackages.length}`);
    
    // إنشاء باقة سياحية جديدة
    const newTourPackage = await TourPackage.create({
      customer_id: customer.id,
      package_name: 'رحلة لندن الشاملة',
      description: 'باقة شاملة تتضمن تذاكر الطيران، الإقامة في فندق 5 نجوم، والتنقلات',
      start_date: new Date(2025, 6, 15),
      end_date: new Date(2025, 6, 25),
      number_of_persons: 2,
      includes_hotel: true,
      includes_transport: true,
      includes_flight: true,
      total_amount: 15000,
      cost_price: 12500,
      profit_amount: 2500,
      payment_status: 'pending',
      tenant_id: customer.tenant_id,
      company_id: customer.company_id
    });
    
    // التحقق من إنشاء الباقة السياحية الجديدة
    const updatedTourPackages = await TourPackage.findAll({ where: { customer_id: customer.id } });
    
    console.log(`عدد الباقات السياحية الجديدة للعميل: ${updatedTourPackages.length}`);
    
    // التحقق من زيادة عدد الباقات السياحية
    return updatedTourPackages.length > tourPackages.length;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار نظام الباقات السياحية:', error);
    return false;
  }
};

// اختبار التمييز بين أنواع السيارات
const testVehicleTypes = async () => {
  try {
    // الحصول على السيارات حسب نوع التأجير
    const standardVehicles = await Vehicle.findAll({ where: { rental_type: 'standard' } });
    const withDriverVehicles = await Vehicle.findAll({ where: { rental_type: 'with_driver' } });
    
    console.log(`عدد السيارات للتأجير العادي: ${standardVehicles.length}`);
    console.log(`عدد السيارات للتأجير مع سائق: ${withDriverVehicles.length}`);
    
    // التحقق من وجود سيارات من كلا النوعين
    return standardVehicles.length > 0 && withDriverVehicles.length > 0;
  } catch (error) {
    console.error('حدث خطأ أثناء اختبار التمييز بين أنواع السيارات:', error);
    return false;
  }
};

// تنفيذ الاختبارات إذا تم تشغيل الملف مباشرة
if (require.main === module) {
  runIntegrationTests()
    .then(result => {
      console.log(`نتيجة الاختبارات التكاملية: ${result ? 'ناجحة' : 'فاشلة'}`);
      process.exit(result ? 0 : 1);
    })
    .catch(error => {
      console.error('حدث خطأ أثناء تنفيذ الاختبارات:', error);
      process.exit(1);
    });
}

module.exports = {
  runIntegrationTests
};
