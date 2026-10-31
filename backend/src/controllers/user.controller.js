const ApiError = require('../utils/apiError');
const { User } = require('../models/User');
const {
  getCookieToken,
  issueCsrfToken,
  setCsrfCookie,
  CSRF_COOKIE_NAME,
} = require('../common/middlewares/csrf');
const { uploadAvatarImage, isCloudinaryConfigured } = require('../services/cloudinary.service');

const serializeUser = (user) => ({
  id: String(user._id),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName || '',
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl || null,
  phone: user.phone || null,
  emailVerifiedAt: user.emailVerifiedAt,
  phoneVerifiedAt: user.phoneVerifiedAt,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

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

    res.json({ ...serializeUser(user), csrfToken });
  } catch (error) {
    next(error);
  }
};

// Update the signed-in user's editable profile fields (name).
const updateCurrentUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Authentication required.', 401);
    }

    const { firstName, lastName, avatar } = req.body ?? {};
    const updates = {};

    if (firstName !== undefined) {
      const trimmed = String(firstName).trim();
      if (!trimmed) {
        throw new ApiError('First name is required.', 400);
      }
      if (trimmed.length > 80) {
        throw new ApiError('First name is too long.', 400);
      }
      updates.firstName = trimmed;
    }

    if (lastName !== undefined) {
      const trimmed = String(lastName).trim();
      if (trimmed.length > 80) {
        throw new ApiError('Last name is too long.', 400);
      }
      updates.lastName = trimmed;
    }

    // Profile picture: `null` clears it; an object uploads a new one to Cloudinary.
    if (avatar === null) {
      updates.avatarUrl = '';
    } else if (avatar !== undefined) {
      if (typeof avatar !== 'object' || typeof avatar.data !== 'string') {
        throw new ApiError('Invalid avatar payload.', 400);
      }
      if (!isCloudinaryConfigured()) {
        throw new ApiError('Image uploads are not configured.', 500);
      }
      const uploaded = await uploadAvatarImage({
        dataUrl: avatar.data,
        fileName: `avatar-${req.user.id}`,
      });
      updates.avatarUrl = uploaded.secureUrl;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError('No changes provided.', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!user || user.deletedAt) {
      throw new ApiError('User account not found.', 404);
    }

    res.json(serializeUser(user));
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentUser, updateCurrentUser };
