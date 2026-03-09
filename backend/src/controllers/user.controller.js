const ApiError = require('../utils/apiError');
const { User } = require('../models/User');

const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      throw new ApiError('Authentication required.', 401);
    }

    const user = await User.findById(req.user.id).lean();

    if (!user || user.deletedAt) {
      throw new ApiError('User account not found.', 404);
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
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCurrentUser };
