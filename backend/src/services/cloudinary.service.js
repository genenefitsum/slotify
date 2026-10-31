const { v2: cloudinary } = require('cloudinary');

const ApiError = require('../utils/apiError');
const env = require('../config/env');

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const SAFE_FILE_NAME = /^[a-zA-Z0-9._-]{1,120}$/;

const isConfigured = () => Boolean(
  env.cloudinaryCloudName
  && env.cloudinaryApiKey
  && env.cloudinaryApiSecret
);

if (isConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
  });
}

const validateUploadPayload = ({ dataUrl, fileName }) => {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
    throw new ApiError('Vendor image payload must be a data URL.', 400);
  }

  if (typeof fileName !== 'string' || !SAFE_FILE_NAME.test(fileName)) {
    throw new ApiError('Vendor image file name is invalid.', 400);
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new ApiError('Vendor image payload must be base64 encoded.', 400);
  }

  const contentType = match[1].toLowerCase();
  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(contentType)) {
    throw new ApiError('Unsupported vendor image content type.', 400);
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (!buffer.length) {
    throw new ApiError('Vendor image payload is empty.', 400);
  }

  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new ApiError('Vendor image must be 2MB or less.', 400);
  }

  return { contentType, buffer };
};

const uploadToFolder = async ({ dataUrl, fileName, folder }) => {
  validateUploadPayload({ dataUrl, fileName });

  const result = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
    overwrite: true,
    unique_filename: true,
    filename_override: fileName,
  });

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
  };
};

const uploadVendorImage = ({ dataUrl, fileName }) =>
  uploadToFolder({ dataUrl, fileName, folder: env.cloudinaryVendorFolder });

const uploadAvatarImage = ({ dataUrl, fileName }) =>
  uploadToFolder({ dataUrl, fileName, folder: env.cloudinaryAvatarFolder });

const deleteVendorImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

module.exports = {
  isCloudinaryConfigured: isConfigured,
  uploadVendorImage,
  uploadAvatarImage,
  deleteVendorImage,
  validateUploadPayload,
};