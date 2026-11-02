const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const ApiError = require('../utils/apiError');
const env = require('../config/env');
const logger = require('../utils/logger');
const { User } = require('../models/User');
const { PasswordResetToken } = require('../models/PasswordResetToken');
const mailService = require('./mail.service');

const googleClient = new OAuth2Client();
const PUBLIC_SIGNUP_ROLES = ['customer', 'vendor_owner'];

const RESET_CODE_TTL_MS = env.passwordResetCodeTtlMinutes * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;
const RESET_RESEND_THROTTLE_MS = 60 * 1000;
const RESET_INVALID_MESSAGE = 'Invalid or expired reset code.';

const hashResetCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

// Cryptographically-random, zero-padded 6-digit code (000000–999999).
const generateResetCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

const codesMatch = (rawCode, codeHash) => {
  const candidate = Buffer.from(hashResetCode(rawCode));
  const stored = Buffer.from(String(codeHash));
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
};

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

/**
 * Begin a password reset: email the user a one-time code. Always resolves
 * without revealing whether the email belongs to an account (no enumeration).
 */
const requestPasswordReset = async ({ email }) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  if (!normalizedEmail) {
    return;
  }

  const user = await User.findOne({ email: normalizedEmail });

  // Only active local accounts with a password can reset. Stay silent for
  // everything else (missing, deleted, suspended, or Google-only accounts).
  if (!user || user.deletedAt || user.status !== 'active' || !user.passwordHash) {
    return;
  }

  const latest = await PasswordResetToken.findOne({
    userId: user._id,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  // A code was just sent — don't spam a fresh one, but still resolve silently.
  if (latest && Date.now() - latest.createdAt.getTime() < RESET_RESEND_THROTTLE_MS) {
    return;
  }

  // Invalidate any prior codes so only the newest one is ever valid.
  await PasswordResetToken.deleteMany({ userId: user._id });

  const code = generateResetCode();
  await PasswordResetToken.create({
    userId: user._id,
    codeHash: hashResetCode(code),
    expiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
  });

  // Send in the background so the response never waits on (or fails because of)
  // SMTP latency. The endpoint already resolves generically, so delivery is
  // best-effort with its own retry; the user can tap "Resend" if it slips.
  mailService.sendPasswordResetCode({ to: user.email, code }).catch((error) => {
    logger.error('Failed to send password reset code', { userId: String(user._id), error: error.message });
  });
};

/**
 * Complete a password reset using the emailed code. Throws a generic error for
 * any failure (unknown email, wrong/expired code, too many attempts).
 */
const resetPassword = async ({ email, code, newPassword }) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const user = normalizedEmail ? await User.findOne({ email: normalizedEmail }) : null;

  if (!user || user.deletedAt || !user.passwordHash) {
    throw new ApiError(RESET_INVALID_MESSAGE, 400);
  }

  const token = await PasswordResetToken.findOne({
    userId: user._id,
    consumedAt: null,
  }).sort({ createdAt: -1 });

  if (!token || token.expiresAt.getTime() <= Date.now()) {
    if (token) {
      await PasswordResetToken.deleteMany({ userId: user._id });
    }
    throw new ApiError(RESET_INVALID_MESSAGE, 400);
  }

  if (token.attempts >= RESET_MAX_ATTEMPTS) {
    await PasswordResetToken.deleteMany({ userId: user._id });
    throw new ApiError('Too many attempts. Request a new reset code.', 400);
  }

  if (!codesMatch(code, token.codeHash)) {
    token.attempts += 1;
    if (token.attempts >= RESET_MAX_ATTEMPTS) {
      await PasswordResetToken.deleteMany({ userId: user._id });
    } else {
      await token.save();
    }
    throw new ApiError(RESET_INVALID_MESSAGE, 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  // Consume the code and clear any siblings so it can't be reused.
  await PasswordResetToken.deleteMany({ userId: user._id });
};

module.exports = {
  register,
  login,
  loginWithGoogle,
  createSessionTokens,
  requestPasswordReset,
  resetPassword,
};
