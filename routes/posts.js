const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const multer = require('multer');
const path = require('path');

// إعداد تخزين الصور
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// فلتر الصور
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('يجب أن يكون الملف صورة بصيغة jpeg، jpg، png أو gif'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميجابايت
});

// إنشاء منشور جديد
router.post('/', upload.single('image'), postController.createPost);

// الحصول على جميع المنشورات
router.get('/', postController.getAllPosts);

// الحصول على منشور محدد
router.get('/:id', postController.getPostById);

// تحديث منشور
router.put('/:id', upload.single('image'), postController.updatePost);

// حذف منشور
router.delete('/:id', postController.deletePost);

// نشر منشور محفوظ
router.post('/:id/publish', postController.publishSavedPost);

module.exports = router;
