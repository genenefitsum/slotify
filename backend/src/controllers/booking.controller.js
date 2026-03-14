const ApiError = require('../utils/apiError');
const bookingService = require('../services/booking.service');

const validateCreatePayload = (payload = {}) => {
  if (!payload.serviceId) {
    throw new ApiError('serviceId is required.', 400);
  }

  if (!payload.startsAtUtc) {
    throw new ApiError('startsAtUtc is required.', 400);
  }
};

const listBookings = async (req, res, next) => {
  try {
    const data = await bookingService.list(req.user, req.query || {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const listAvailableSlots = async (req, res, next) => {
  try {
    const { vendorId, serviceId, localDate } = req.query || {};

    if (!vendorId) {
      throw new ApiError('vendorId is required.', 400);
    }

    if (!serviceId) {
      throw new ApiError('serviceId is required.', 400);
    }

    if (!localDate) {
      throw new ApiError('localDate is required.', 400);
    }

    const data = await bookingService.listAvailableSlots(req.user, {
      vendorId,
      serviceId,
      localDate,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    validateCreatePayload(req.body);
    const data = await bookingService.create(req.user, req.body);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

const confirmBooking = async (req, res, next) => {
  try {
    const data = await bookingService.transition({
      bookingId: req.params.id,
      action: 'confirm',
      actor: req.user,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const startBooking = async (req, res, next) => {
  try {
    const data = await bookingService.transition({
      bookingId: req.params.id,
      action: 'start',
      actor: req.user,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const completeBooking = async (req, res, next) => {
  try {
    const data = await bookingService.transition({
      bookingId: req.params.id,
      action: 'complete',
      actor: req.user,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const data = await bookingService.transition({
      bookingId: req.params.id,
      action: 'cancel',
      actor: req.user,
      reasonCode: req.body?.reasonCode,
      reasonText: req.body?.reasonText,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

const markNoShow = async (req, res, next) => {
  try {
    const data = await bookingService.transition({
      bookingId: req.params.id,
      action: 'noShow',
      actor: req.user,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAvailableSlots,
  listBookings,
  createBooking,
  confirmBooking,
  startBooking,
  completeBooking,
  cancelBooking,
  markNoShow,
};
