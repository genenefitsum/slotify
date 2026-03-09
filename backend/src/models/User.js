const mongoose = require('mongoose');

const USER_ROLES = ['customer', 'vendor_owner', 'vendor_staff', 'admin'];
const USER_STATUSES = ['active', 'suspended', 'disabled'];
const AUTH_PROVIDERS = ['local', 'google'];

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    provider: {
      type: String,
      enum: AUTH_PROVIDERS,
      default: 'local',
      index: true,
    },
    googleId: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    passwordHash: {
      type: String,
      required() {
        return this.provider === 'local';
      },
      minlength: 20,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'customer',
      index: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'active',
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    phoneVerifiedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true, unique: true });
userSchema.index({ googleId: 1 }, { sparse: true, unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = {
  User,
  USER_ROLES,
  USER_STATUSES,
  AUTH_PROVIDERS,
};
