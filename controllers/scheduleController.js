const Schedule = require('../models/Schedule');
const Post = require('../models/Post');
const User = require('../models/User');
const cron = require('node-cron');
const { publishToMultiplePlatforms } = require('./socialMediaController');

// تخزين المهام المجدولة
const scheduledTasks = {};

// إنشاء جدولة جديدة
exports.createSchedule = async (req, res) => {
  try {
    const { postId, cronExpression, platforms } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    // التحقق من صحة البيانات
    if (!postId) {
      return res.status(400).json({ message: 'يجب تحديد معرف المنشور' });
    }

    if (!cronExpression) {
      return res.status(400).json({ message: 'يجب تحديد تعبير Cron' });
    }

    // التحقق من صحة تعبير Cron
    if (!cron.validate(cronExpression)) {
      return res.status(400).json({ message: 'تعبير Cron غير صالح' });
    }

    // الحصول على المنشور
    const post = await Post.findOne({ _id: postId, userId: req.session.user.id });

    if (!post) {
      return res.status(404).json({ message: 'المنشور غير موجود' });
    }

    // التحقق من اتصال المنصات
    const user = await User.findById(req.session.user.id);
    const platformsToUse = platforms || post.platforms;

    const disconnectedPlatforms = platformsToUse.filter(
      p => !user.connectedPlatforms[p] || !user.connectedPlatforms[p].connected
    );

    if (disconnectedPlatforms.length > 0) {
      return res.status(400).json({ 
        message: 'بعض المنصات غير متصلة',
        disconnectedPlatforms
      });
    }

    // إنشاء الجدولة
    const newSchedule = new Schedule({
      userId: req.session.user.id,
      postId,
      cronExpression,
      platforms: platformsToUse,
      active: true,
      nextRun: getNextRunDate(cronExpression),
      lastRun: null
    });

    await newSchedule.save();

    // بدء مهمة الجدولة
    startScheduledTask(newSchedule._id, cronExpression, postId, platformsToUse, req.session.user.id);

    res.status(201).json({
      message: 'تم إنشاء الجدولة بنجاح',
      schedule: newSchedule
    });
  } catch (error) {
    console.error('خطأ في إنشاء الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في إنشاء الجدولة', error: error.message });
  }
};

// الحصول على جميع الجداول
exports.getAllSchedules = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const { active, limit = 20, offset = 0 } = req.query;

    // بناء استعلام البحث
    const query = { userId: req.session.user.id };

    if (active !== undefined) {
      query.active = active === 'true';
    }

    // الحصول على الجداول
    const schedules = await Schedule.find(query)
      .populate('postId')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    // الحصول على العدد الإجمالي
    const count = await Schedule.countDocuments(query);

    res.json({
      schedules,
      pagination: {
        total: count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على الجداول:', error);
    res.status(500).json({ message: 'حدث خطأ في الحصول على الجداول', error: error.message });
  }
};

// الحصول على جدولة محددة
exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.session.user.id })
      .populate('postId');

    if (!schedule) {
      return res.status(404).json({ message: 'الجدولة غير موجودة' });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('خطأ في الحصول على الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في الحصول على الجدولة', error: error.message });
  }
};

// تحديث جدولة
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { cronExpression, platforms } = req.body;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.session.user.id });

    if (!schedule) {
      return res.status(404).json({ message: 'الجدولة غير موجودة' });
    }

    // تحديث بيانات الجدولة
    if (cronExpression) {
      // التحقق من صحة تعبير Cron
      if (!cron.validate(cronExpression)) {
        return res.status(400).json({ message: 'تعبير Cron غير صالح' });
      }

      schedule.cronExpression = cronExpression;
      schedule.nextRun = getNextRunDate(cronExpression);
    }

    if (platforms) {
      // التحقق من اتصال المنصات
      const user = await User.findById(req.session.user.id);
      const disconnectedPlatforms = platforms.filter(
        p => !user.connectedPlatforms[p] || !user.connectedPlatforms[p].connected
      );

      if (disconnectedPlatforms.length > 0) {
        return res.status(400).json({ 
          message: 'بعض المنصات غير متصلة',
          disconnectedPlatforms
        });
      }

      schedule.platforms = platforms;
    }

    await schedule.save();

    // إيقاف وإعادة تشغيل المهمة المجدولة إذا كانت نشطة
    if (schedule.active && scheduledTasks[id]) {
      scheduledTasks[id].stop();
      startScheduledTask(id, schedule.cronExpression, schedule.postId, schedule.platforms, req.session.user.id);
    }

    res.json({
      message: 'تم تحديث الجدولة بنجاح',
      schedule
    });
  } catch (error) {
    console.error('خطأ في تحديث الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في تحديث الجدولة', error: error.message });
  }
};

