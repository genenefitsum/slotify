const authService = require('../services/auth.service');
const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { ACCESS_TOKEN_COOKIE_NAME } = require('../common/middlewares/auth');
const { CSRF_COOKIE_NAME, issueCsrfToken, setCsrfCookie } = require('../common/middlewares/csrf');

const validateRegisterInput = (payload = {}) => {
  const requiredFields = ['email', 'password', 'firstName'];

  for (const field of requiredFields) {
    if (!payload[field]) {
      throw new ApiError(`Missing required field: ${field}`, 400);
    }
  }

  if (String(payload.password).length < 8) {
    throw new ApiError('Password must be at least 8 characters.', 400);
  }
};

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction,
  path: '/',
});

const setAuthCookies = (res, sessionTokens) => {
  const { accessToken, csrfToken } = sessionTokens;
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, buildCookieOptions());
  setCsrfCookie(res, csrfToken || issueCsrfToken());
};

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, buildCookieOptions());
  res.clearCookie(CSRF_COOKIE_NAME, { ...buildCookieOptions(), httpOnly: false });
};

const validateLoginInput = (payload = {}) => {
  if (!payload.email || !payload.password) {
    throw new ApiError('Email and password are required.', 400);
  }
};

const validateGoogleInput = (payload = {}) => {
  if (!payload.credential) {
    throw new ApiError('Google credential is required.', 400);
  }
};

const register = async (req, res, next) => {
  try {
    validateRegisterInput(req.body);

    const result = await authService.register(req.body);
		setAuthCookies(res, result.sessionTokens);
		res.status(201).json({ user: result.user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    validateLoginInput(req.body);

    const result = await authService.login(req.body);
  setAuthCookies(res, result.sessionTokens);
	res.status(200).json({ user: result.user });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    validateGoogleInput(req.body);

    const result = await authService.loginWithGoogle(req.body);
  setAuthCookies(res, result.sessionTokens);
	res.status(200).json({ user: result.user });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req, res) => {
	clearAuthCookies(res);
	res.status(200).json({ success: true });
};

module.exports = {
  login,
  register,
  googleLogin,
	logout,
};
