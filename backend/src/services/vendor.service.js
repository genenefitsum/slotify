const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const {
  deleteVendorImage,
  isCloudinaryConfigured,
  uploadVendorImage,
} = require('./cloudinary.service');
const { Service } = require('../models/Service');
const { Vendor } = require('../models/Vendor');

const ADDIS_TIMEZONE = 'Africa/Addis_Ababa';

const ALLOWED_IMAGE_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]);
const MAX_VENDOR_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_VENDOR_IMAGE_COUNT = 5;
const GOOGLE_MAPS_REDIRECT_LIMIT = 5;
const GOOGLE_MAPS_RESOLVE_TIMEOUT_MS = 8000;
const VENDOR_LIST_PROJECTION = {
  displayName: 1,
  legalBusinessName: 1,
  description: 1,
  image: 1,
  categories: 1,
  timezone: 1,
  location: 1,
  averageRating: 1,
  reviewCount: 1,
  status: 1,
  createdAt: 1,
  updatedAt: 1,
};

const isAllowedGoogleMapsHostname = (hostname) => {
  const normalizedHostname = String(hostname || '').toLowerCase();

  return (
    normalizedHostname === 'maps.app.goo.gl'
    || normalizedHostname === 'goo.gl'
    || normalizedHostname.endsWith('.goo.gl')
    || /^(.+\.)?google\.[a-z.]+$/.test(normalizedHostname)
  );
};

const isValidLatitude = (value) => Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLongitude = (value) => Number.isFinite(value) && value >= -180 && value <= 180;

const toLatLng = (latitude, longitude) => {
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return null;
  }

  return [latitude, longitude];
};

