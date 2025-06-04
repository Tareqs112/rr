const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const middleware = require('../middleware/auth');

/**
 * طرق التعامل مع العملاء
 */

// الحصول على جميع العملاء
router.get('/', customerController.getAllCustomers);

// البحث عن العملاء
router.get('/search', customerController.searchCustomers);

// الحصول على عميل محدد
router.get('/:id', customerController.getCustomerById);

// إنشاء عميل جديد
router.post('/', customerController.createCustomer);

// تحديث بيانات عميل
router.put('/:id', customerController.updateCustomer);

// حذف عميل
router.delete('/:id', middleware.authorize(['admin', 'manager']), customerController.deleteCustomer);

// الحصول على حجوزات عميل محدد
router.get('/:id/bookings', customerController.getCustomerBookings);

// الحصول على المعاملات المالية للعميل
router.get('/:id/financials', customerController.getCustomerFinancials);

// إنشاء دفعة جديدة للعميل
router.post('/:id/payments', customerController.createCustomerPayment);

module.exports = router;
