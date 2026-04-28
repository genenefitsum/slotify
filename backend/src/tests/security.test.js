const test = require('node:test');
const assert = require('node:assert/strict');

process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/slotify-test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-secret';
process.env.PORT = process.env.PORT || '5000';

const jwt = require('jsonwebtoken');

const env = require('../config/env');
const { User } = require('../models/User');
const { requireAuth, ACCESS_TOKEN_COOKIE_NAME } = require('../common/middlewares/auth');
const { requireCsrf, CSRF_COOKIE_NAME } = require('../common/middlewares/csrf');
const { validateUploadPayload } = require('../services/cloudinary.service');
const authController = require('../controllers/auth.controller');
const authService = require('../services/auth.service');

const createReq = ({ method = 'GET', headers = {}, path = '/' } = {}) => ({
	method,
	headers,
	path,
	get: (name) => headers[name.toLowerCase()] || headers[name],
});

const createRes = () => {
	return {
		cookies: [],
		clearedCookies: [],
		statusCode: 200,
		body: null,
		cookie(name, value, options) {
			this.cookies.push({ name, value, options });
		},
		clearCookie(name, options) {
			this.clearedCookies.push({ name, options });
		},
		status(code) {
			this.statusCode = code;
			return this;
		},
		json(payload) {
			this.body = payload;
			return this;
		},
	};
};

test('requireAuth accepts access tokens from the auth cookie', async () => {
	const token = jwt.sign({ sub: 'user-1' }, env.jwtAccessSecret, { expiresIn: '1h' });
	const originalFindById = User.findById;
	User.findById = () => ({
		lean: async () => ({
			_id: 'user-1',
			email: 'customer@example.com',
			role: 'customer',
			status: 'active',
			deletedAt: null,
		}),
	});

	try {
		const req = createReq({ headers: { cookie: `${ACCESS_TOKEN_COOKIE_NAME}=${token}` } });
		const res = createRes();
		let nextCalled = false;

		await requireAuth(req, res, (error) => {
			assert.equal(error, undefined);
			nextCalled = true;
		});

		assert.equal(nextCalled, true);
		assert.deepEqual(req.user, {
			id: 'user-1',
			email: 'customer@example.com',
			role: 'customer',
			status: 'active',
		});
	} finally {
		User.findById = originalFindById;
	}
});

test('requireCsrf blocks unsafe requests without a matching token', () => {
	const req = createReq({
		method: 'POST',
		headers: { cookie: `${CSRF_COOKIE_NAME}=cookie-token`, 'x-csrf-token': 'bad-token' },
	});

	let errorSeen = null;
	requireCsrf(req, createRes(), (error) => {
		errorSeen = error;
	});

	assert.ok(errorSeen);
	assert.equal(errorSeen.statusCode, 403);
	assert.equal(errorSeen.message, 'Invalid CSRF token.');
});

test('validateUploadPayload rejects unsafe upload payloads', () => {
	assert.throws(
		() => validateUploadPayload({ dataUrl: 'not-a-data-url', fileName: 'vendor.png' }),
		/ data URL/i
	);

	assert.throws(
		() => validateUploadPayload({ dataUrl: 'data:image/png;base64,AAAA', fileName: '../vendor.png' }),
		/invalid/i
	);
});

test('auth controller sets http-only cookies and returns only the user payload', async () => {
	const originalLogin = authService.login;
	authService.login = async () => ({
		user: {
			id: 'user-1',
			email: 'customer@example.com',
			firstName: 'Test',
			lastName: '',
			role: 'customer',
			status: 'active',
		},
		sessionTokens: { accessToken: 'cookie-token', csrfToken: 'csrf-token' },
	});

	try {
		const req = createReq({ method: 'POST', headers: { body: true } });
		const res = createRes();
		await authController.login({ body: { email: 'customer@example.com', password: 'Password123!' } }, res, () => {});

		assert.equal(res.statusCode, 200);
		assert.deepEqual(res.body, {
			user: {
				id: 'user-1',
				email: 'customer@example.com',
				firstName: 'Test',
				lastName: '',
				role: 'customer',
				status: 'active',
			},
		});
		assert.equal(res.cookies.length, 2);
		assert.equal(res.cookies[0].name, ACCESS_TOKEN_COOKIE_NAME);
		assert.equal(res.cookies[1].name, CSRF_COOKIE_NAME);
	} finally {
		authService.login = originalLogin;
	}
});