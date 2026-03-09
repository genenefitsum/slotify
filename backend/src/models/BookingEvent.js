const mongoose = require('mongoose');

const BOOKING_EVENT_TYPES = [
  'booking_created',
  'payment_succeeded',
  'booking_confirmed',
  'booking_started',
  'booking_completed',
  'booking_cancelled',
  'booking_no_show',
  'refund_issued',
];

const bookingEventSchema = new mongoose.Schema(
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
    actorUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    eventType: {
      type: String,
      enum: BOOKING_EVENT_TYPES,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    occurredAt: {
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

bookingEventSchema.index({ bookingId: 1, occurredAt: 1 });

const BookingEvent =
  mongoose.models.BookingEvent || mongoose.model('BookingEvent', bookingEventSchema);

module.exports = {
  BookingEvent,
  BOOKING_EVENT_TYPES,
};
