const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// إنشاء جدولة جديدة
router.post('/', scheduleController.createSchedule);

// الحصول على جميع الجداول
router.get('/', scheduleController.getAllSchedules);

// الحصول على جدولة محددة
router.get('/:id', scheduleController.getScheduleById);

// تحديث جدولة
router.put('/:id', scheduleController.updateSchedule);

// حذف جدولة
router.delete('/:id', scheduleController.deleteSchedule);

// تنفيذ جدولة محددة يدويًا
router.post('/:id/execute', scheduleController.executeSchedule);

// تفعيل/تعطيل جدولة
router.patch('/:id/toggle', scheduleController.toggleSchedule);

module.exports = router;
