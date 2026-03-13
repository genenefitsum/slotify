const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
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
const GOOGLE_MAPS_REDIRECT_LIMIT = 5;
const GOOGLE_MAPS_RESOLVE_TIMEOUT_MS = 8000;

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

const toImageUrl = (image) => {
  if (!image?.data || !image?.contentType) {
    return null;
  }

  return `data:${image.contentType};base64,${Buffer.from(image.data).toString('base64')}`;
};

const toPublicVendor = (vendorDoc, details = {}) => ({
  id: String(vendorDoc._id),
  displayName: vendorDoc.displayName,
  legalBusinessName: vendorDoc.legalBusinessName || null,
  description: vendorDoc.description || '',
  imageUrl: toImageUrl(vendorDoc.image),
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

const normalizeImagePayload = (image) => {
  if (image === undefined) {
    return undefined;
  }

  if (image === null) {
    return null;
  }

  if (!image || typeof image !== 'object') {
    throw new ApiError('Invalid vendor image payload.', 400);
  }

  if (!image.data || !image.contentType) {
    throw new ApiError('Vendor image data and contentType are required.', 400);
  }

  if (!ALLOWED_IMAGE_CONTENT_TYPES.has(image.contentType)) {
    throw new ApiError('Unsupported vendor image content type.', 400);
  }

  const base64Payload = String(image.data).includes(',')
    ? String(image.data).split(',').pop()
    : String(image.data);

  const buffer = Buffer.from(base64Payload, 'base64');

  if (!buffer.length) {
    throw new ApiError('Vendor image data is empty.', 400);
  }

  if (buffer.length > MAX_VENDOR_IMAGE_BYTES) {
    throw new ApiError('Vendor image must be 2MB or less.', 400);
  }

  return {
    data: buffer,
    contentType: image.contentType,
  };
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

const list = async ({ city, category, page = 1, limit = 20 }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (normalizedPage - 1) * normalizedLimit;

  const filter = {
    deletedAt: null,
    status: 'active',
  };

  if (city) {
    filter['location.city'] = city;
  }

  if (category) {
    filter.categories = category;
  }

  const [items, total] = await Promise.all([
    Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(normalizedLimit).lean(),
    Vendor.countDocuments(filter),
  ]);

  const startingPricesByVendorId = await getStartingPricesByVendorId(items.map((item) => item._id));

  return {
    items: items.map((item) =>
      toPublicVendor(item, { startingPrice: startingPricesByVendorId.get(String(item._id)) })
    ),
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / normalizedLimit), 1),
    },
  };
};

const getById = async (id) => {
  ensureObjectId(id, 'vendor id');

  const vendor = await Vendor.findOne({
    _id: id,
    deletedAt: null,
    status: 'active',
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

  const vendor = await Vendor.create({
    ownerUserId,
    displayName: payload.displayName,
    image: normalizeImagePayload(payload.image),
    legalBusinessName: payload.legalBusinessName,
    description: payload.description,
    workingHours: normalizeWorkingHours(payload.workingHours) || [],
    blackoutSlots: normalizeBlackoutSlots(payload.blackoutSlots) || [],
    categories: payload.categories || [],
    timezone: ADDIS_TIMEZONE,
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

  if (payload.image !== undefined) {
    vendor.image = normalizeImagePayload(payload.image);
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
