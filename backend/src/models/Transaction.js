const mongoose = require('mongoose');

const TRANSACTION_TYPES = [
  'deposit_charge',
  'platform_fee_accrual',
  'vendor_payable_accrual',
  'refund',
  'payout',
];

const TRANSACTION_DIRECTIONS = ['debit', 'credit'];

const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true,
    },
    paymentIntentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PaymentIntent',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: TRANSACTION_DIRECTIONS,
      required: true,
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
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    externalReference: {
      type: String,
      trim: true,
      maxlength: 140,
      index: true,
    },
    postedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

transactionSchema.index({ vendorId: 1, type: 1, postedAt: -1 });
transactionSchema.index({ bookingId: 1, type: 1, createdAt: -1 });

const Transaction =
  mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

module.exports = {
  Transaction,
  TRANSACTION_TYPES,
  TRANSACTION_DIRECTIONS,
};
