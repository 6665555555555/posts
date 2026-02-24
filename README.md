# منصة النشر التلقائي على وسائل التواصل الاجتماعي

تطبيق ويب متكامل للنشر التلقائي على منصات التواصل الاجتماعي المختلفة مثل Twitter و Facebook و Instagram و LinkedIn.

## المميزات

- النشر التلقائي على منصات التواصل الاجتماعي المتعددة
- جدولة المنشورات للنشر في أوقات محددة
- إدارة المنشورات المحفوظة
- متابعة حالة الاتصال بمنصات التواصل الاجتماعي
- عرض إحصائيات المنشورات على كل منصة
- واجهة مستخدم حديثة وسهلة الاستخدام

## المتطلبات

- Node.js (الإصدار 14 أو أحدث)
- MongoDB (الإصدار 4.4 أو أحدث)
- حسابات مطور على منصات التواصل الاجتماعي المطلوبة

## التثبيت

1. استنساخ المستودع:
```bash
git clone https://github.com/yourusername/social-media-auto-publisher.git
cd social-media-auto-publisher
```

2. تثبيت التبعيات:
```bash
npm install
```

3. إنشاء ملف `.env` بناءً على ملف `.env.example`:
```bash
cp .env.example .env
```

4. تحديث المتغيرات البيئية في ملف `.env`:
```
# إعدادات الخادم
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# مفتاح الجلسة
SESSION_SECRET=your-secret-key-change-this-in-production

# إعدادات قاعدة البيانات (MongoDB)
MONGODB_URI=mongodb://localhost:27017/social-media-auto-publisher

# مفتاح JWT
JWT_SECRET=your-jwt-secret-change-this-in-production

# إعدادات Twitter API
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret

# إعدادات Facebook API
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_ACCESS_TOKEN=your-facebook-access-token

# إعدادات Instagram API
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token

# إعدادات LinkedIn API
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_ACCESS_TOKEN=your-linkedin-access-token
```

## الحصول على مفاتيح API

### Twitter
1. قم بإنشاء حساب مطور على Twitter: https://developer.twitter.com/
2. أنشئ تطبيقًا جديدًا في لوحة التحكم
3. احصل على مفتاح API ومفتاح API السري
4. أنشئ رمز وصول ورمز وصول سري

### Facebook
1. قم بإنشاء حساب مطور على Facebook: https://developers.facebook.com/
2. أنشئ تطبيقًا جديدًا في لوحة التحكم
3. احصل على معرف التطبيق ومفتاح التطبيق السري
4. احصل على رمز الوصول من صفحة أدوات Graph API

### Instagram
1. قم بإنشاء حساب مطور على Facebook: https://developers.facebook.com/
2. أنشئ تطبيقًا جديدًا في لوحة التحكم
3. أضف منتج Instagram Graph API
4. احصل على معرف التطبيق ومفتاح التطبيق السري
5. احصل على رمز الوصول من صفحة أدوات Graph API

### LinkedIn
1. قم بإنشاء حساب مطور على LinkedIn: https://www.linkedin.com/developers/
2. أنشئ تطبيقًا جديدًا في لوحة التحكم
3. احصل على معرف العميل ومفتاح العميل السري
4. احصل على رمز الوصول من صفحة OAuth 2.0

## التشغيل

1. تأكد من تشغيل MongoDB:
```bash
# على Windows
net start MongoDB

# على Linux/Mac
sudo systemctl start mongod
```

2. ابدأ الخادم:
```bash
npm start
```

3. افتح المتصفح وانتقل إلى: http://localhost:3000

## الاستخدام

1. سجل الدخول إلى التطبيق باستخدام اسم المستخدم وكلمة المرور
2. اتصل بحساباتك على منصات التواصل الاجتماعي
3. أنشئ منشورًا جديدًا وحدد المنصات التي تريد النشر عليها
4. يمكنك نشر المنشور فورًا أو جدولته لوقت لاحق
5. تابع منشوراتك وإحصائياتها من لوحة التحكم

## هيكل المشروع

```
social-media-auto-publisher/
├── config/
│   └── database.js          # إعدادات قاعدة البيانات
├── controllers/
│   ├── authController.js    # التحكم في المصادقة
│   ├── postController.js    # التحكم في المنشورات
│   ├── scheduleController.js # التحكم في الجدولة
│   └── socialMediaController.js # التحكم في منصات التواصل
├── models/
│   ├── User.js              # نموذج المستخدم
│   ├── Post.js              # نموذج المنشور
│   └── Schedule.js          # نموذج الجدولة
├── public/
│   ├── css/
│   │   └── style.css        # أنماط الواجهة الأمامية
│   ├── js/
│   │   └── app.js           # كود JavaScript للواجهة الأمامية
│   └── index.html            # الصفحة الرئيسية
├── routes/
│   ├── auth.js              # مسارات المصادقة
│   ├── posts.js             # مسارات المنشورات
│   ├── schedules.js         # مسارات الجدولة
│   └── socialMedia.js       # مسارات منصات التواصل
├── uploads/                 # مجلد لرفع الصور
├── .env.example             # مثال على ملف البيئة
├── package.json             # إدارة الحزم
├── server.js                # ملف الخادم الرئيسي
└── README.md                # ملف التعليمات
```

## المساهمة

نرحب بالمساهمات! إذا كنت ترغب في المساهمة في هذا المشروع، يرجى:
1. عمل fork للمستودع
2. إنشاء فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. تنفيذ التغييرات المطلوبة
4. رفع التغييرات (`git commit -m 'Add some AmazingFeature'`)
5. دفع الفرع (`git push origin feature/AmazingFeature`)
6. فتح طلب سحب (Pull Request)

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف LICENSE للتفاصيل

## الدعم

إذا واجهت أي مشاكل أو كان لديك أي أسئلة، يرجى فتح issue في المستودع.