const parseCoordinatePair = (value) => {
  const match = String(value || '').match(/(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/);
  if (!match) {
    return null;
  }

  return toLatLng(Number(match[1]), Number(match[2]));
};

const parseGoogleMapsCoordinates = (value) => {
  const text = String(value || '').trim();
  if (!text) {
    return null;
  }

  const normalizedText = text.replace(/\+/g, ' ');
  const decodedText = (() => {
    try {
      return decodeURIComponent(normalizedText);
    } catch {
      return normalizedText;
    }
  })();

  const parserStrategies = [
    (candidate) => {
      const dataMatch = candidate.match(/!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/);
      return dataMatch ? toLatLng(Number(dataMatch[1]), Number(dataMatch[2])) : null;
    },
    (candidate) => {
      const atMatch = candidate.match(/@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
      return atMatch ? toLatLng(Number(atMatch[1]), Number(atMatch[2])) : null;
    },
    (candidate) => {
      const queryMatch = candidate.match(/(?:q|query|ll|center|destination|saddr|daddr)=(-?\d{1,3}(?:\.\d+)?)(?:,|%2C)\s*(-?\d{1,3}(?:\.\d+)?)/i);
      return queryMatch ? toLatLng(Number(queryMatch[1]), Number(queryMatch[2])) : null;
    },
    parseCoordinatePair,
  ];

  for (const candidate of [decodedText, text]) {
    for (const parseCandidate of parserStrategies) {
      const parsed = parseCandidate(candidate);
      if (parsed) {
        return parsed;
      }
    }
  }

  const urlText = /^[a-z][a-z\d+.-]*:\/\//i.test(text)
    ? text
    : text.startsWith('www.')
      ? `https://${text}`
      : null;

  if (!urlText) {
    return null;
  }

  try {
    const url = new URL(urlText);
    const paramCandidates = ['q', 'query', 'll', 'center', 'destination', 'saddr', 'daddr']
      .map((key) => url.searchParams.get(key))
      .filter(Boolean);

    for (const candidate of [url.href, url.pathname, url.hash, ...paramCandidates]) {
      const parsed = parseGoogleMapsCoordinates(candidate);
      if (parsed) {
        return parsed;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const resolveGoogleMapsUrl = async (link) => {
  const rawLink = String(link || '').trim();
  if (!rawLink) {
    throw new ApiError('Google Maps link is required.', 400);
  }

  const normalizedLink = /^[a-z][a-z\d+.-]*:\/\//i.test(rawLink) ? rawLink : `https://${rawLink}`;

  let currentUrl;
  try {
    currentUrl = new URL(normalizedLink);
  } catch {
    throw new ApiError('Enter a valid Google Maps URL.', 400);
  }

  if (!isAllowedGoogleMapsHostname(currentUrl.hostname)) {
    throw new ApiError('Only Google Maps links are supported.', 400);
  }

  for (let redirectCount = 0; redirectCount <= GOOGLE_MAPS_REDIRECT_LIMIT; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GOOGLE_MAPS_RESOLVE_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'user-agent': 'Slotify/1.0',
        },
      });
    } catch (error) {
      if (error && error.name === 'AbortError') {
        throw new ApiError('Resolving the Google Maps link timed out.', 504);
      }

      throw new ApiError('Unable to resolve the Google Maps link right now.', 502);
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw new ApiError('Google Maps link could not be resolved.', 400);
      }

      currentUrl = new URL(location, currentUrl);
      if (!isAllowedGoogleMapsHostname(currentUrl.hostname)) {
        throw new ApiError('Resolved URL is not a supported Google Maps link.', 400);
      }

      continue;
    }

    if (!response.ok) {
      throw new ApiError('Google Maps link could not be resolved.', 400);
    }

    return currentUrl.toString();
  }

  throw new ApiError('Google Maps link redirected too many times.', 400);
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

const getVendorImages = (vendorDoc) => {
  if (Array.isArray(vendorDoc?.images) && vendorDoc.images.length > 0) {
    return vendorDoc.images;
  }

  return vendorDoc?.image ? [vendorDoc.image] : [];
};

const toImageUrls = (images = []) => images.map(toImageUrl).filter(Boolean);

const createImageDataUrl = (contentType, buffer, rawValue) => {
  const rawString = typeof rawValue === 'string' ? rawValue : '';
  if (rawString.startsWith('data:')) {
    return rawString;
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
};

const toPublicVendor = (vendorDoc, details = {}) => ({
  id: String(vendorDoc._id),
  displayName: vendorDoc.displayName,
  legalBusinessName: vendorDoc.legalBusinessName || null,
  description: vendorDoc.description || '',
  imageUrl: toImageUrls(getVendorImages(vendorDoc))[0] || null,
  images: toImageUrls(getVendorImages(vendorDoc)),
  categories: vendorDoc.categories || [],
  timezone: vendorDoc.timezone,
  location: vendorDoc.location,
  workingHours: vendorDoc.workingHours || [],
  blackoutSlots: vendorDoc.blackoutSlots || [],
  averageRating: vendorDoc.averageRating,
  reviewCount: vendorDoc.reviewCount,
  startingPrice: details.startingPrice ?? null,
  status: vendorDoc.status,
  createdAt: vendorDoc.createdAt,
  updatedAt: vendorDoc.updatedAt,
});

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
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

  if (buffer.length > MAX_VENDOR_IMAGE_BYTES) {
    throw new ApiError(`${label} must be 2MB or less.`, 400);
  }

  return {
    contentType: image.contentType,
    buffer,
    dataUrl: createImageDataUrl(image.contentType, buffer, image.data),
  };
};

const normalizeImagesPayload = (imagesPayload, imagePayload) => {
  if (imagesPayload === undefined && imagePayload === undefined) {
    return undefined;
  }

  if (imagesPayload !== undefined) {
    if (imagesPayload === null) {
      return null;
    }

    if (!Array.isArray(imagesPayload)) {
      throw new ApiError('Vendor images must be an array.', 400);
    }

    if (imagesPayload.length > MAX_VENDOR_IMAGE_COUNT) {
      throw new ApiError(`Vendor photos must be ${MAX_VENDOR_IMAGE_COUNT} or fewer.`, 400);
    }

    return imagesPayload.map((image, index) => normalizeImagePayload(image, `Vendor photo ${index + 1}`));
  }

  if (imagePayload === null) {
    return null;
  }

  return [normalizeImagePayload(imagePayload, 'Vendor image')];
};

const uploadImageToCloudinary = async (normalizedImage, fileName) => {
  try {
    return await uploadVendorImage({
      dataUrl: normalizedImage.dataUrl,
      fileName,
    });
  } catch (error) {
    throw new ApiError('Unable to upload vendor image.', 502);
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

const buildVendorImagesRecord = async (
  imagesPayload,
  imagePayload,
  fileName,
  currentImages = [],
  { append = false } = {}
) => {
  const normalizedImages = normalizeImagesPayload(imagesPayload, imagePayload);
  if (normalizedImages === undefined) {
    return undefined;
  }

  if (normalizedImages === null) {
    await removeCloudinaryImages(currentImages);
    return [];
  }

  if (append && currentImages.length + normalizedImages.length > MAX_VENDOR_IMAGE_COUNT) {
    throw new ApiError(`Vendor photos must be ${MAX_VENDOR_IMAGE_COUNT} or fewer.`, 400);
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

const getStartingPricesByVendorId = async (vendorIds) => {
  if (!vendorIds.length) {
    return new Map();
  }

  const rows = await Service.aggregate([
    {
      $match: {
        vendorId: { $in: vendorIds },
        isActive: true,
        deletedAt: null,
      },
    },
    {
      $group: {
        _id: '$vendorId',
        startingPrice: { $min: '$priceAmount' },
      },
    },
  ]);

  return new Map(rows.map((row) => [String(row._id), row.startingPrice]));
};

const normalizeTimeString = (value, label) => {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    throw new ApiError(`Invalid ${label}. Expected HH:mm format.`, 400);
  }

  const [hours, minutes] = value.split(':').map(Number);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }

  return value;
};

const normalizeWorkingHours = (workingHours) => {
  if (workingHours === undefined) {
    return undefined;
  }

  if (!Array.isArray(workingHours)) {
    throw new ApiError('workingHours must be an array.', 400);
  }

  return workingHours.map((item, index) => {
    const dayOfWeek = Number(item?.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ApiError(`Invalid workingHours[${index}].dayOfWeek.`, 400);
    }

    const isEnabled = Boolean(item?.isEnabled);
    const startTime = normalizeTimeString(item?.startTime || '09:00', `workingHours[${index}].startTime`);
    const endTime = normalizeTimeString(item?.endTime || '17:00', `workingHours[${index}].endTime`);

    if (startTime >= endTime) {
      throw new ApiError(`workingHours[${index}] endTime must be later than startTime.`, 400);
    }

    return {
      dayOfWeek,
      isEnabled,
      startTime,
      endTime,
    };
  });
};

const normalizeBlackoutSlots = (blackoutSlots) => {
  if (blackoutSlots === undefined) {
    return undefined;
  }

  if (!Array.isArray(blackoutSlots)) {
    throw new ApiError('blackoutSlots must be an array.', 400);
  }

  return blackoutSlots.map((item, index) => {
    const date = String(item?.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ApiError(`Invalid blackoutSlots[${index}].date. Expected YYYY-MM-DD.`, 400);
    }

    const startTime = normalizeTimeString(item?.startTime, `blackoutSlots[${index}].startTime`);
    const endTime = normalizeTimeString(item?.endTime, `blackoutSlots[${index}].endTime`);
    if (startTime >= endTime) {
      throw new ApiError(`blackoutSlots[${index}] endTime must be later than startTime.`, 400);
    }

    return {
      date,
      startTime,
      endTime,
      label: String(item?.label || '').trim(),
    };
  });
};

const list = async ({ city, category, page = 1, limit = 20, all = false }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const includeAll = all === true || all === 'true';
  const normalizedLimit = includeAll ? 0 : Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (normalizedPage - 1) * normalizedLimit;

  const filter = {
    deletedAt: null,
  };

  if (city) {
    filter['location.city'] = city;
  }

  if (category) {
    filter.categories = category;
  }

  const [items, total] = await Promise.all([
    includeAll
      ? Vendor.find(filter).select(VENDOR_LIST_PROJECTION).sort({ createdAt: -1 }).lean()
      : Vendor.find(filter)
        .select(VENDOR_LIST_PROJECTION)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(normalizedLimit)
        .lean(),
    Vendor.countDocuments(filter),
  ]);

  const startingPricesByVendorId = await getStartingPricesByVendorId(items.map((item) => item._id));

  return {
    items: items.map((item) =>
      toPublicVendor(item, { startingPrice: startingPricesByVendorId.get(String(item._id)) })
    ),
    pagination: {
      page: normalizedPage,
      limit: includeAll ? total : normalizedLimit,
      total,
      totalPages: includeAll ? 1 : Math.max(Math.ceil(total / normalizedLimit), 1),
    },
  };
};

const getById = async (id) => {
  ensureObjectId(id, 'vendor id');

  const vendor = await Vendor.findOne({
    _id: id,
    deletedAt: null,
  }).lean();

  if (!vendor) {
    throw new ApiError('Vendor not found.', 404);
  }

  const startingPricesByVendorId = await getStartingPricesByVendorId([vendor._id]);
  return toPublicVendor(vendor, {
    startingPrice: startingPricesByVendorId.get(String(vendor._id)),
  });
};

const getByOwnerUserId = async (ownerUserId) => {
  const vendor = await Vendor.findOne({ ownerUserId, deletedAt: null }).lean();

  if (!vendor) {
    throw new ApiError('Vendor profile not found for this account.', 404);
  }

  const startingPricesByVendorId = await getStartingPricesByVendorId([vendor._id]);
  return toPublicVendor(vendor, {
    startingPrice: startingPricesByVendorId.get(String(vendor._id)),
  });
};

const resolveMapLink = async (link) => {
  const resolvedUrl = await resolveGoogleMapsUrl(link);
  const latLng = parseGoogleMapsCoordinates(resolvedUrl);

  if (!latLng) {
    throw new ApiError('Could not extract coordinates from this Google Maps link.', 400);
  }

  return {
    resolvedUrl,
    coordinates: [latLng[1], latLng[0]],
  };
};

const createForOwner = async (ownerUserId, payload) => {
  const existing = await Vendor.findOne({ ownerUserId, deletedAt: null }).lean();

  if (existing) {
    throw new ApiError('Vendor profile already exists for this account.', 409);
  }

  const images = await buildVendorImagesRecord(payload.images, payload.image, payload.displayName, []);

  const vendor = await Vendor.create({
    ownerUserId,
    displayName: payload.displayName,
    image: null,
    images: images || [],
    legalBusinessName: payload.legalBusinessName,
    description: payload.description,
    workingHours: normalizeWorkingHours(payload.workingHours) || [],
    blackoutSlots: normalizeBlackoutSlots(payload.blackoutSlots) || [],
    categories: payload.categories || [],
    timezone: ADDIS_TIMEZONE,
    status: 'active',
    location: {
      countryCode: payload.location.countryCode,
      city: payload.location.city,
      addressLine1: payload.location.addressLine1,
      addressLine2: payload.location.addressLine2,
      description: payload.location.description,
      coordinates: {
        type: 'Point',
        coordinates: payload.location.coordinates || [0, 0],
      },
    },
  });

  const startingPricesByVendorId = await getStartingPricesByVendorId([vendor._id]);
  return toPublicVendor(vendor, {
    startingPrice: startingPricesByVendorId.get(String(vendor._id)),
  });
};

const updateForOwner = async (ownerUserId, payload) => {
  const vendor = await Vendor.findOne({ ownerUserId, deletedAt: null });

  if (!vendor) {
    throw new ApiError('Vendor profile not found for this account.', 404);
  }

  const fields = [
    'displayName',
    'legalBusinessName',
    'description',
    'categories',
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      vendor[field] = payload[field];
    }
  }

  if (payload.images !== undefined || payload.image !== undefined) {
    vendor.images = await buildVendorImagesRecord(
      payload.images,
      payload.image,
      payload.displayName || vendor.displayName,
      getVendorImages(vendor),
      { append: payload.images !== undefined }
    );
    vendor.image = null;
  }

  if (payload.workingHours !== undefined) {
    vendor.workingHours = normalizeWorkingHours(payload.workingHours);
  }

  if (payload.blackoutSlots !== undefined) {
    vendor.blackoutSlots = normalizeBlackoutSlots(payload.blackoutSlots);
  }

  vendor.timezone = ADDIS_TIMEZONE;

  if (payload.location) {
    vendor.location = {
      ...vendor.location,
      ...payload.location,
      coordinates: payload.location.coordinates
        ? { type: 'Point', coordinates: payload.location.coordinates }
        : vendor.location.coordinates,
    };
  }

  await vendor.save();
  const startingPricesByVendorId = await getStartingPricesByVendorId([vendor._id]);
  return toPublicVendor(vendor, {
    startingPrice: startingPricesByVendorId.get(String(vendor._id)),
  });
};

module.exports = {
  list,
  getById,
  getByOwnerUserId,
  resolveMapLink,
  createForOwner,
  updateForOwner,
};
