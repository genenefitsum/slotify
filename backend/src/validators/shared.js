const ApiError = require('../utils/apiError');

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const requireString = (value, label, { minLength = 1, maxLength } = {}) => {
  if (typeof value !== 'string') {
    throw new ApiError(`${label} must be a string.`, 400);
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length < minLength) {
    throw new ApiError(`${label} is required.`, 400);
  }

  if (typeof maxLength === 'number' && normalizedValue.length > maxLength) {
    throw new ApiError(`${label} must be ${maxLength} characters or fewer.`, 400);
  }

  return normalizedValue;
};

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';

// Passwords are checked on the raw value (no trimming) so leading/trailing
// spaces are treated as legitimate characters, matching what gets hashed.
const requirePassword = (value, label = 'password') => {
  if (typeof value !== 'string') {
    throw new ApiError(`${label} must be a string.`, 400);
  }

  const isStrong =
    value.length >= PASSWORD_MIN_LENGTH &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /[0-9]/.test(value);

  if (!isStrong) {
    throw new ApiError(PASSWORD_POLICY_MESSAGE, 400);
  }

  return value;
};

const requireOptionalString = (value, label, { maxLength } = {}) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new ApiError(`${label} must be a string.`, 400);
  }

  const normalizedValue = value.trim();
  if (normalizedValue.length === 0) {
    return undefined;
  }

  if (typeof maxLength === 'number' && normalizedValue.length > maxLength) {
    throw new ApiError(`${label} must be ${maxLength} characters or fewer.`, 400);
  }

  return normalizedValue;
};

const requireOptionalArray = (value, label, { maxLength } = {}) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new ApiError(`${label} must be an array.`, 400);
  }

  if (typeof maxLength === 'number' && value.length > maxLength) {
    throw new ApiError(`${label} must contain ${maxLength} or fewer items.`, 400);
  }

  return value;
};

const requireNumber = (value, label, { min, max, integer = false } = {}) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new ApiError(`${label} must be a number.`, 400);
  }

  if (integer && !Number.isInteger(numericValue)) {
    throw new ApiError(`${label} must be an integer.`, 400);
  }

  if (typeof min === 'number' && numericValue < min) {
    throw new ApiError(`${label} must be greater than or equal to ${min}.`, 400);
  }

  if (typeof max === 'number' && numericValue > max) {
    throw new ApiError(`${label} must be less than or equal to ${max}.`, 400);
  }

  return numericValue;
};

module.exports = {
  isPlainObject,
  requireString,
  requirePassword,
  requireOptionalString,
  requireOptionalArray,
  requireNumber,
  PASSWORD_POLICY_MESSAGE,
};