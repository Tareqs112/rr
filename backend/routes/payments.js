const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middleware/auth');

// تطبيق وسيط المصادقة على جميع مسارات المدفوعات
router.use(authMiddleware);

// الحصول على جميع المدفوعات
router.get('/', PaymentController.getAllPayments);

// الحصول على مدفوعات عميل معين
router.get('/customer/:customerId', PaymentController.getCustomerPayments);

// الحصول على مدفوعات شركة معينة
router.get('/company/:companyId', PaymentController.getCompanyPayments);

// إنشاء دفعة جديدة
router.post('/', PaymentController.createPayment);

// إنشاء أقساط للحجز
router.post('/installments', PaymentController.createInstallments);

// الحصول على الأقساط المستحقة
router.get('/installments/due', PaymentController.getDueInstallments);

// إنشاء فاتورة (إيصال) للعميل
router.get('/voucher/:payment_id', PaymentController.generateVoucher);

// الحصول على إجمالي المبالغ المستحقة لكل عميل
router.get('/balances/customers', PaymentController.getCustomerBalances);

// الحصول على إجمالي المبالغ المستحقة لكل شركة
router.get('/balances/companies', PaymentController.getCompanyBalances);

module.exports = router;
