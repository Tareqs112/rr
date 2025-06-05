const express = require('express');
const router = express.Router();

/**
 * ✅ هذا الراوت يقدم بيانات افتراضية للوحة التحكم (Dashboard)
 * يمكنك لاحقًا ربطه ببيانات حقيقية من قاعدة البيانات حسب الحاجة
 */
router.get('/dashboard-summary', async (req, res) => {
  try {
    const summaryData = {
      totalCustomers: 25,
      totalDrivers: 10,
      totalBookings: 42,
      activeVehicles: 18,
      recentActivities: [
        { id: 1, action: 'تمت إضافة حجز جديد', timestamp: '2025-06-04T20:15:00' },
        { id: 2, action: 'تم تحديث بيانات العميل أحمد', timestamp: '2025-06-04T19:55:00' }
      ]
    };
    return res.json({ success: true, data: summaryData });
  } catch (error) {
    console.error('❌ خطأ في جلب ملخص لوحة التحكم:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل البيانات' });
  }
});

/**
 * ✅ إضافة نقطة نهاية للإيرادات الشهرية
 */
router.get('/revenue/monthly', async (req, res) => {
  try {
    // بيانات وهمية للإيرادات الشهرية
    const monthlyRevenueData = {
      labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      datasets: [
        {
          label: 'الإيرادات الشهرية',
          data: [12500, 15000, 18200, 14300, 19800, 21500, 25000, 22800, 20500, 23000, 27500, 30000],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
    
    return res.json({ success: true, data: monthlyRevenueData });
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الإيرادات الشهرية:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل بيانات الإيرادات الشهرية' });
  }
});

/**
 * ✅ إضافة نقطة نهاية للإيرادات
 */
router.get('/revenue', async (req, res) => {
  try {
    // بيانات وهمية للإيرادات
    const revenueData = {
      totalRevenue: 245000,
      averageMonthlyRevenue: 20417,
      revenueByQuarter: [
        { quarter: 'الربع الأول', amount: 45700 },
        { quarter: 'الربع الثاني', amount: 55600 },
        { quarter: 'الربع الثالث', amount: 68300 },
        { quarter: 'الربع الرابع', amount: 80500 }
      ],
      revenueByVehicleType: [
        { type: 'سيدان', amount: 98000 },
        { type: 'دفع رباعي', amount: 73500 },
        { type: 'فاخرة', amount: 49000 },
        { type: 'حافلة صغيرة', amount: 24500 }
      ]
    };
    
    return res.json({ success: true, data: revenueData });
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الإيرادات:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل بيانات الإيرادات' });
  }
});

/**
 * ✅ إضافة نقطة نهاية لتقارير الحجوزات
 */
router.get('/bookings', async (req, res) => {
  try {
    // بيانات وهمية لتقارير الحجوزات
    const bookingsData = {
      totalBookings: 42,
      completedBookings: 35,
      cancelledBookings: 3,
      pendingBookings: 4,
      bookingsByMonth: [
        { month: 'يناير', count: 3 },
        { month: 'فبراير', count: 4 },
        { month: 'مارس', count: 5 },
        { month: 'أبريل', count: 3 },
        { month: 'مايو', count: 6 },
        { month: 'يونيو', count: 7 },
        { month: 'يوليو', count: 8 },
        { month: 'أغسطس', count: 6 }
      ],
      recentBookings: [
        { id: 1, customer: 'أحمد محمد', vehicle: 'تويوتا كامري', startDate: '2025-06-01', endDate: '2025-06-05', status: 'completed' },
        { id: 2, customer: 'سارة علي', vehicle: 'هوندا أكورد', startDate: '2025-06-02', endDate: '2025-06-08', status: 'completed' },
        { id: 3, customer: 'محمد خالد', vehicle: 'نيسان التيما', startDate: '2025-06-03', endDate: '2025-06-06', status: 'completed' },
        { id: 4, customer: 'فاطمة أحمد', vehicle: 'تويوتا لاند كروزر', startDate: '2025-06-04', endDate: '2025-06-10', status: 'active' },
        { id: 5, customer: 'خالد عمر', vehicle: 'مرسيدس E-Class', startDate: '2025-06-05', endDate: '2025-06-12', status: 'pending' }
      ]
    };
    
    return res.json({ success: true, data: bookingsData });
  } catch (error) {
    console.error('❌ خطأ في جلب تقارير الحجوزات:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل تقارير الحجوزات' });
  }
});

/**
 * ✅ إضافة نقطة نهاية لتقارير المركبات
 */
router.get('/vehicles', async (req, res) => {
  try {
    // بيانات وهمية لتقارير المركبات
    const vehiclesData = {
      totalVehicles: 25,
      activeVehicles: 18,
      maintenanceVehicles: 4,
      inactiveVehicles: 3,
      vehiclesByType: [
        { type: 'سيدان', count: 10 },
        { type: 'دفع رباعي', count: 8 },
        { type: 'فاخرة', count: 4 },
        { type: 'حافلة صغيرة', count: 3 }
      ],
      vehicleUtilization: [
        { vehicle: 'تويوتا كامري', utilization: 85 },
        { vehicle: 'هوندا أكورد', utilization: 78 },
        { vehicle: 'نيسان التيما', utilization: 92 },
        { vehicle: 'تويوتا لاند كروزر', utilization: 88 },
        { vehicle: 'مرسيدس E-Class', utilization: 65 }
      ]
    };
    
    return res.json({ success: true, data: vehiclesData });
  } catch (error) {
    console.error('❌ خطأ في جلب تقارير المركبات:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل تقارير المركبات' });
  }
});

/**
 * ✅ إضافة نقطة نهاية لتقارير العملاء
 */
router.get('/customers', async (req, res) => {
  try {
    // بيانات وهمية لتقارير العملاء
    const customersData = {
      totalCustomers: 25,
      newCustomers: 5,
      returningCustomers: 20,
      customersByMonth: [
        { month: 'يناير', count: 2 },
        { month: 'فبراير', count: 3 },
        { month: 'مارس', count: 1 },
        { month: 'أبريل', count: 4 },
        { month: 'مايو', count: 2 },
        { month: 'يونيو', count: 5 },
        { month: 'يوليو', count: 3 },
        { month: 'أغسطس', count: 5 }
      ],
      topCustomers: [
        { id: 1, name: 'أحمد محمد', bookings: 5, totalSpent: 12500 },
        { id: 2, name: 'سارة علي', bookings: 4, totalSpent: 10800 },
        { id: 3, name: 'محمد خالد', bookings: 3, totalSpent: 8200 },
        { id: 4, name: 'فاطمة أحمد', bookings: 3, totalSpent: 7500 },
        { id: 5, name: 'خالد عمر', bookings: 2, totalSpent: 6300 }
      ]
    };
    
    return res.json({ success: true, data: customersData });
  } catch (error) {
    console.error('❌ خطأ في جلب تقارير العملاء:', error);
    return res.status(500).json({ success: false, message: 'فشل في تحميل تقارير العملاء' });
  }
});

module.exports = router;
