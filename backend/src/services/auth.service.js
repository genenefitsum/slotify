const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const ApiError = require('../utils/apiError');
const env = require('../config/env');
const { User } = require('../models/User');

const googleClient = new OAuth2Client();
const PUBLIC_SIGNUP_ROLES = ['customer', 'vendor_owner'];

const sanitizeUser = (user) => ({
  id: String(user._id),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName || '',
  role: user.role,
  status: user.status,
});

const signAccessToken = (user) => {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
      email: user.email,
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
};

const createSessionTokens = (user) => {
  const accessToken = signAccessToken(user);
  const csrfToken = jwt.sign(
    { sub: String(user._id), purpose: 'csrf' },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );

  return { accessToken, csrfToken };
};

const buildAuthResponse = (user) => {
  const sanitizedUser = sanitizeUser(user);
  const sessionTokens = createSessionTokens(user);

  return {
    user: sanitizedUser,
    sessionTokens,
  };
};

const register = async ({
  email,
  phone,
  password,
  firstName,
  lastName,
  role = 'customer',
}) => {
  const normalizedRole = PUBLIC_SIGNUP_ROLES.includes(role) ? role : 'customer';
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const isGoogleOnlyAccount =
      existingUser.provider === 'google' && !existingUser.passwordHash;

    if (!isGoogleOnlyAccount) {
      throw new ApiError('An account with this email already exists.', 409);
    }

    existingUser.passwordHash = await bcrypt.hash(password, 12);
    existingUser.phone = phone || existingUser.phone;
    existingUser.firstName = firstName || existingUser.firstName;
    existingUser.lastName = lastName || existingUser.lastName;

    if (!existingUser.role || existingUser.role === 'customer') {
      existingUser.role = normalizedRole;
    }

    if (existingUser.status !== 'active') {
      throw new ApiError('Account is not active.', 403);
    }

    existingUser.lastLoginAt = new Date();
    await existingUser.save();

    return buildAuthResponse(existingUser);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const createdUser = await User.create({
    email,
    provider: 'local',
    phone,
    passwordHash,
    firstName,
    lastName,
    role: normalizedRole,
  });

  return buildAuthResponse(createdUser);
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.deletedAt) {
    throw new ApiError('Invalid email or password.', 401);
  }

  if (user.provider === 'google' && !user.passwordHash) {
    throw new ApiError('Use Google sign-in for this account.', 400);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new ApiError('Invalid email or password.', 401);
  }

  if (user.status !== 'active') {
    throw new ApiError('Account is not active.', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthResponse(user);
};

const verifyGoogleCredential = async (credential) => {
  if (!env.googleClientId) {
    throw new ApiError('Google sign-in is not configured on the server.', 500);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email || !payload.sub) {
    throw new ApiError('Google credential did not include required profile fields.', 400);
  }

  return payload;
};

const loginWithGoogle = async ({ credential, role = 'customer' }) => {
  const normalizedRole = PUBLIC_SIGNUP_ROLES.includes(role) ? role : 'customer';
  const payload = await verifyGoogleCredential(credential);
  const email = payload.email.toLowerCase().trim();

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email }],
  });

  if (!user) {
    user = await User.create({
      email,
      provider: 'google',
      googleId: payload.sub,
      // Intentionally do NOT import the Google account photo. Users start with
      // initials and only ever get an avatar they explicitly upload.
      firstName: payload.given_name || payload.name || 'User',
      lastName: payload.family_name || '',
      role: normalizedRole,
      emailVerifiedAt: new Date(),
    });
  } else {
    if (!user.googleId) {
      user.googleId = payload.sub;
    }

    user.provider = user.provider || 'google';
    // Never overwrite the user's avatar with the Google photo on re-login — a
    // custom upload must always win, and we don't auto-import it at all.

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
    }

    await user.save();
  }

  if (user.status !== 'active') {
    throw new ApiError('Account is not active.', 403);
  }

  user.lastLoginAt = new Date();
  await user.save();

  return buildAuthResponse(user);
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  createSessionTokens,
};
