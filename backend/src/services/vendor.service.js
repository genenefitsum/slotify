const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const { Vendor } = require('../models/Vendor');

const toPublicVendor = (vendorDoc) => ({
  id: String(vendorDoc._id),
  displayName: vendorDoc.displayName,
  legalBusinessName: vendorDoc.legalBusinessName || null,
  description: vendorDoc.description || '',
  categories: vendorDoc.categories || [],
  timezone: vendorDoc.timezone,
  location: vendorDoc.location,
  averageRating: vendorDoc.averageRating,
  reviewCount: vendorDoc.reviewCount,
  status: vendorDoc.status,
  createdAt: vendorDoc.createdAt,
  updatedAt: vendorDoc.updatedAt,
});

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
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

  return {
    items: items.map(toPublicVendor),
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

  return toPublicVendor(vendor);
};

const getByOwnerUserId = async (ownerUserId) => {
  const vendor = await Vendor.findOne({ ownerUserId, deletedAt: null }).lean();

  if (!vendor) {
    throw new ApiError('Vendor profile not found for this account.', 404);
  }

  return toPublicVendor(vendor);
};

const createForOwner = async (ownerUserId, payload) => {
  const existing = await Vendor.findOne({ ownerUserId, deletedAt: null }).lean();

  if (existing) {
    throw new ApiError('Vendor profile already exists for this account.', 409);
  }

  const vendor = await Vendor.create({
    ownerUserId,
    displayName: payload.displayName,
    legalBusinessName: payload.legalBusinessName,
    description: payload.description,
    categories: payload.categories || [],
    timezone: payload.timezone,
    location: {
      countryCode: payload.location.countryCode,
      city: payload.location.city,
      addressLine1: payload.location.addressLine1,
      addressLine2: payload.location.addressLine2,
      coordinates: {
        type: 'Point',
        coordinates: payload.location.coordinates || [0, 0],
      },
    },
  });

  return toPublicVendor(vendor);
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
    'timezone',
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      vendor[field] = payload[field];
    }
  }

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
  return toPublicVendor(vendor);
};

module.exports = {
  list,
  getById,
  getByOwnerUserId,
  createForOwner,
  updateForOwner,
};
