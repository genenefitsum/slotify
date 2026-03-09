const ApiError = require('../utils/apiError');
const serviceService = require('../services/service.service');

const validateCreateServicePayload = (payload = {}) => {
  const required = ['name', 'durationMinutes', 'priceAmount', 'currency'];

  for (const field of required) {
    if (payload[field] === undefined || payload[field] === null || payload[field] === '') {
      throw new ApiError(`${field} is required.`, 400);
    }
  }
};

const listServices = async (req, res, next) => {
  try {
    const data = await serviceService.listPublic(req.query || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    validateCreateServicePayload(req.body);
    const data = await serviceService.createForOwner(req.user.id, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const data = await serviceService.updateForOwner(req.user.id, req.params.id, req.body || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const data = await serviceService.removeForOwner(req.user.id, req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listServices,
  createService,
  updateService,
  deleteService,
};
