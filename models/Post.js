const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  platforms: [{
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'linkedin'],
    required: true
  }],
  platformPostIds: {
    twitter: String,
    facebook: String,
    instagram: String,
    linkedin: String
  },
  scheduledFor: {
    type: Date
  },
  publishedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft'
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  stats: {
    twitter: {
      likes: Number,
      retweets: Number,
      replies: Number,
      views: Number
    },
    facebook: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number
    },
    instagram: {
      likes: Number,
      comments: Number,
      views: Number
    },
    linkedin: {
      likes: Number,
      comments: Number,
      shares: Number,
      views: Number
    }
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
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
