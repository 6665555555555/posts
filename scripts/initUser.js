const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/social-media-auto-publisher', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('تم الاتصال بقاعدة البيانات'))
.catch(err => {
  console.error('خطأ في الاتصال بقاعدة البيانات:', err);
  process.exit(1);
});

// إنشاء مستخدم افتراضي
async function createDefaultUser() {
  try {
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ username: 'admin' });

    if (existingUser) {
      console.log('المستخدم الافتراضي موجود بالفعل');
      process.exit(0);
    }

    // تشفير كلمة المرور
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    // إنشاء المستخدم
    const user = new User({
      username: 'admin',
      password: hashedPassword,
      connectedPlatforms: {}
    });

    await user.save();

    console.log('تم إنشاء المستخدم الافتراضي بنجاح');
    console.log('اسم المستخدم: admin');
    console.log('كلمة المرور: Admin@123');
    console.log('يرجى تغيير كلمة المرور بعد تسجيل الدخول لأول مرة');

    process.exit(0);
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم الافتراضي:', error);
    process.exit(1);
  }
}

// تشغيل الدالة
createDefaultUser();
