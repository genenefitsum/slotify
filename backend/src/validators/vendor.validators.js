const ApiError = require('../utils/apiError');
const {
  isPlainObject,
  requireString,
  requireOptionalString,
  requireOptionalArray,
} = require('./shared');

const MAX_VENDOR_IMAGE_COUNT = 5;

const validateCreateVendorPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.displayName, 'displayName');

  if (!isPlainObject(body.location)) {
    throw new ApiError('location must be an object.', 400);
  }

  requireString(body.location.countryCode, 'location.countryCode');
  requireString(body.location.city, 'location.city');
  requireOptionalString(body.description, 'description', { maxLength: 5000 });
  requireOptionalString(body.legalBusinessName, 'legalBusinessName', { maxLength: 255 });
  requireOptionalArray(body.images, 'images', { maxLength: MAX_VENDOR_IMAGE_COUNT });
};

const validateUpdateVendorPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireOptionalString(body.displayName, 'displayName', { maxLength: 255 });

  if (body.location !== undefined) {
    if (!isPlainObject(body.location)) {
      throw new ApiError('location must be an object.', 400);
    }

    if (body.location.countryCode !== undefined) {
      requireString(body.location.countryCode, 'location.countryCode');
    }

    if (body.location.city !== undefined) {
      requireString(body.location.city, 'location.city');
    }
  }

  requireOptionalString(body.description, 'description', { maxLength: 5000 });
  requireOptionalString(body.legalBusinessName, 'legalBusinessName', { maxLength: 255 });
  requireOptionalArray(body.images, 'images', { maxLength: MAX_VENDOR_IMAGE_COUNT });
};

const validateResolveMapLinkPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.link, 'link');
};

module.exports = {
  validateCreateVendorPayload,
  validateUpdateVendorPayload,
  validateResolveMapLinkPayload,
};