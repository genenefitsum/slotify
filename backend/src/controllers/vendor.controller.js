const ApiError = require('../utils/apiError');
const vendorService = require('../services/vendor.service');

const validateCreateVendorPayload = (payload = {}) => {
  if (!payload.displayName) {
    throw new ApiError('displayName is required.', 400);
  }

  if (!payload.location?.countryCode || !payload.location?.city) {
    throw new ApiError('location.countryCode and location.city are required.', 400);
  }
};

const listVendors = async (req, res, next) => {
  try {
    const data = await vendorService.list(req.query || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getVendorById = async (req, res, next) => {
  try {
    const data = await vendorService.getById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const getMyVendor = async (req, res, next) => {
  try {
    const data = await vendorService.getByOwnerUserId(req.user.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const resolveMapLink = async (req, res, next) => {
  try {
    const data = await vendorService.resolveMapLink(req.body?.link);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const createVendor = async (req, res, next) => {
  try {
    validateCreateVendorPayload(req.body);
    const data = await vendorService.createForOwner(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const updateMyVendor = async (req, res, next) => {
  try {
    const data = await vendorService.updateForOwner(req.user.id, req.body || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listVendors,
  getVendorById,
  getMyVendor,
  resolveMapLink,
  createVendor,
  updateMyVendor,
};
