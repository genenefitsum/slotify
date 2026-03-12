const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const { Booking } = require('../models/Booking');
const { Review } = require('../models/Review');
const { Vendor } = require('../models/Vendor');

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
};

const toReviewDto = (doc) => ({
  id: String(doc._id),
  bookingId: String(doc.bookingId),
  customerUserId: String(doc.customerUserId),
  vendorId: String(doc.vendorId),
  staffId: doc.staffId ? String(doc.staffId) : null,
  rating: doc.rating,
  comment: doc.comment || '',
  status: doc.status,
  moderationNotes: doc.moderationNotes || '',
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const recalculateVendorRating = async (vendorId) => {
  const reviews = await Review.find({
    vendorId,
    status: 'published',
  })
    .select({ rating: 1 })
    .lean();

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;

  await Vendor.updateOne(
    { _id: vendorId, deletedAt: null },
    {
      $set: {
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount,
      },
    }
  );
};

const listByVendor = async (vendorId) => {
  ensureObjectId(vendorId, 'vendor id');

  const items = await Review.find({
    vendorId,
    status: 'published',
  })
    .sort({ createdAt: -1 })
    .lean();

  return items.map(toReviewDto);
};

const createForVendor = async (actor, vendorId, payload) => {
  ensureObjectId(vendorId, 'vendor id');
  ensureObjectId(payload.bookingId, 'booking id');

  const numericRating = Number(payload.rating);
  if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new ApiError('rating must be a number between 1 and 5.', 400);
  }

  const [vendor, booking] = await Promise.all([
    Vendor.findOne({ _id: vendorId, deletedAt: null }).lean(),
    Booking.findById(payload.bookingId).lean(),
  ]);

  if (!vendor) {
    throw new ApiError('Vendor not found.', 404);
  }

  if (!booking) {
    throw new ApiError('Booking not found.', 404);
  }

  if (String(booking.vendorId) !== vendorId) {
    throw new ApiError('Booking does not belong to this vendor.', 400);
  }

  if (booking.status !== 'completed') {
    throw new ApiError('Only completed bookings can be reviewed.', 409);
  }

  if (actor.role === 'customer' && String(booking.customerUserId) !== actor.id) {
    throw new ApiError('You can only review your own completed bookings.', 403);
  }

  const review = await Review.create({
    bookingId: booking._id,
    customerUserId: actor.id,
    vendorId,
    staffId: booking.staffId || null,
    rating: numericRating,
    comment: payload.comment || undefined,
    status: 'published',
  });

  await recalculateVendorRating(vendorId);

  return toReviewDto(review);
};

module.exports = {
  listByVendor,
  createForVendor,
};
