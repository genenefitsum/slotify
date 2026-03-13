const { v2: cloudinary } = require('cloudinary');

const env = require('../config/env');

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

const uploadVendorImage = async ({ dataUrl, fileName }) => {
  const result = await cloudinary.uploader.upload(dataUrl, {
    folder: env.cloudinaryVendorFolder,
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

const deleteVendorImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

module.exports = {
  isCloudinaryConfigured: isConfigured,
  uploadVendorImage,
  deleteVendorImage,
};