const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/socialMediaController');

// الحصول على حالة الاتصال بمنصات التواصل الاجتماعي
router.get('/status', socialMediaController.getConnectionStatus);

// نشر منشور على منصة واحدة
router.post('/publish/:platform', socialMediaController.publishToPlatform);

// نشر منشور على عدة منصات
router.post('/publish/multiple', socialMediaController.publishToMultiplePlatforms);

// الحصول على إحصائيات المنشورات
router.get('/stats/:platform', socialMediaController.getPostStats);

// الحصول على قائمة المنشورات
router.get('/posts/:platform', socialMediaController.getPosts);

// حذف منشور
router.delete('/posts/:platform/:postId', socialMediaController.deletePost);

module.exports = router;
