const Post = require('../models/Post');
const User = require('../models/User');
const path = require('path');

// إنشاء منشور جديد
exports.createPost = async (req, res) => {
  try {
    const { content, platforms, scheduledFor } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    // التحقق من صحة البيانات
    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'يجب توفير محتوى للمنشور أو صورة' });
    }

    if (!platforms || platforms.length === 0) {
      return res.status(400).json({ message: 'يجب تحديد منصة واحدة على الأقل للنشر' });
    }

    const user = await User.findById(req.session.user.id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // التحقق من اتصال المنصات
    const disconnectedPlatforms = platforms.filter(
      p => !user.connectedPlatforms[p] || !user.connectedPlatforms[p].connected
    );

    if (disconnectedPlatforms.length > 0) {
      return res.status(400).json({ 
        message: 'بعض المنصات غير متصلة',
        disconnectedPlatforms
      });
    }

    // إنشاء المنشور
    const newPost = new Post({
      userId: user._id,
      content,
      imageUrl,
      platforms,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      status: scheduledFor ? 'scheduled' : 'draft'
    });

    await newPost.save();

    res.status(201).json({
      message: 'تم إنشاء المنشور بنجاح',
      post: newPost
    });
  } catch (error) {
    console.error('خطأ في إنشاء المنشور:', error);
    res.status(500).json({ message: 'حدث خطأ في إنشاء المنشور', error: error.message });
  }
};

// الحصول على جميع المنشورات
exports.getAllPosts = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const { status, platform, limit = 20, offset = 0 } = req.query;

    // بناء استعلام البحث
    const query = { userId: req.session.user.id };

    if (status) {
      query.status = status;
    }

    if (platform) {
      query.platforms = platform;
    }

    // الحصول على المنشورات
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // الحصول على العدد الإجمالي
    const count = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على المنشورات:', error);
    res.status(500).json({ message: 'حدث خطأ في الحصول على المنشورات', error: error.message });
  }
};

// الحصول على منشور محدد
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const post = await Post.findOne({ _id: id, userId: req.session.user.id });

    if (!post) {
      return res.status(404).json({ message: 'المنشور غير موجود' });
    }

    res.json({ post });
  } catch (error) {
    console.error('خطأ في الحصول على المنشور:', error);
    res.status(500).json({ message: 'حدث خطأ في الحصول على المنشور', error: error.message });
  }
};

// تحديث منشور
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, platforms, scheduledFor } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const post = await Post.findOne({ _id: id, userId: req.session.user.id });

    if (!post) {
      return res.status(404).json({ message: 'المنشور غير موجود' });
    }

    // التحقق من أن المنشور لم يتم نشره بعد
    if (post.status === 'published') {
      return res.status(400).json({ message: 'لا يمكن تعديل منشور تم نشره بالفعل' });
    }

    // تحديث بيانات المنشور
    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;
    if (platforms) {
      const user = await User.findById(req.session.user.id);

      // التحقق من اتصال المنصات
      const disconnectedPlatforms = platforms.filter(
        p => !user.connectedPlatforms[p] || !user.connectedPlatforms[p].connected
      );

      if (disconnectedPlatforms.length > 0) {
        return res.status(400).json({ 
          message: 'بعض المنصات غير متصلة',
          disconnectedPlatforms
        });
      }

      post.platforms = platforms;
    }
    if (scheduledFor !== undefined) {
      post.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
      post.status = scheduledFor ? 'scheduled' : 'draft';
    }

    await post.save();

    res.json({
      message: 'تم تحديث المنشور بنجاح',
      post
    });
  } catch (error) {
    console.error('خطأ في تحديث المنشور:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث المنشور', error: error.message });
  }
};

// حذف منشور
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const post = await Post.findOne({ _id: id, userId: req.session.user.id });

    if (!post) {
      return res.status(404).json({ message: 'المنشور غير موجود' });
    }

    // حذف المنشور
    await Post.findByIdAndDelete(id);

    res.json({ message: 'تم حذف المنشور بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف المنشور:', error);
    res.status(500).json({ message: 'حدث خطأ في حذف المنشور', error: error.message });
  }
};

// نشر منشور محفوظ
exports.publishSavedPost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const post = await Post.findOne({ _id: id, userId: req.session.user.id });

    if (!post) {
      return res.status(404).json({ message: 'المنشور غير موجود' });
    }

    // التحقق من أن المنشور لم يتم نشره بعد
    if (post.status === 'published') {
      return res.status(400).json({ message: 'تم نشر هذا المنشور بالفعل' });
    }

    // استيراد دالة النشر المتعدد
    const { publishToMultiplePlatforms } = require('./socialMediaController');

    // نشر المنشور على المنصات المحددة
    const result = await publishToMultiplePlatforms({
      session: req.session,
      body: {
        platforms: post.platforms,
        content: post.content,
        imageUrl: post.imageUrl
      }
    }, {
      json: (data) => data
    });

    // تحديث حالة المنشور
    post.status = 'published';
    post.publishedAt = new Date();
    post.platformPostIds = result.platformPostIds;

    await post.save();

    res.json({
      message: 'تم نشر المنشور بنجاح',
      post,
      result
    });
  } catch (error) {
    console.error('خطأ في نشر المنشور المحفوظ:', error);
    res.status(500).json({ message: 'حدث خطأ في نشر المنشور المحفوظ', error: error.message });
  }
};
