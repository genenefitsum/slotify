const mongoose = require('mongoose');

const ApiError = require('../../utils/apiError');
const { USER_ROLES, USER_STATUSES } = require('../../models/User');
const { VENDOR_STATUSES } = require('../../models/Vendor');
const { BOOKING_STATUSES } = require('../../models/Booking');
const { COMMISSION_TYPES } = require('../../models/CommissionPlan');

const parsePagination = ({ page = 1, limit = 20 }) => {
	const normalizedPage = Math.max(Number(page) || 1, 1);
	const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

	return {
		page: normalizedPage,
		limit: normalizedLimit,
		skip: (normalizedPage - 1) * normalizedLimit,
	};
};

const assertObjectId = (value, label) => {
	if (!mongoose.Types.ObjectId.isValid(value)) {
		throw new ApiError(`Invalid ${label}.`, 400);
	}
};

const ensureEnum = (value, allowedValues, label) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	if (!allowedValues.includes(value)) {
		throw new ApiError(`Invalid ${label}.`, 400);
	}

	return value;
};

const ensureDate = (value, label) => {
	if (value === undefined || value === null || value === '') {
		return null;
	}

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		throw new ApiError(`Invalid ${label}.`, 400);
	}

	return parsed;
};

const validateCreateCommissionPayload = (payload = {}) => {
	if (!payload.code || !String(payload.code).trim()) {
		throw new ApiError('code is required.', 400);
	}

	if (!payload.name || !String(payload.name).trim()) {
		throw new ApiError('name is required.', 400);
	}

	const type = ensureEnum(payload.type, COMMISSION_TYPES, 'commission type') || 'percentage';
	const value = Number(payload.value);

	if (!Number.isFinite(value) || value < 0) {
		throw new ApiError('value must be a valid non-negative number.', 400);
	}

	if (type === 'percentage' && (value <= 0 || value > 100)) {
		throw new ApiError('Percentage commission value must be between 0 and 100.', 400);
	}

	if (!payload.currency || String(payload.currency).trim().length !== 3) {
		throw new ApiError('currency is required and must be a 3-letter code.', 400);
	}
};

module.exports = {
	USER_ROLES,
	USER_STATUSES,
	VENDOR_STATUSES,
	BOOKING_STATUSES,
	parsePagination,
	assertObjectId,
	ensureEnum,
	ensureDate,
	validateCreateCommissionPayload,
};
