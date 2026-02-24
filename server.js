const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const socialMediaRoutes = require('./routes/socialMedia');
const postRoutes = require('./routes/posts');
const scheduleRoutes = require('./routes/schedules');

const app = express();
const PORT = process.env.PORT || 3000;

// الاتصال بقاعدة البيانات
connectDB();

// إعدادات الأمان
app.use(helmet());

// تقييد معدل الطلبات
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد أقصى 100 طلب لكل نافذة زمنية
});
app.use('/api/', limiter);

// إعدادات CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// تحليل جسم الطلب
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// إعدادات الجلسة
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // يوم واحد
  }
}));

// الملفات الثابتة
app.use(express.static('public'));

// توفير الوصول إلى الصور المرفوعة
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/social', socialMediaRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/schedules', scheduleRoutes);

// مسار الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم', error: err.message });
});

// بدء الخادم
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
