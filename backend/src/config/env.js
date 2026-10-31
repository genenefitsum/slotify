const getRequired = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const parseOrigins = (value) => {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const parsePositiveNumber = (value, fallback, label) => {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid numeric environment variable: ${label}`);
  }

  return parsed;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const corsOrigins = parseOrigins(process.env.CORS_ORIGINS || '');

if (isProduction && corsOrigins.length === 0) {
  throw new Error('CORS_ORIGINS must be set in production.');
}

const env = {
  nodeEnv,
  isProduction,
  port: parsePositiveNumber(process.env.PORT, 5000, 'PORT'),
  mongoUri: getRequired('MONGO_URI'),
  jwtAccessSecret: getRequired('JWT_ACCESS_SECRET'),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryVendorFolder: process.env.CLOUDINARY_VENDOR_FOLDER || 'slotify/vendors',
  cloudinaryAvatarFolder: process.env.CLOUDINARY_AVATAR_FOLDER || 'slotify/avatars',
  corsOrigins,
  rateLimitWindowMs: parsePositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000, 'RATE_LIMIT_WINDOW_MS'),
  rateLimitMaxRequests: parsePositiveNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 300, 'RATE_LIMIT_MAX_REQUESTS'),
  rateLimitAuthMaxRequests: parsePositiveNumber(
    process.env.RATE_LIMIT_AUTH_MAX_REQUESTS,
    30,
    'RATE_LIMIT_AUTH_MAX_REQUESTS'
  ),
};

module.exports = env;
