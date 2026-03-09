const ApiError = require('../../utils/apiError');

const requireRole = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) {
			return next(new ApiError('Authentication required.', 401));
		}

		if (!allowedRoles.includes(req.user.role)) {
			return next(new ApiError('You are not allowed to perform this action.', 403));
		}

		return next();
	};
};

module.exports = {
	requireRole,
};
