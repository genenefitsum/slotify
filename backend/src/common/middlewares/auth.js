const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../utils/apiError');
const { User } = require('../../models/User');

const ACCESS_TOKEN_COOKIE_NAME = 'slotify_access_token';

const parseCookies = (cookieHeader = '') => {
	return cookieHeader.split(';').reduce((accumulator, part) => {
		const [rawKey, ...rawValueParts] = part.trim().split('=');
		if (!rawKey) {
			return accumulator;
		}

		const key = decodeURIComponent(rawKey);
		const value = decodeURIComponent(rawValueParts.join('='));
		accumulator[key] = value;
		return accumulator;
	}, {});
};

const extractBearerToken = (authorizationHeader = '') => {
	const [scheme, token] = authorizationHeader.split(' ');

	if (scheme !== 'Bearer' || !token) {
		return null;
	}

	return token;
};

const extractCookieToken = (cookieHeader = '') => {
	const cookies = parseCookies(cookieHeader);
	return cookies[ACCESS_TOKEN_COOKIE_NAME] || null;
};

const requireAuth = async (req, res, next) => {
	try {
		const token = extractBearerToken(req.headers.authorization) || extractCookieToken(req.headers.cookie);

		if (!token) {
			return next(new ApiError('Authentication required.', 401));
		}

		let payload;

		try {
			payload = jwt.verify(token, env.jwtAccessSecret);
		} catch (error) {
			return next(new ApiError('Invalid or expired access token.', 401));
		}

		const user = await User.findById(payload.sub).lean();

		if (!user || user.deletedAt) {
			return next(new ApiError('User account not found.', 401));
		}

		if (user.status !== 'active') {
			return next(new ApiError('Account is not active.', 403));
		}

		req.user = {
			id: String(user._id),
			email: user.email,
			role: user.role,
			status: user.status,
		};

		return next();
	} catch (error) {
		return next(error);
	}
};

module.exports = {
	requireAuth,
	ACCESS_TOKEN_COOKIE_NAME,
};
