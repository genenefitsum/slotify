const ApiError = require('../utils/apiError');
const { isPlainObject, requireString, requireOptionalString } = require('./shared');

const validateCreateBookingPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.serviceId, 'serviceId');
  requireString(body.startsAtUtc, 'startsAtUtc');
  requireOptionalString(body.staffId, 'staffId');
  requireOptionalString(body.customerNotes, 'customerNotes', { maxLength: 1000 });
};

const validateAvailableSlotsQuery = ({ query = {} } = {}) => {
  if (!isPlainObject(query)) {
    throw new ApiError('Request query must be an object.', 400);
  }

  requireString(query.vendorId, 'vendorId');
  requireString(query.serviceId, 'serviceId');
  requireString(query.localDate, 'localDate');
};

const validateCancelBookingPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireOptionalString(body.reasonCode, 'reasonCode', { maxLength: 80 });
  requireOptionalString(body.reasonText, 'reasonText', { maxLength: 500 });
};

const validateBookingIdParam = ({ params = {} } = {}) => {
  if (!isPlainObject(params)) {
    throw new ApiError('Request params must be an object.', 400);
  }

  requireString(params.id, 'id');
};

module.exports = {
  validateCreateBookingPayload,
  validateAvailableSlotsQuery,
  validateCancelBookingPayload,
  validateBookingIdParam,
};