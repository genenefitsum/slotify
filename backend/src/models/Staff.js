const mongoose = require('mongoose');

const STAFF_STATUSES = ['active', 'inactive'];

const staffSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    linkedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    skills: {
      type: [String],
      default: [],
    },
    maxConcurrentBookings: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },
    status: {
      type: String,
      enum: STAFF_STATUSES,
      default: 'active',
      index: true,
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

staffSchema.index({ vendorId: 1, status: 1, fullName: 1 });
staffSchema.index({ vendorId: 1, email: 1 }, { sparse: true, unique: true });

const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);

module.exports = {
  Staff,
  STAFF_STATUSES,
};
