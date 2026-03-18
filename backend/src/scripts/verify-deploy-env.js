require('dotenv').config();

try {
  const env = require('../config/env');

  const summary = {
    nodeEnv: env.nodeEnv,
    port: env.port,
    hasMongoUri: Boolean(env.mongoUri),
    hasJwtAccessSecret: Boolean(env.jwtAccessSecret),
    hasGoogleClientId: Boolean(env.googleClientId),
    corsOriginsCount: env.corsOrigins.length,
    rateLimitWindowMs: env.rateLimitWindowMs,
    rateLimitMaxRequests: env.rateLimitMaxRequests,
    rateLimitAuthMaxRequests: env.rateLimitAuthMaxRequests,
  };

  console.log('Backend deployment environment validation passed.');
  console.table(summary);

  if (!env.googleClientId) {
    console.warn('Warning: GOOGLE_CLIENT_ID is empty. Google login will not work.');
  }

  const hasCloudinary = Boolean(env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret);
  if (!hasCloudinary) {
    console.warn('Warning: Cloudinary keys are incomplete. Vendor image uploads will use fallback storage mode.');
  }

  process.exit(0);
} catch (error) {
  console.error('Backend deployment environment validation failed.');
  console.error(error.message || error);
  process.exit(1);
}
