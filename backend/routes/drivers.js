const express = require('express');
const router = express.Router();
const DriverController = require('../controllers/driverController');
const { authenticate } = require('../middleware/auth');

// 🛡️ حماية جميع المسارات
router.use(authenticate);

// 🔹 مسارات إدارة السائقين
router.get('/', DriverController.getAllDrivers); // كل السائقين
router.get('/:id', DriverController.getDriverById); // سائق واحد
router.post('/', DriverController.createDriver); // إنشاء
router.put('/:id', DriverController.updateDriver); // تعديل
router.delete('/:id', DriverController.deleteDriver); // حذف

// 🔍 التوفر والحجوزات
router.get('/available/check', DriverController.getAvailableDrivers); // السائقين المتاحين
router.get('/:id/bookings', DriverController.getDriverBookings); // حجوزات سائق معين

module.exports = router;
