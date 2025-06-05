const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// مسارات المصادقة العامة
router.post('/login', authController.login);
router.post('/register', authController.register);

// مسارات تحتاج إلى مصادقة
router.get('/profile', authenticate, authController.getProfile);

// مسار تحديث التوكن
router.post('/refresh-token', authenticate, authController.refreshToken);

module.exports = router;
