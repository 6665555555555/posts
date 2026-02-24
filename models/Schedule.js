const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  cronExpression: {
    type: String,
    required: true
  },
  platforms: [{
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
    required: true
  }],
  active: {
    type: Boolean,
    default: true
  },
  nextRun: {
    type: Date
  },
  lastRun: {
    type: Date
  },
  runCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// تحديث تاريخ التعديل قبل الحفظ
scheduleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;
