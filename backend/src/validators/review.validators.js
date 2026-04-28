const ApiError = require('../utils/apiError');
const { isPlainObject, requireString, requireNumber, requireOptionalString } = require('./shared');

const validateCreateReviewPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.bookingId, 'bookingId');
  requireNumber(body.rating, 'rating', { min: 1, max: 5, integer: true });
  requireOptionalString(body.comment, 'comment', { maxLength: 2000 });
};

module.exports = {
  validateCreateReviewPayload,
};