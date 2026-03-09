const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const { Service } = require('../models/Service');
const { Vendor } = require('../models/Vendor');

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
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
  await service.save();

  return { success: true };
};

module.exports = {
  listPublic,
  createForOwner,
  updateForOwner,
  removeForOwner,
};
