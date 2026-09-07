const crypto = require('crypto');

const ApiError = require('../../utils/apiError');

const CSRF_COOKIE_NAME = 'slotify_csrf_token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

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

const getCookieToken = (req, name) => {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[name] || null;
};

const issueCsrfToken = () => crypto.randomBytes(32).toString('hex');

const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

const requireCsrf = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const authHeader = req.get('authorization') || req.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const isAuthRoute =
    (req.path && req.path.startsWith('/auth/')) ||
    (req.baseUrl && req.baseUrl.includes('/auth')) ||
    (req.originalUrl && req.originalUrl.includes('/auth/'));

  if (isAuthRoute) {
    return next();
  }

  const cookieToken = getCookieToken(req, CSRF_COOKIE_NAME);
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new ApiError('Invalid CSRF token.', 403));
  }

  return next();
};

module.exports = {
  CSRF_COOKIE_NAME,
  issueCsrfToken,
  setCsrfCookie,
  requireCsrf,
  parseCookies,
  getCookieToken,
};