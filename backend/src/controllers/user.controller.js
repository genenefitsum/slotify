const ApiError = require('../utils/apiError');
const { User } = require('../models/User');
const {
  getCookieToken,
  issueCsrfToken,
  setCsrfCookie,
  CSRF_COOKIE_NAME,
} = require('../common/middlewares/csrf');

const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Authentication required.', 401);
    }

    const user = await User.findById(req.user.id).lean();

    if (!user || user.deletedAt) {
      throw new ApiError('User account not found.', 404);
    }

    let csrfToken = getCookieToken(req, CSRF_COOKIE_NAME);
    if (!csrfToken) {
      csrfToken = issueCsrfToken();
      setCsrfCookie(res, csrfToken);
    }

    res.json({
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName || '',
      role: user.role,
      status: user.status,
      phone: user.phone || null,
      emailVerifiedAt: user.emailVerifiedAt,
      phoneVerifiedAt: user.phoneVerifiedAt,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      csrfToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentUser };
