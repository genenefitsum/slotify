const ApiError = require('../utils/apiError');
const {
  isPlainObject,
  requireString,
  requireOptionalString,
  requireOptionalArray,
  requireNumber,
} = require('./shared');

const ALLOWED_DEPOSIT_TYPES = new Set(['none', 'fixed', 'percentage']);
const MAX_SERVICE_IMAGE_COUNT = 5;

const validateCreateServicePayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.name, 'name', { maxLength: 140 });
  requireNumber(body.durationMinutes, 'durationMinutes', { min: 5, max: 1440, integer: true });
  requireNumber(body.priceAmount, 'priceAmount', { min: 0 });
  requireString(body.currency, 'currency', { minLength: 3, maxLength: 3 });
  requireOptionalString(body.description, 'description', { maxLength: 2000 });
  requireOptionalArray(body.images, 'images', { maxLength: MAX_SERVICE_IMAGE_COUNT });

  if (body.bufferBeforeMinutes !== undefined) {
    requireNumber(body.bufferBeforeMinutes, 'bufferBeforeMinutes', { min: 0, max: 240, integer: true });
  }

  if (body.bufferAfterMinutes !== undefined) {
    requireNumber(body.bufferAfterMinutes, 'bufferAfterMinutes', { min: 0, max: 240, integer: true });
  }

  if (body.depositType !== undefined && !ALLOWED_DEPOSIT_TYPES.has(body.depositType)) {
    throw new ApiError('depositType must be one of none, fixed, or percentage.', 400);
  }

  if (body.depositValue !== undefined) {
    requireNumber(body.depositValue, 'depositValue', { min: 0 });
  }
};

const validateUpdateServicePayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireOptionalString(body.name, 'name', { maxLength: 140 });
  requireOptionalString(body.description, 'description', { maxLength: 2000 });

  if (body.durationMinutes !== undefined) {
    requireNumber(body.durationMinutes, 'durationMinutes', { min: 5, max: 1440, integer: true });
  }

  if (body.bufferBeforeMinutes !== undefined) {
    requireNumber(body.bufferBeforeMinutes, 'bufferBeforeMinutes', { min: 0, max: 240, integer: true });
  }

  if (body.bufferAfterMinutes !== undefined) {
    requireNumber(body.bufferAfterMinutes, 'bufferAfterMinutes', { min: 0, max: 240, integer: true });
  }

  if (body.priceAmount !== undefined) {
    requireNumber(body.priceAmount, 'priceAmount', { min: 0 });
  }

  if (body.currency !== undefined) {
    requireString(body.currency, 'currency', { minLength: 3, maxLength: 3 });
  }

  if (body.depositType !== undefined && !ALLOWED_DEPOSIT_TYPES.has(body.depositType)) {
    throw new ApiError('depositType must be one of none, fixed, or percentage.', 400);
  }

  if (body.depositValue !== undefined) {
    requireNumber(body.depositValue, 'depositValue', { min: 0 });
  }

  requireOptionalArray(body.images, 'images', { maxLength: MAX_SERVICE_IMAGE_COUNT });
};

module.exports = {
  validateCreateServicePayload,
  validateUpdateServicePayload,
};