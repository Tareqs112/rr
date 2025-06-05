const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/VehicleController');
const { authenticate } = require('../middleware/auth'); // ✅ استيراد الدالة مباشرة

// ✅ تطبيق المصادقة على جميع المسارات
router.use(authenticate);

// 🔹 المركبات Vehicles

// الحصول على جميع المركبات
router.get('/', VehicleController.getAllVehicles);

// الحصول على مركبة بالتفصيل
router.get('/:id', VehicleController.getVehicleById);

// إنشاء مركبة جديدة
router.post('/', VehicleController.createVehicle);

// تعديل مركبة
router.put('/:id', VehicleController.updateVehicle);

// حذف مركبة
router.delete('/:id', VehicleController.deleteVehicle);

// البحث عن المركبات المتاحة بالتواريخ
router.get('/available/filter', VehicleController.getVehicleAvailability);

// تقويم المركبة
router.get('/calendar', VehicleController.getVehicleCalendar);

// ملخص التوفر
router.get('/summary/availability', VehicleController.getAvailabilitySummary);

// حسب الموديل
router.get('/by-model/:model_id', VehicleController.getVehiclesByModel);

// 🔹 الموديلات Vehicle Models

// الحصول على جميع الموديلات
router.get('/models/all', VehicleController.getAllVehicleModels);

// الحصول على موديل معين
router.get('/models/:id', VehicleController.getVehicleModelById);

// إنشاء موديل
router.post('/models', VehicleController.createVehicleModel);

// تعديل موديل
router.put('/models/:id', VehicleController.updateVehicleModel);

// حذف موديل
router.delete('/models/:id', VehicleController.deleteVehicleModel);

// ✅ تصدير الراوتر مرة واحدة فقط في النهاية
module.exports = router;
