const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  connectedPlatforms: {
    twitter: {
      apiKey: String,
      apiSecret: String,
      accessToken: String,
      accessTokenSecret: String,
      connected: {
        type: Boolean,
        default: false
      },
      connectedAt: Date
    },
    facebook: {
      appId: String,
      appSecret: String,
      accessToken: String,
      connected: {
        type: Boolean,
        default: false
      },
      connectedAt: Date
    },
    instagram: {
      appId: String,
      appSecret: String,
      accessToken: String,
      connected: {
        type: Boolean,
        default: false
      },
      connectedAt: Date
    },
    linkedin: {
      clientId: String,
      clientSecret: String,
      accessToken: String,
      connected: {
        type: Boolean,
        default: false
      },
      connectedAt: Date
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// تشفير كلمة المرور قبل الحفظ
userSchema.pre('save', async function(next) {
  // فقط تشفير كلمة المرور إذا تم تعديلها
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// مقارنة كلمة المرور
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
