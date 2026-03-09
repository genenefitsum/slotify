const mongoose = require('mongoose');
const env = require('../../config/env');

const errorHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err);
	}

	if (err instanceof mongoose.Error.ValidationError) {
		return res.status(400).json({
			message: 'Validation failed.',
			details: Object.values(err.errors).map((entry) => entry.message),
		});
	}

	if (err instanceof mongoose.Error.CastError) {
		return res.status(400).json({
			message: `Invalid ${err.path}: ${err.value}`,
		});
	}

	if (err.code === 11000) {
		return res.status(409).json({
			message: 'Duplicate value violates a unique constraint.',
			details: err.keyValue,
		});
	}

	const statusCode = err.statusCode || 500;
	const response = {
		message: err.message || 'Internal server error.',
	};

	if (!env.isProduction && err.stack) {
		response.stack = err.stack;
	}

	return res.status(statusCode).json(response);
};

module.exports = {
	errorHandler,
};
