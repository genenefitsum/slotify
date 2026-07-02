const mongoose = require('mongoose');

const ApiError = require('../utils/apiError');
const { Booking } = require('../models/Booking');
const { BookingEvent } = require('../models/BookingEvent');
const { Service } = require('../models/Service');
const { Vendor } = require('../models/Vendor');
const { Staff } = require('../models/Staff');
const { User } = require('../models/User');
const {
  ADDIS_TIMEZONE,
  ACTIVE_BOOKING_CONFLICT_STATUSES,
  ensureVendorAvailable,
  listAvailableSlotsByVendorService,
} = require('../modules/availability/availability.service');

const TRANSITION_RULES = {
  confirm: { from: ['pending_payment'], to: 'confirmed', eventType: 'booking_confirmed' },
  start: { from: ['confirmed'], to: 'in_service', eventType: 'booking_started' },
  complete: { from: ['in_service'], to: 'completed', eventType: 'booking_completed' },
  cancel: { from: ['pending_payment', 'confirmed'], to: 'cancelled', eventType: 'booking_cancelled' },
  noShow: { from: ['confirmed'], to: 'no_show', eventType: 'booking_no_show' },
};

const ensureObjectId = (value, label) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(`Invalid ${label}.`, 400);
  }
};

const roundMoney = (value) => Math.round(value * 100) / 100;

const computeDeposit = (service) => {
  if (service.depositType === 'fixed') {
    return roundMoney(service.depositValue);
  }

  if (service.depositType === 'percentage') {
    return roundMoney((service.priceAmount * service.depositValue) / 100);
  }

  return 0;
};

const createBookingNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BK-${ts}-${rand}`;
};


const toBookingDto = (doc, details = {}) => ({
  id: String(doc._id),
  bookingNumber: doc.bookingNumber,
  customerUserId: String(doc.customerUserId),
  customerName: details.customerName || null,
  customerEmail: details.customerEmail || null,
  vendorId: String(doc.vendorId),
  vendorName: details.vendorName || null,
  staffId: doc.staffId ? String(doc.staffId) : null,
  serviceId: String(doc.serviceId),
  serviceName: details.serviceName || null,
  serviceDurationMinutes: details.serviceDurationMinutes ?? null,
  startsAtUtc: doc.startsAtUtc,
  endsAtUtc: doc.endsAtUtc,
  localTimezone: doc.localTimezone,
  pricingSnapshot: doc.pricingSnapshot,
  status: doc.status,
  customerNotes: doc.customerNotes || '',
  cancellation: doc.cancellation,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const enrichBookings = async (docs) => {
  if (!docs.length) {
    return [];
  }

  const vendorIds = [...new Set(docs.map((doc) => String(doc.vendorId)))];
  const serviceIds = [...new Set(docs.map((doc) => String(doc.serviceId)))];
  const customerIds = [...new Set(docs.map((doc) => String(doc.customerUserId)))];

  const [vendors, services, customers] = await Promise.all([
    Vendor.find({ _id: { $in: vendorIds }, deletedAt: null }).select({ displayName: 1 }).lean(),
    Service.find({ _id: { $in: serviceIds }, deletedAt: null })
      .select({ name: 1, durationMinutes: 1 })
      .lean(),
    User.find({ _id: { $in: customerIds } })
      .select({ firstName: 1, lastName: 1, email: 1 })
      .lean(),
  ]);

  const vendorMap = new Map(vendors.map((vendor) => [String(vendor._id), vendor]));
  const serviceMap = new Map(services.map((service) => [String(service._id), service]));
  const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));

  return docs.map((doc) => {
    const vendor = vendorMap.get(String(doc.vendorId));
    const service = serviceMap.get(String(doc.serviceId));
    const customer = customerMap.get(String(doc.customerUserId));

    return toBookingDto(doc, {
      vendorName: vendor?.displayName || null,
      serviceName: service?.name || null,
      serviceDurationMinutes: service?.durationMinutes ?? null,
      customerName: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : null,
      customerEmail: customer?.email || null,
    });
  });
};

const createEvent = async ({ bookingId, vendorId, actorUserId, eventType, metadata }) => {
  await BookingEvent.create({
    bookingId,
    vendorId,
    actorUserId,
    eventType,
    metadata: metadata || {},
  });
};

const getManagedVendorIds = async (user) => {
  if (user.role === 'admin') {
    return null;
  }

  if (user.role === 'vendor_owner') {
    const vendor = await Vendor.findOne({ ownerUserId: user.id, deletedAt: null }).lean();
    return vendor ? [String(vendor._id)] : [];
  }

  if (user.role === 'vendor_staff') {
    const staffRows = await Staff.find({
      linkedUserId: user.id,
      status: 'active',
      deletedAt: null,
    })
      .select({ vendorId: 1 })
      .lean();

    return [...new Set(staffRows.map((row) => String(row.vendorId)))];
  }

  return [];
};

const ensureBookingAccess = async (booking, user) => {
  if (user.role === 'admin') {
    return;
  }

  if (user.role === 'customer') {
    if (String(booking.customerUserId) !== user.id) {
      throw new ApiError('Booking not found.', 404);
    }
    return;
  }

  const managedVendorIds = await getManagedVendorIds(user);

  if (!managedVendorIds.includes(String(booking.vendorId))) {
    throw new ApiError('Booking not found.', 404);
  }
};

const list = async (user, { status, page = 1, limit = 20 }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (normalizedPage - 1) * normalizedLimit;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  if (user.role === 'customer') {
    filter.customerUserId = user.id;
  } else {
    const managedVendorIds = await getManagedVendorIds(user);
    if (managedVendorIds !== null) {
      if (managedVendorIds.length === 0) {
        return {
          items: [],
          pagination: {
            page: normalizedPage,
            limit: normalizedLimit,
            total: 0,
            totalPages: 1,
          },
        };
      }
      filter.vendorId = { $in: managedVendorIds };
    }
  }

  const [items, total] = await Promise.all([
    Booking.find(filter).sort({ startsAtUtc: 1 }).skip(skip).limit(normalizedLimit).lean(),
    Booking.countDocuments(filter),
  ]);

  return {
    items: await enrichBookings(items),
    pagination: {
      page: normalizedPage,
      limit: normalizedLimit,
      total,
      totalPages: Math.max(Math.ceil(total / normalizedLimit), 1),
    },
  };
};

const listAvailableSlots = async (_user, { vendorId, serviceId, localDate }) => {
  return listAvailableSlotsByVendorService({
    vendorId,
    serviceId,
    localDate,
  });
};

const create = async (user, payload) => {
  if (user.role !== 'customer' && user.role !== 'admin') {
    throw new ApiError('Only customers can create bookings.', 403);
  }

  ensureObjectId(payload.serviceId, 'service id');
  const startsAtUtc = new Date(payload.startsAtUtc);

  if (Number.isNaN(startsAtUtc.getTime())) {
    throw new ApiError('Invalid startsAtUtc.', 400);
  }

  const service = await Service.findOne({
    _id: payload.serviceId,
    isActive: true,
    deletedAt: null,
  }).lean();

  if (!service) {
    throw new ApiError('Service not found.', 404);
  }

  const vendor = await Vendor.findOne({
    _id: service.vendorId,
    deletedAt: null,
    status: 'active',
  }).lean();

  if (!vendor) {
    throw new ApiError('Vendor not found.', 404);
  }

  if (payload.staffId) {
    ensureObjectId(payload.staffId, 'staff id');
    const staff = await Staff.findOne({
      _id: payload.staffId,
      vendorId: service.vendorId,
      status: 'active',
      deletedAt: null,
    }).lean();

    if (!staff) {
      throw new ApiError('Staff member not found for this service vendor.', 400);
    }
  }

  const endsAtUtc = new Date(startsAtUtc.getTime() + service.durationMinutes * 60 * 1000);
  ensureVendorAvailable({ vendor, startsAtUtc, endsAtUtc });

  const conflictFilter = {
    vendorId: service.vendorId,
    status: { $in: ACTIVE_BOOKING_CONFLICT_STATUSES },
    startsAtUtc: { $lt: endsAtUtc },
    endsAtUtc: { $gt: startsAtUtc },
  };

  if (payload.staffId) {
    conflictFilter.$or = [{ staffId: payload.staffId }, { staffId: null }];
  }

  const conflicting = await Booking.findOne(conflictFilter).lean();
  if (conflicting) {
    throw new ApiError('Selected time slot is not available.', 409);
  }

  const commissionAmount = roundMoney(service.priceAmount * 0.1);
  const depositAmount = computeDeposit(service);
  const netPayableToVendor = roundMoney(service.priceAmount - commissionAmount);

  let booking;
  let tries = 0;
  while (!booking && tries < 5) {
    tries += 1;
    try {
      booking = await Booking.create({
        bookingNumber: createBookingNumber(),
        customerUserId: user.id,
        vendorId: service.vendorId,
        staffId: payload.staffId || null,
        serviceId: service._id,
        startsAtUtc,
        endsAtUtc,
        localTimezone: ADDIS_TIMEZONE,
        pricingSnapshot: {
          currency: service.currency,
          servicePriceAmount: service.priceAmount,
          depositAmount,
          commissionAmount,
          netPayableToVendor,
        },
        status: 'pending_payment',
        customerNotes: payload.customerNotes,
      });
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }
    }
  }

  if (!booking) {
    throw new ApiError('Unable to create booking number. Please try again.', 500);
  }

  await createEvent({
    bookingId: booking._id,
    vendorId: booking.vendorId,
    actorUserId: user.id,
    eventType: 'booking_created',
    metadata: {
      status: booking.status,
      depositAmount,
      serviceId: String(service._id),
    },
  });

  return (await enrichBookings([booking]))[0];
};

const transition = async ({ bookingId, action, actor, reasonCode, reasonText }) => {
  ensureObjectId(bookingId, 'booking id');
  const rule = TRANSITION_RULES[action];

  if (!rule) {
    throw new ApiError('Invalid booking action.', 400);
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError('Booking not found.', 404);
  }

  await ensureBookingAccess(booking, actor);

  const role = actor.role;
  const isVendorSide = role === 'admin' || role === 'vendor_owner' || role === 'vendor_staff';
  if (['confirm', 'start', 'complete', 'noShow'].includes(action) && !isVendorSide) {
    throw new ApiError('You are not allowed to perform this transition.', 403);
  }

  if (action === 'cancel' && role === 'customer' && String(booking.customerUserId) !== actor.id) {
    throw new ApiError('You are not allowed to cancel this booking.', 403);
  }

  if (!rule.from.includes(booking.status)) {
    throw new ApiError(`Cannot ${action} a booking in ${booking.status} status.`, 409);
  }

  booking.status = rule.to;
  booking.version += 1;

  if (action === 'cancel') {
    booking.cancellation = {
      cancelledAt: new Date(),
      cancelledByUserId: actor.id,
      reasonCode: reasonCode || null,
      reasonText: reasonText || null,
    };
  }

  await booking.save();

  await createEvent({
    bookingId: booking._id,
    vendorId: booking.vendorId,
    actorUserId: actor.id,
    eventType: rule.eventType,
    metadata: {
      fromStatus: rule.from,
      toStatus: rule.to,
      reasonCode: reasonCode || null,
      reasonText: reasonText || null,
    },
  });

  return (await enrichBookings([booking]))[0];
};

module.exports = {
  list,
  listAvailableSlots,
  create,
  transition,
};
