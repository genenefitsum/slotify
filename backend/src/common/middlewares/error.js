const mongoose = require('mongoose');
const env = require('../../config/env');
const logger = require('../../utils/logger');

const errorHandler = (err, req, res, next) => {
	const requestId = req.requestId || null;
	logger.error(err.message || 'Unhandled error', {
		requestId,
		method: req.method,
		path: req.originalUrl,
		statusCode: err.statusCode || err.status || 500,
		stack: err.stack,
	});

	if (res.headersSent) {
		return next(err);
	}

	if (err instanceof mongoose.Error.ValidationError) {
		return res.status(400).json({
			message: 'Validation failed.',
			requestId,
			details: Object.values(err.errors).map((entry) => entry.message),
		});
	}

	if (err instanceof mongoose.Error.CastError) {
		return res.status(400).json({
			message: `Invalid ${err.path}: ${err.value}`,
			requestId,
		});
	}

	if (err.code === 11000) {
		return res.status(409).json({
			message: 'Duplicate value violates a unique constraint.',
			requestId,
			details: err.keyValue,
		});
	}

	if (err.type === 'entity.too.large' || err.status === 413 || err.statusCode === 413) {
		return res.status(413).json({
			message: 'Request payload is too large. Reduce the upload size and try again.',
			requestId,
		});
	}

	const statusCode = err.statusCode || 500;
	const response = {
		message: err.message || 'Internal server error.',
		requestId,
	};

	if (!env.isProduction && err.stack) {
		response.stack = err.stack;
	}

	return res.status(statusCode).json(response);
};

module.exports = {
	errorHandler,
};
