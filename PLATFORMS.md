
# المنصات المطلوبة لعمل الموقع

## المنصات الأساسية (مطلوبة)

### 1. MongoDB
- **الغرض**: قاعدة البيانات لتخزين المستخدمين والمنشورات
- **الإصدار الموصى به**: 4.4 أو أحدث
- **التثبيت**: 
  - Windows: https://www.mongodb.com/try/download/community
  - Linux: `sudo apt-get install mongodb`
  - Mac: `brew install mongodb-community`

### 2. Node.js
- **الغرض**: تشغيل الخادم الخلفي
- **الإصدار الموصى به**: 14.x أو أحدث
- **التثبيت**: https://nodejs.org/

## منصات التواصل الاجتماعي (اختياري حسب الاستخدام)

### 1. Twitter (X)
- **الغرض**: النشر التلقائي للمنشورات
- **المفاتيح المطلوبة**:
  - API Key
  - API Secret
  - Access Token
  - Access Token Secret
- **الحصول على المفاتيح**: https://developer.twitter.com/

### 2. Facebook
- **الغرض**: النشر على صفحات فيسبوك
- **المفاتيح المطلوبة**:
  - App ID
  - App Secret
  - Access Token (مع صلاحيات pages_manage_posts, pages_read_engagement)
- **الحصول على المفاتيح**: https://developers.facebook.com/

### 3. Instagram
- **الغرض**: النشر على حسابات إنستغرام التجارية
- **المفاتيح المطلوبة**:
  - App ID
  - App Secret
  - Access Token (مع صلاحيات instagram_content_publish, instagram_basic)
- **الحصول على المفاتيح**: https://developers.facebook.com/

### 4. LinkedIn
- **الغرض**: النشر على ملفات لينكدإن الشخصية والصفحات
- **المفاتيح المطلوبة**:
  - Client ID
  - Client Secret
  - Access Token (مع صلاحيات w_member_social)
- **الحصول على المفاتيح**: https://www.linkedin.com/developers/

## المتطلبات الأخرى

### 1. متصفح حديث
- Chrome (الإصدار 90 أو أحدث)
- Firefox (الإصدار 88 أو أحدث)
- Safari (الإصدار 14 أو أحدث)
- Edge (الإصدار 90 أو أحدث)

### 2. مكتبات Node.js المطلوبة
- express
- mongoose
- axios
- twitter-api-v2
- dotenv
- cors
- body-parser
- express-session
- helmet
- express-rate-limit

## خطوات الإعداد

1. تثبيت Node.js و MongoDB
2. استنساخ المشروع
3. تثبيت المكتبات: `npm install`
4. إنشاء ملف `.env` بناءً على `.env.example`
5. إضافة مفاتيح API للمنصات المطلوبة
6. تشغيل MongoDB
7. تشغيل الخادم: `npm start`
