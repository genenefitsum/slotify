const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const {
  deleteVendorImage,
  isCloudinaryConfigured,
  uploadVendorImage,
} = require('./cloudinary.service');
const { Service } = require('../models/Service');
const { Vendor } = require('../models/Vendor');

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);
const MAX_SERVICE_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_SERVICE_IMAGE_COUNT = 5;

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
};

const toBuffer = (value) => {
  if (!value) {
    return null;
  }

  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value);
  }

  if (Array.isArray(value)) {
    return Buffer.from(value);
  }

  if (Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }

  if (Buffer.isBuffer(value.buffer)) {
    const end = typeof value.position === 'number' && value.position > 0
      ? value.position
      : value.buffer.length;

    return value.buffer.subarray(0, end);
  }

  if (value.buffer instanceof ArrayBuffer) {
    return Buffer.from(value.buffer, value.byteOffset || 0, value.byteLength || value.length || 0);
  }

  if (typeof value.toJSON === 'function') {
    const jsonValue = value.toJSON();
    if (jsonValue && Array.isArray(jsonValue.data)) {
      return Buffer.from(jsonValue.data);
    }
  }

  return null;
};

const toImageUrl = (image) => {
  if (image?.secureUrl) {
    return image.secureUrl;
  }

  if (!image?.data || !image?.contentType) {
    return null;
  }

  const buffer = toBuffer(image.data);
  if (!buffer || buffer.length === 0) {
    return null;
  }

  return `data:${image.contentType};base64,${buffer.toString('base64')}`;
};

const toImageUrls = (images = []) => images.map(toImageUrl).filter(Boolean);

const createImageDataUrl = (contentType, buffer, rawValue) => {
  const rawString = typeof rawValue === 'string' ? rawValue : '';
  if (rawString.startsWith('data:')) {
    return rawString;
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
};

const normalizeImagePayload = (image, label) => {
  if (!image || typeof image !== 'object') {
    throw new ApiError(`Invalid ${label} payload.`, 400);
  }

  if (!image.data || !image.contentType) {
    throw new ApiError(`${label} data and contentType are required.`, 400);
  }

  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(image.contentType)) {
    throw new ApiError(`Unsupported ${label.toLowerCase()} content type.`, 400);
  }

  const base64Payload = String(image.data).includes(',')
    ? String(image.data).split(',').pop()
    : String(image.data);

  const buffer = Buffer.from(base64Payload, 'base64');
  if (!buffer.length) {
    throw new ApiError(`${label} data is empty.`, 400);
  }

  if (buffer.length > MAX_SERVICE_IMAGE_BYTES) {
    throw new ApiError(`${label} must be 2MB or less.`, 400);
  }

  return {
    contentType: image.contentType,
    buffer,
    dataUrl: createImageDataUrl(image.contentType, buffer, image.data),
  };
};

const normalizeImagesPayload = (imagesPayload) => {
  if (imagesPayload === undefined) {
    return undefined;
  }

  if (imagesPayload === null) {
    return null;
  }

  if (!Array.isArray(imagesPayload)) {
    throw new ApiError('Service images must be an array.', 400);
  }

  if (imagesPayload.length > MAX_SERVICE_IMAGE_COUNT) {
    throw new ApiError(`Service photos must be ${MAX_SERVICE_IMAGE_COUNT} or fewer.`, 400);
  }

  return imagesPayload.map((image, index) => normalizeImagePayload(image, `Service photo ${index + 1}`));
};

const uploadImageToCloudinary = async (normalizedImage, fileName) => {
  try {
    return await uploadVendorImage({
      dataUrl: normalizedImage.dataUrl,
      fileName,
    });
  } catch {
    throw new ApiError('Unable to upload service image.', 502);
  }
};

const removeCloudinaryImage = async (publicId) => {
  if (!publicId || !isCloudinaryConfigured()) {
    return;
  }

  try {
    await deleteVendorImage(publicId);
  } catch {
    // Ignore cleanup failures to avoid blocking user-facing updates.
  }
};

const removeCloudinaryImages = async (images = []) => {
  for (const image of images) {
    await removeCloudinaryImage(image?.publicId);
  }
};

const buildServiceImagesRecord = async (
  imagesPayload,
  fileName,
  currentImages = [],
  { append = false } = {}
) => {
  const normalizedImages = normalizeImagesPayload(imagesPayload);
  if (normalizedImages === undefined) {
    return undefined;
  }

  if (normalizedImages === null) {
    await removeCloudinaryImages(currentImages);
    return [];
  }

  if (append && currentImages.length + normalizedImages.length > MAX_SERVICE_IMAGE_COUNT) {
    throw new ApiError(`Service photos must be ${MAX_SERVICE_IMAGE_COUNT} or fewer.`, 400);
  }

  if (isCloudinaryConfigured()) {
    const uploadedImages = [];
    for (const [index, normalizedImage] of normalizedImages.entries()) {
      const uploadedImage = await uploadImageToCloudinary(normalizedImage, `${fileName}-${index + 1}`);
      uploadedImages.push({
        contentType: normalizedImage.contentType,
        publicId: uploadedImage.publicId,
        secureUrl: uploadedImage.secureUrl,
      });
    }

    if (append) {
      return [...currentImages, ...uploadedImages];
    }

    await removeCloudinaryImages(currentImages);
    return uploadedImages;
  }

  const nextImages = normalizedImages.map((normalizedImage) => ({
    data: normalizedImage.buffer,
    contentType: normalizedImage.contentType,
  }));

  return append ? [...currentImages, ...nextImages] : nextImages;
};

const toPublicService = (serviceDoc) => ({
  id: String(serviceDoc._id),
  vendorId: String(serviceDoc.vendorId),
  name: serviceDoc.name,
  description: serviceDoc.description || '',
  durationMinutes: serviceDoc.durationMinutes,
  bufferBeforeMinutes: serviceDoc.bufferBeforeMinutes,
  bufferAfterMinutes: serviceDoc.bufferAfterMinutes,
  priceAmount: serviceDoc.priceAmount,
  currency: serviceDoc.currency,
  depositType: serviceDoc.depositType,
  depositValue: serviceDoc.depositValue,
  imageUrl: toImageUrls(serviceDoc.images || [])[0] || null,
  images: toImageUrls(serviceDoc.images || []),
  isActive: serviceDoc.isActive,
  createdAt: serviceDoc.createdAt,
  updatedAt: serviceDoc.updatedAt,
});

const getOwnerVendor = async (ownerUserId) => {
  const vendor = await Vendor.findOne({ ownerUserId, deletedAt: null }).lean();

  if (!vendor) {
    throw new ApiError('Vendor profile not found for this account.', 404);
  }

  return vendor;
};

const listPublic = async ({ vendorId, page = 1, limit = 20 }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (normalizedPage - 1) * normalizedLimit;

  const filter = {
    deletedAt: null,
    isActive: true,
  };

  if (vendorId) {
    ensureObjectId(vendorId, 'vendor id');
    filter.vendorId = vendorId;
  }

  const [items, total] = await Promise.all([
    Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(normalizedLimit).lean(),
    Service.countDocuments(filter),
  ]);

  return {
    items: items.map(toPublicService),
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / normalizedLimit), 1),
    },
  };
};

const createForOwner = async (ownerUserId, payload) => {
  const vendor = await getOwnerVendor(ownerUserId);
  const images = await buildServiceImagesRecord(payload.images, payload.name, []);

  const service = await Service.create({
    vendorId: vendor._id,
    name: payload.name,
    description: payload.description,
    durationMinutes: payload.durationMinutes,
    bufferBeforeMinutes: payload.bufferBeforeMinutes || 0,
    bufferAfterMinutes: payload.bufferAfterMinutes || 0,
    priceAmount: payload.priceAmount,
    currency: payload.currency,
    depositType: payload.depositType || 'none',
    depositValue: payload.depositValue || 0,
    images: images || [],
  });

  return toPublicService(service);
};

const updateForOwner = async (ownerUserId, serviceId, payload) => {
  ensureObjectId(serviceId, 'service id');
  const vendor = await getOwnerVendor(ownerUserId);

  const service = await Service.findOne({
    _id: serviceId,
    vendorId: vendor._id,
    deletedAt: null,
  });

  if (!service) {
    throw new ApiError('Service not found.', 404);
  }

  const fields = [
    'name',
    'description',
    'durationMinutes',
    'bufferBeforeMinutes',
    'bufferAfterMinutes',
    'priceAmount',
    'currency',
    'depositType',
    'depositValue',
    'isActive',
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      service[field] = payload[field];
    }
  }

  if (payload.images !== undefined) {
    service.images = await buildServiceImagesRecord(
      payload.images,
      payload.name || service.name,
      service.images || [],
      { append: Array.isArray(payload.images) }
    );
  }

  await service.save();
  return toPublicService(service);
};

const removeForOwner = async (ownerUserId, serviceId) => {
  ensureObjectId(serviceId, 'service id');
  const vendor = await getOwnerVendor(ownerUserId);

  const service = await Service.findOne({
    _id: serviceId,
    vendorId: vendor._id,
    deletedAt: null,
  });

  if (!service) {
    throw new ApiError('Service not found.', 404);
  }

  service.deletedAt = new Date();
  service.isActive = false;
  await removeCloudinaryImages(service.images || []);
  service.images = [];
  await service.save();

  return { success: true };
};

module.exports = {
  listPublic,
  createForOwner,
  updateForOwner,
  removeForOwner,
};
