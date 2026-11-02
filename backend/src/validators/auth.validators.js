const ApiError = require('../utils/apiError');
const { isPlainObject, requireOptionalString, requireString } = require('./shared');

const ALLOWED_AUTH_ROLES = new Set(['customer', 'vendor_owner']);

const validateLoginPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.email, 'email');
  requireString(body.password, 'password');
};

const validateRegisterPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.email, 'email');
  requireString(body.password, 'password', { minLength: 8 });
  requireString(body.firstName, 'firstName');
  requireOptionalString(body.lastName, 'lastName', { maxLength: 120 });
  requireOptionalString(body.phone, 'phone', { maxLength: 40 });

  if (body.role && !ALLOWED_AUTH_ROLES.has(body.role)) {
    throw new ApiError('role must be customer or vendor_owner.', 400);
  }
};

const validateGoogleLoginPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.credential, 'credential');

  if (body.role && !ALLOWED_AUTH_ROLES.has(body.role)) {
    throw new ApiError('role must be customer or vendor_owner.', 400);
  }
};

const validateForgotPasswordPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.email, 'email');
};

const validateResetPasswordPayload = ({ body = {} } = {}) => {
  if (!isPlainObject(body)) {
    throw new ApiError('Request body must be an object.', 400);
  }

  requireString(body.email, 'email');
  requireString(body.code, 'code', { minLength: 6, maxLength: 6 });
  requireString(body.newPassword, 'newPassword', { minLength: 8 });
};

module.exports = {
  validateLoginPayload,
  validateRegisterPayload,
  validateGoogleLoginPayload,
  validateForgotPasswordPayload,
  validateResetPasswordPayload,
};