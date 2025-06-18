// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  authProvider: {
    type: String,
    enum: ['google', 'facebook', 'apple'],
    required: true
  },
  passwordHash: {
    type: String,
    select: false
  },
  avatar: {
    type: String,
    default: 'https://cdn.vireal.com/default-avatar.png'
  },
  banner: {
    type: String,
    default: 'https://cdn.vireal.com/default-banner.jpg'
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // Progression system
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 100
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  nextLevelXP: {
    type: Number,
    default: 1000
  },

  // Social connections
  followers: {
    type: Number,
    default: 0,
    min: 0
  },
  following: {
    type: Number,
    default: 0,
    min: 0
  },

  // References to other collections
  titleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Title'
  }],
  clanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clan'
  },
  roleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  }],
  organizationMemberships: [{
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    rank: String
  }],
  communityMemberships: [{
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  postIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  notificationIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],

  // Settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ clanId: 1 });
userSchema.index({ level: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method to get safe user data (without sensitive info)
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  
  // Remove sensitive data
  delete userObject.passwordHash;
  delete userObject.__v;
  
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;