const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const middleware = require('../middleware/auth');

/**
 * طرق التعامل مع الشركات
 */

// الحصول على جميع الشركات
router.get('/', companyController.getAllCompanies);

// الحصول على شركة محددة
router.get('/:id', companyController.getCompanyById);

// إنشاء شركة جديدة
router.post('/', companyController.createCompany);

// تحديث بيانات شركة
router.put('/:id', companyController.updateCompany);

// حذف شركة
router.delete('/:id', middleware.authorize(['admin', 'manager']), companyController.deleteCompany);

// الحصول على عملاء شركة محددة
router.get('/:id/customers', companyController.getCompanyCustomers);

// الحصول على حجوزات شركة محددة
router.get('/:id/bookings', companyController.getCompanyBookings);

// الحصول على تقرير مالي للشركة
router.get('/:id/financial-report', middleware.authorize(['admin', 'manager']), companyController.getCompanyFinancialReport);

module.exports = router;