// حذف جدولة
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.session.user.id });

    if (!schedule) {
      return res.status(404).json({ message: 'الجدولة غير موجودة' });
    }

    // إيقاف المهمة المجدولة إذا كانت نشطة
    if (scheduledTasks[id]) {
      scheduledTasks[id].stop();
      delete scheduledTasks[id];
    }

    // حذف الجدولة
    await Schedule.findByIdAndDelete(id);

    res.json({ message: 'تم حذف الجدولة بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في حذف الجدولة', error: error.message });
  }
};

// تنفيذ جدولة محددة يدويًا
exports.executeSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.session.user.id })
      .populate('postId');

    if (!schedule) {
      return res.status(404).json({ message: 'الجدولة غير موجودة' });
    }

    // تنفيذ الجدولة
    const result = await executeScheduledTask(schedule, req.session.user.id);

    // تحديث وقت آخر تنفيذ
    schedule.lastRun = new Date();
    schedule.nextRun = getNextRunDate(schedule.cronExpression);
    await schedule.save();

    res.json({
      message: 'تم تنفيذ الجدولة بنجاح',
      schedule,
      result
    });
  } catch (error) {
    console.error('خطأ في تنفيذ الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في تنفيذ الجدولة', error: error.message });
  }
};

// تفعيل/تعطيل جدولة
exports.toggleSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });
    }

    const schedule = await Schedule.findOne({ _id: id, userId: req.session.user.id })
      .populate('postId');

    if (!schedule) {
      return res.status(404).json({ message: 'الجدولة غير موجودة' });
    }

    // تبديل حالة الجدولة
    schedule.active = !schedule.active;

    if (schedule.active) {
      // بدء المهمة المجدولة
      startScheduledTask(id, schedule.cronExpression, schedule.postId, schedule.platforms, req.session.user.id);
    } else {
      // إيقاف المهمة المجدولة
      if (scheduledTasks[id]) {
        scheduledTasks[id].stop();
        delete scheduledTasks[id];
      }
    }

    await schedule.save();

    res.json({
      message: `تم ${schedule.active ? 'تفعيل' : 'تعطيل'} الجدولة بنجاح`,
      schedule
    });
  } catch (error) {
    console.error('خطأ في تبديل حالة الجدولة:', error);
    res.status(500).json({ message: 'حدث خطأ في تبديل حالة الجدولة', error: error.message });
  }
};

// بدء مهمة مجدولة
function startScheduledTask(scheduleId, cronExpression, postId, platforms, userId) {
  // إيقاف المهمة القديمة إذا وجدت
  if (scheduledTasks[scheduleId]) {
    scheduledTasks[scheduleId].stop();
  }

  // إنشاء مهمة جديدة
  const task = cron.schedule(cronExpression, async () => {
    try {
      // الحصول على الجدولة والمنشور
      const schedule = await Schedule.findById(scheduleId).populate('postId');

      if (!schedule || !schedule.active) {
        // إيقاف المهمة إذا تم حذف الجدولة أو تعطيلها
        task.stop();
        delete scheduledTasks[scheduleId];
        return;
      }

      // تنفيذ المهمة المجدولة
      await executeScheduledTask(schedule, userId);

      // تحديث وقت آخر تنفيذ والتالي
      schedule.lastRun = new Date();
      schedule.nextRun = getNextRunDate(schedule.cronExpression);
      await schedule.save();
    } catch (error) {
      console.error(`خطأ في تنفيذ المهمة المجدولة ${scheduleId}:`, error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Riyadh'
  });

  // حفظ المهمة
  scheduledTasks[scheduleId] = task;
}

// تنفيذ مهمة مجدولة
async function executeScheduledTask(schedule, userId) {
  try {
    // الحصول على المنشور
    const post = await Post.findById(schedule.postId);

    if (!post) {
      throw new Error('المنشور غير موجود');
    }

    // الحصول على المستخدم
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    // نشر المنشور على المنصات المحددة
    const result = await publishToMultiplePlatforms({
      session: { user: { id: userId } },
      body: {
        platforms: schedule.platforms,
        content: post.content,
        imageUrl: post.imageUrl
      }
    }, {
      json: (data) => data
    });

    // إنشاء سجل للمنشور المنشور
    const newPost = new Post({
      userId,
      content: post.content,
      imageUrl: post.imageUrl,
      platforms: schedule.platforms,
      platformPostIds: result.platformPostIds,
      publishedAt: new Date(),
      status: 'published',
      scheduleId: schedule._id
    });

    await newPost.save();

    return result;
  } catch (error) {
    console.error('خطأ في تنفيذ المهمة المجدولة:', error);
    throw error;
  }
}

// الحصول على تاريخ التشغيل التالي
function getNextRunDate(cronExpression) {
  try {
    // استخدام مكتبة node-cron لحساب التاريخ التالي
    const task = cron.schedule(cronExpression, () => {}, { scheduled: false });
    const nextDate = task.getNextDate();
    return nextDate;
  } catch (error) {
    console.error('خطأ في حساب تاريخ التشغيل التالي:', error);
    return null;
  }
}
