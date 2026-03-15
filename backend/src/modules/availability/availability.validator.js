const ApiError = require('../../utils/apiError');

const validateListSlotsQuery = (query = {}) => {
	const vendorId = String(query.vendorId || '').trim();
	const serviceId = String(query.serviceId || '').trim();
	const localDate = String(query.localDate || '').trim();

	if (!vendorId) {
		throw new ApiError('vendorId is required.', 400);
	}

	if (!serviceId) {
		throw new ApiError('serviceId is required.', 400);
	}

	if (!localDate) {
		throw new ApiError('localDate is required.', 400);
	}

	return {
		vendorId,
		serviceId,
		localDate,
	};
};

module.exports = {
	validateListSlotsQuery,
};
