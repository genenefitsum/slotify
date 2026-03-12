const ApiError = require('../utils/apiError');
const reviewService = require('../services/review.service');

const listReviews = async (req, res, next) => {
  try {
    const data = await reviewService.listByVendor(req.params.vendorId);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const validateCreateReviewPayload = (payload = {}) => {
  if (!payload.bookingId) {
    throw new ApiError('bookingId is required.', 400);
  }

  if (payload.rating === undefined || payload.rating === null || payload.rating === '') {
    throw new ApiError('rating is required.', 400);
  }
};

const createReview = async (req, res, next) => {
  try {
    validateCreateReviewPayload(req.body);
    const data = await reviewService.createForVendor(req.user, req.params.vendorId, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = { listReviews, createReview };
