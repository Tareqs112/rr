const express = require('express');
const router = express.Router();
const tenantController = require('../../controllers/tenantController');

/**
 * طرق التعامل مع المستأجرين (للمشرف الرئيسي فقط)
 */

// الحصول على جميع المستأجرين
router.get('/', tenantController.getAllTenants);

// الحصول على مستأجر محدد
router.get('/:id', tenantController.getTenantById);

// إنشاء مستأجر جديد
router.post('/', tenantController.createTenant);

// تحديث بيانات مستأجر
router.put('/:id', tenantController.updateTenant);

// حذف مستأجر
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
