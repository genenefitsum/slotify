const mongoose = require('mongoose');

const BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'in_service',
  'completed',
  'cancelled',
  'no_show',
];

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
      maxlength: 40,
    },
    customerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
      index: true,
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true,
    },
    startsAtUtc: {
      type: Date,
      required: true,
      index: true,
    },
    endsAtUtc: {
      type: Date,
      required: true,
      index: true,
    },
    localTimezone: {
      type: String,
      required: true,
      maxlength: 80,
    },
    pricingSnapshot: {
      currency: {
        type: String,
        required: true,
        uppercase: true,
        minlength: 3,
        maxlength: 3,
      },
      servicePriceAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      depositAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      commissionAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      netPayableToVendor: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: 'pending_payment',
      index: true,
    },
    customerNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    cancellation: {
      cancelledAt: {
        type: Date,
        default: null,
      },
      cancelledByUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      reasonCode: {
        type: String,
        trim: true,
        maxlength: 80,
      },
      reasonText: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bookingSchema.path('endsAtUtc').validate(function validateTimeWindow(value) {
  return value > this.startsAtUtc;
}, 'Booking end time must be later than start time.');

bookingSchema.index({ vendorId: 1, startsAtUtc: 1, status: 1 });
bookingSchema.index({ customerUserId: 1, createdAt: -1 });
bookingSchema.index({ staffId: 1, startsAtUtc: 1, endsAtUtc: 1 });

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

module.exports = {
  Booking,
  BOOKING_STATUSES,
};
