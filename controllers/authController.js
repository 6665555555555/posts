const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // التحقق من صحة البيانات
    if (!username || !password) {
      return res.status(400).json({ message: 'يجب توفير اسم المستخدم وكلمة المرور' });
    }

    // التحقق من قوة كلمة المرور
    if (password.length < 8) {
      return res.status(400).json({ message: 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'اسم المستخدم موجود بالفعل' });
    }

    // إنشاء المستخدم الجديد
    const user = new User({
      username,
      password,
      email: email || ''
    });

    await user.save();

    // إنشاء رمز JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // حفظ المستخدم في الجلسة
    req.session.user = {
      id: user._id,
      username: user.username,
      connectedPlatforms: user.connectedPlatforms
    };

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        connectedPlatforms: user.connectedPlatforms
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء الحساب:', error);
    res.status(500).json({ message: 'حدث خطأ في إنشاء الحساب', error: error.message });
  }
};

// تسجيل الدخول
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // التحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    // إنشاء رمز JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // حفظ المستخدم في الجلسة
    req.session.user = {
      id: user._id,
      username: user.username,
      connectedPlatforms: user.connectedPlatforms
    };

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        username: user.username,
        connectedPlatforms: user.connectedPlatforms
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'حدث خطأ في تسجيل الدخول', error: error.message });
  }
};

// تسجيل الخروج
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'حدث خطأ في تسجيل الخروج', error: err.message });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  });
};

// التحقق من حالة المصادقة
exports.checkAuth = (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.session.user.id,
        username: req.session.user.username,
        connectedPlatforms: req.session.user.connectedPlatforms
      }
    });
  } else {
    res.json({ authenticated: false });
  }
};

// ربط حساب Twitter
exports.connectTwitter = async (req, res) => {
  try {
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حفظ بيانات Twitter
    user.connectedPlatforms.twitter = {
      apiKey,
      apiSecret,
      accessToken,
      accessTokenSecret,
      connected: true,
      connectedAt: new Date()
    };

    await user.save();

    // تحديث الجلسة
    req.session.user.connectedPlatforms = user.connectedPlatforms;

    res.json({ message: 'تم ربط حساب Twitter بنجاح' });
  } catch (error) {
    console.error('خطأ في ربط حساب Twitter:', error);
    res.status(500).json({ message: 'حدث خطأ في ربط حساب Twitter', error: error.message });
  }
};

// ربط حساب Facebook
exports.connectFacebook = async (req, res) => {
  try {
    const { appId, appSecret, accessToken } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حفظ بيانات Facebook
    user.connectedPlatforms.facebook = {
      appId,
      appSecret,
      accessToken,
      connected: true,
      connectedAt: new Date()
    };

    await user.save();

    // تحديث الجلسة
    req.session.user.connectedPlatforms = user.connectedPlatforms;

    res.json({ message: 'تم ربط حساب Facebook بنجاح' });
  } catch (error) {
    console.error('خطأ في ربط حساب Facebook:', error);
    res.status(500).json({ message: 'حدث خطأ في ربط حساب Facebook', error: error.message });
  }
};

// ربط حساب Instagram
exports.connectInstagram = async (req, res) => {
  try {
    const { appId, appSecret, accessToken } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حفظ بيانات Instagram
    user.connectedPlatforms.instagram = {
      appId,
      appSecret,
      accessToken,
      connected: true,
      connectedAt: new Date()
    };

    await user.save();

    // تحديث الجلسة
    req.session.user.connectedPlatforms = user.connectedPlatforms;

    res.json({ message: 'تم ربط حساب Instagram بنجاح' });
  } catch (error) {
    console.error('خطأ في ربط حساب Instagram:', error);
    res.status(500).json({ message: 'حدث خطأ في ربط حساب Instagram', error: error.message });
  }
};

// ربط حساب LinkedIn
exports.connectLinkedIn = async (req, res) => {
  try {
    const { clientId, clientSecret, accessToken } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حفظ بيانات LinkedIn
    user.connectedPlatforms.linkedin = {
      clientId,
      clientSecret,
      accessToken,
      connected: true,
      connectedAt: new Date()
    };

    await user.save();

    // تحديث الجلسة
    req.session.user.connectedPlatforms = user.connectedPlatforms;

    res.json({ message: 'تم ربط حساب LinkedIn بنجاح' });
  } catch (error) {
    console.error('خطأ في ربط حساب LinkedIn:', error);
    res.status(500).json({ message: 'حدث خطأ في ربط حساب LinkedIn', error: error.message });
  }
};

// فصل حساب منصة التواصل الاجتماعي
exports.disconnectPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    const validPlatforms = ['twitter', 'facebook', 'instagram', 'linkedin'];

    if (!validPlatforms.includes(platform)) {
      return res.status(400).json({ message: 'منصة غير صالحة' });
    }

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // حذف بيانات المنصة
    delete user.connectedPlatforms[platform];

    await user.save();

    // تحديث الجلسة
    req.session.user.connectedPlatforms = user.connectedPlatforms;

    res.json({ message: `تم فصل حساب ${platform} بنجاح` });
  } catch (error) {
    console.error(`خطأ في فصل حساب ${req.params.platform}:`, error);
    res.status(500).json({ message: `حدث خطأ في فصل الحساب`, error: error.message });
  }
};
