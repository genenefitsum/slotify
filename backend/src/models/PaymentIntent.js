const mongoose = require('mongoose');

const PAYMENT_INTENT_STATUSES = [
  'created',
  'requires_action',
  'processing',
  'succeeded',
  'failed',
  'expired',
];

const paymentIntentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    customerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: PAYMENT_INTENT_STATUSES,
      required: true,
      default: 'created',
      index: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    providerPaymentIntentId: {
      type: String,
      trim: true,
      maxlength: 120,
      index: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
      unique: true,
      index: true,
    },
    failureCode: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    failureMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
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

paymentIntentSchema.index({ bookingId: 1, createdAt: -1 });

const PaymentIntent =
  mongoose.models.PaymentIntent || mongoose.model('PaymentIntent', paymentIntentSchema);

module.exports = {
  PaymentIntent,
  PAYMENT_INTENT_STATUSES,
};
