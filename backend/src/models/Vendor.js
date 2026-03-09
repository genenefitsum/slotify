const mongoose = require('mongoose');

const VENDOR_STATUSES = ['draft', 'pending_verification', 'active', 'suspended'];

const vendorSchema = new mongoose.Schema(
  {
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    legalBusinessName: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000,
    },
    categories: {
      type: [String],
      default: [],
      index: true,
    },
    timezone: {
      type: String,
      required: true,
      default: 'UTC',
      maxlength: 80,
    },
    location: {
      countryCode: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 2,
        maxlength: 2,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
      },
      addressLine1: {
        type: String,
        trim: true,
        maxlength: 255,
      },
      addressLine2: {
        type: String,
        trim: true,
        maxlength: 255,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          default: [0, 0],
        },
      },
    },
    payoutSettings: {
      beneficiaryName: {
        type: String,
        trim: true,
        maxlength: 160,
      },
      accountLast4: {
        type: String,
        trim: true,
        maxlength: 4,
      },
      payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'mobile_money'],
        default: 'bank_transfer',
      },
      payoutsEnabled: {
        type: Boolean,
        default: false,
      },
    },
    commissionPlanCode: {
      type: String,
      default: 'default',
      trim: true,
      maxlength: 80,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: VENDOR_STATUSES,
      default: 'draft',
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

vendorSchema.index({ 'location.coordinates': '2dsphere' });
vendorSchema.index({ status: 1, categories: 1, 'location.city': 1 });

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);

module.exports = {
  Vendor,
  VENDOR_STATUSES,
};
