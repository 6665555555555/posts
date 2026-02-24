const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// تسجيل مستخدم جديد
router.post('/register', authController.register);

// تسجيل الدخول
router.post('/login', authController.login);

// تسجيل الخروج
router.post('/logout', authController.logout);

// التحقق من حالة المصادقة
router.get('/status', authController.checkAuth);

// ربط حسابات التواصل الاجتماعي
router.post('/connect/twitter', authController.connectTwitter);
router.post('/connect/facebook', authController.connectFacebook);
router.post('/connect/instagram', authController.connectInstagram);
router.post('/connect/linkedin', authController.connectLinkedIn);

// فصل حسابات التواصل الاجتماعي
router.post('/disconnect/:platform', authController.disconnectPlatform);

module.exports = router;
