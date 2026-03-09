const authService = require('../services/auth.service');
const ApiError = require('../utils/apiError');

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
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    validateLoginInput(req.body);

    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    validateGoogleInput(req.body);

    const result = await authService.loginWithGoogle(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  googleLogin,
};
