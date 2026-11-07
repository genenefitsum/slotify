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
  // SMTP email (password-reset codes, etc.). When host is unset the mail service
  // falls back to logging the message so local dev works without credentials.
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 465),
  // Default to implicit TLS (port 465). Set SMTP_SECURE=false for STARTTLS (587).
  smtpSecure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : true,
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || 'Slotify <no-reply@slotify.app>',
  appName: process.env.APP_NAME || 'Slotify',
  // Claude-powered support bot. When unset, the support endpoint returns 503 and
  // the client falls back to the "email us" option.
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  supportEmail: process.env.SUPPORT_EMAIL || 'slotifyethiopia@outlook.com',
  passwordResetCodeTtlMinutes: parsePositiveNumber(
    process.env.PASSWORD_RESET_CODE_TTL_MINUTES,
    10,
    'PASSWORD_RESET_CODE_TTL_MINUTES'
  ),
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
