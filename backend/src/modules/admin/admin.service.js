const ApiError = require('../../utils/apiError');
const { User } = require('../../models/User');
const { Vendor } = require('../../models/Vendor');
const { Booking } = require('../../models/Booking');
const { Review } = require('../../models/Review');
const { Transaction } = require('../../models/Transaction');
const { Service } = require('../../models/Service');
const { CommissionPlan } = require('../../models/CommissionPlan');
const bookingService = require('../../services/booking.service');
const {
	parsePagination,
	assertObjectId,
	ensureEnum,
	ensureDate,
	USER_ROLES,
	USER_STATUSES,
	VENDOR_STATUSES,
	BOOKING_STATUSES,
} = require('./admin.validator');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toUserDto = (doc) => ({
	id: String(doc._id),
	email: doc.email,
	firstName: doc.firstName,
	lastName: doc.lastName || '',
	fullName: `${doc.firstName || ''} ${doc.lastName || ''}`.trim(),
	role: doc.role,
	status: doc.status,
	provider: doc.provider,
	phone: doc.phone || null,
	lastLoginAt: doc.lastLoginAt || null,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

const toVendorAdminDto = (doc, ownerUser = null) => ({
	id: String(doc._id),
	ownerUserId: String(doc.ownerUserId),
	owner: ownerUser
		? {
			id: String(ownerUser._id),
			email: ownerUser.email,
			fullName: `${ownerUser.firstName || ''} ${ownerUser.lastName || ''}`.trim(),
		}
		: null,
	displayName: doc.displayName,
	legalBusinessName: doc.legalBusinessName || null,
	status: doc.status,
	categories: doc.categories || [],
	city: doc.location?.city || null,
	countryCode: doc.location?.countryCode || null,
	averageRating: Number(doc.averageRating || 0),
	reviewCount: Number(doc.reviewCount || 0),
	commissionPlanCode: doc.commissionPlanCode || 'default',
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

const toBookingAdminDto = (doc, details = {}) => ({
	id: String(doc._id),
	bookingNumber: doc.bookingNumber,
	status: doc.status,
	vendorId: String(doc.vendorId),
	vendorName: details.vendorName || null,
	customerUserId: String(doc.customerUserId),
	customerName: details.customerName || null,
	customerEmail: details.customerEmail || null,
	serviceId: String(doc.serviceId),
	serviceName: details.serviceName || null,
	startsAtUtc: doc.startsAtUtc,
	endsAtUtc: doc.endsAtUtc,
	localTimezone: doc.localTimezone,
	pricingSnapshot: doc.pricingSnapshot,
	cancellation: doc.cancellation,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

const getStatusBreakdown = async (Model, match) => {
	const rows = await Model.aggregate([
		{ $match: match },
		{ $group: { _id: '$status', count: { $sum: 1 } } },
	]);

	return rows.reduce((acc, row) => {
		if (row && row._id) {
			acc[row._id] = row.count;
		}
		return acc;
	}, {});
};

const buildDateBuckets = (days) => {
	const end = new Date();
	end.setUTCHours(0, 0, 0, 0);
	const start = new Date(end);
	start.setUTCDate(start.getUTCDate() - (days - 1));

	const buckets = [];
	for (let i = 0; i < days; i += 1) {
		const cursor = new Date(start);
		cursor.setUTCDate(start.getUTCDate() + i);
		buckets.push(cursor.toISOString().slice(0, 10));
	}

	return {
		start,
		end,
		buckets,
	};
};

const getOverview = async ({ days = 14 } = {}) => {
	const trendDays = Math.min(Math.max(Number(days) || 14, 7), 90);
	const { start, buckets } = buildDateBuckets(trendDays);

	const [
		usersTotal,
		vendorsTotal,
		bookingsTotal,
		usersByStatus,
		vendorsByStatus,
		bookingsByStatus,
		avgRatingRow,
		platformRevenueRow,
		payoutRow,
		bookingTrends,
		platformRevenueTrends,
	] = await Promise.all([
		User.countDocuments({ deletedAt: null }),
		Vendor.countDocuments({ deletedAt: null }),
		Booking.countDocuments({}),
		getStatusBreakdown(User, { deletedAt: null }),
		getStatusBreakdown(Vendor, { deletedAt: null }),
		getStatusBreakdown(Booking, {}),
		Review.aggregate([
			{ $match: { status: 'published' } },
			{ $group: { _id: null, value: { $avg: '$rating' } } },
		]),
		Transaction.aggregate([
			{ $match: { type: 'platform_fee_accrual' } },
			{ $group: { _id: null, value: { $sum: '$amount' } } },
		]),
		Transaction.aggregate([
			{ $match: { type: 'payout' } },
			{ $group: { _id: null, value: { $sum: '$amount' } } },
		]),
		Booking.aggregate([
			{ $match: { createdAt: { $gte: start } } },
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
					bookings: { $sum: 1 },
					completedBookings: {
						$sum: {
							$cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
						},
					},
				},
			},
		]),
		Transaction.aggregate([
			{
				$match: {
					type: 'platform_fee_accrual',
					postedAt: { $gte: start },
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$postedAt' } },
					platformRevenue: { $sum: '$amount' },
				},
			},
		]),
	]);

	const bookingsByDate = new Map(bookingTrends.map((item) => [item._id, item]));
	const revenueByDate = new Map(platformRevenueTrends.map((item) => [item._id, item]));

	const trends = buckets.map((date) => ({
		date,
		bookings: bookingsByDate.get(date)?.bookings || 0,
		completedBookings: bookingsByDate.get(date)?.completedBookings || 0,
		platformRevenue: Number(revenueByDate.get(date)?.platformRevenue || 0),
	}));

	return {
		usersTotal,
		vendorsTotal,
		bookingsTotal,
		usersByStatus,
		vendorsByStatus,
		bookingsByStatus,
		financials: {
			platformRevenueTotal: Number(platformRevenueRow[0]?.value || 0),
			payoutsTotal: Number(payoutRow[0]?.value || 0),
		},
		quality: {
			averageRating: Number(avgRatingRow[0]?.value || 0),
		},
		queues: {
			vendorsPendingVerification: Number(vendorsByStatus.pending_verification || 0),
			bookingsPendingPayment: Number(bookingsByStatus.pending_payment || 0),
			bookingsConfirmed: Number(bookingsByStatus.confirmed || 0),
		},
		trends,
	};
};

const listUsers = async (query = {}) => {
	const { page, limit, skip } = parsePagination(query);
	const role = ensureEnum(query.role, USER_ROLES, 'user role');
	const status = ensureEnum(query.status, USER_STATUSES, 'user status');
	const search = String(query.search || '').trim();

	const filter = { deletedAt: null };
	if (role) {
		filter.role = role;
	}
	if (status) {
		filter.status = status;
	}
	if (search) {
		const pattern = new RegExp(escapeRegex(search), 'i');
		filter.$or = [
			{ email: pattern },
			{ firstName: pattern },
			{ lastName: pattern },
		];
	}

	const [items, total] = await Promise.all([
		User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		User.countDocuments(filter),
	]);

	return {
		items: items.map(toUserDto),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(Math.ceil(total / limit), 1),
		},
	};
};

const updateUserStatus = async ({ userId, nextStatus, actorUserId }) => {
	assertObjectId(userId, 'user id');

	const user = await User.findOne({ _id: userId, deletedAt: null });
	if (!user) {
		throw new ApiError('User not found.', 404);
	}

	if (String(user._id) === String(actorUserId)) {
		throw new ApiError('Admin cannot change their own account status.', 400);
	}

	if (user.role === 'admin') {
		throw new ApiError('Changing another admin account status is not allowed.', 403);
	}

	user.status = nextStatus;
	await user.save();

	return toUserDto(user);
};

const listVendors = async (query = {}) => {
	const { page, limit, skip } = parsePagination(query);
	const status = ensureEnum(query.status, VENDOR_STATUSES, 'vendor status');
	const category = String(query.category || '').trim();
	const city = String(query.city || '').trim();
	const search = String(query.search || '').trim();

	const filter = { deletedAt: null };
	if (status) {
		filter.status = status;
	}
	if (category) {
		filter.categories = category;
	}
	if (city) {
		filter['location.city'] = new RegExp(`^${escapeRegex(city)}$`, 'i');
	}
	if (search) {
		const pattern = new RegExp(escapeRegex(search), 'i');
		filter.$or = [
			{ displayName: pattern },
			{ legalBusinessName: pattern },
		];
	}

	const [vendors, total] = await Promise.all([
		Vendor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
		Vendor.countDocuments(filter),
	]);

	const ownerIds = [...new Set(vendors.map((vendor) => String(vendor.ownerUserId)))];
	const owners = await User.find({ _id: { $in: ownerIds } })
		.select({ email: 1, firstName: 1, lastName: 1 })
		.lean();
	const ownerMap = new Map(owners.map((owner) => [String(owner._id), owner]));

	return {
		items: vendors.map((vendor) => toVendorAdminDto(vendor, ownerMap.get(String(vendor.ownerUserId)) || null)),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(Math.ceil(total / limit), 1),
		},
	};
};

const updateVendorStatus = async ({ vendorId, nextStatus }) => {
	assertObjectId(vendorId, 'vendor id');

	const vendor = await Vendor.findOne({ _id: vendorId, deletedAt: null });
	if (!vendor) {
		throw new ApiError('Vendor not found.', 404);
	}

	vendor.status = nextStatus;
	await vendor.save();

	return toVendorAdminDto(vendor);
};

const listBookings = async (query = {}) => {
	const { page, limit, skip } = parsePagination(query);
	const status = ensureEnum(query.status, BOOKING_STATUSES, 'booking status');
	const fromDate = ensureDate(query.fromDate, 'fromDate');
	const toDate = ensureDate(query.toDate, 'toDate');
	const vendorId = query.vendorId ? String(query.vendorId) : null;
	const customerUserId = query.customerUserId ? String(query.customerUserId) : null;

	const filter = {};
	if (status) {
		filter.status = status;
	}
	if (vendorId) {
		assertObjectId(vendorId, 'vendor id');
		filter.vendorId = vendorId;
	}
	if (customerUserId) {
		assertObjectId(customerUserId, 'customer user id');
		filter.customerUserId = customerUserId;
	}
	if (fromDate || toDate) {
		filter.startsAtUtc = {};
		if (fromDate) {
			filter.startsAtUtc.$gte = fromDate;
		}
		if (toDate) {
			filter.startsAtUtc.$lte = toDate;
		}
	}

	const [items, total] = await Promise.all([
		Booking.find(filter).sort({ startsAtUtc: -1 }).skip(skip).limit(limit).lean(),
		Booking.countDocuments(filter),
	]);

	const vendorIds = [...new Set(items.map((item) => String(item.vendorId)))];
	const serviceIds = [...new Set(items.map((item) => String(item.serviceId)))];
	const customerIds = [...new Set(items.map((item) => String(item.customerUserId)))];

	const [vendors, services, customers] = await Promise.all([
		Vendor.find({ _id: { $in: vendorIds } }).select({ displayName: 1 }).lean(),
		Service.find({ _id: { $in: serviceIds } }).select({ name: 1 }).lean(),
		User.find({ _id: { $in: customerIds } })
			.select({ firstName: 1, lastName: 1, email: 1 })
			.lean(),
	]);

	const vendorMap = new Map(vendors.map((vendor) => [String(vendor._id), vendor]));
	const serviceMap = new Map(services.map((service) => [String(service._id), service]));
	const customerMap = new Map(customers.map((customer) => [String(customer._id), customer]));

	return {
		items: items.map((item) => {
			const customer = customerMap.get(String(item.customerUserId));
			return toBookingAdminDto(item, {
				vendorName: vendorMap.get(String(item.vendorId))?.displayName || null,
				serviceName: serviceMap.get(String(item.serviceId))?.name || null,
				customerName: customer ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() : null,
				customerEmail: customer?.email || null,
			});
		}),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(Math.ceil(total / limit), 1),
		},
	};
};

const runBookingAction = async ({ bookingId, action, actor, reasonCode, reasonText }) => {
	const actionMap = {
		confirm: 'confirm',
		start: 'start',
		complete: 'complete',
		cancel: 'cancel',
		noShow: 'noShow',
	};

	const transitionAction = actionMap[action];
	if (!transitionAction) {
		throw new ApiError('Invalid booking action.', 400);
	}

	return bookingService.transition({
		bookingId,
		action: transitionAction,
		actor,
		reasonCode,
		reasonText,
	});
};

const toCommissionDto = (doc) => ({
	id: String(doc._id),
	code: doc.code,
	name: doc.name,
	type: doc.type,
	value: doc.value,
	minFeeAmount: doc.minFeeAmount,
	maxFeeAmount: doc.maxFeeAmount,
	currency: doc.currency,
	isDefault: doc.isDefault,
	activeFrom: doc.activeFrom,
	activeTo: doc.activeTo,
	createdAt: doc.createdAt,
	updatedAt: doc.updatedAt,
});

const listCommissionPlans = async (query = {}) => {
	const { page, limit, skip } = parsePagination(query);

	const [items, total] = await Promise.all([
		CommissionPlan.find({}).sort({ activeFrom: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
		CommissionPlan.countDocuments({}),
	]);

	return {
		items: items.map(toCommissionDto),
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.max(Math.ceil(total / limit), 1),
		},
	};
};

const createCommissionPlan = async (payload = {}) => {
	const normalizedPayload = {
		code: String(payload.code || '').trim(),
		name: String(payload.name || '').trim(),
		type: payload.type || 'percentage',
		value: Number(payload.value),
		minFeeAmount: payload.minFeeAmount === undefined ? 0 : Number(payload.minFeeAmount),
		maxFeeAmount:
			payload.maxFeeAmount === undefined || payload.maxFeeAmount === null || payload.maxFeeAmount === ''
				? null
				: Number(payload.maxFeeAmount),
		currency: String(payload.currency || '').trim().toUpperCase(),
		isDefault: Boolean(payload.isDefault),
		activeFrom: payload.activeFrom ? new Date(payload.activeFrom) : new Date(),
		activeTo: payload.activeTo ? new Date(payload.activeTo) : null,
	};

	if (normalizedPayload.isDefault) {
		await CommissionPlan.updateMany({ isDefault: true }, { $set: { isDefault: false } });
	}

	const created = await CommissionPlan.create(normalizedPayload);
	return toCommissionDto(created);
};

const updateCommissionPlan = async (commissionId, payload = {}) => {
	assertObjectId(commissionId, 'commission plan id');

	const plan = await CommissionPlan.findById(commissionId);
	if (!plan) {
		throw new ApiError('Commission plan not found.', 404);
	}

	const updatableFields = [
		'name',
		'type',
		'value',
		'minFeeAmount',
		'maxFeeAmount',
		'currency',
		'activeFrom',
		'activeTo',
		'isDefault',
	];

	updatableFields.forEach((field) => {
		if (payload[field] !== undefined) {
			plan[field] = payload[field];
		}
	});

	if (payload.currency !== undefined) {
		plan.currency = String(payload.currency || '').toUpperCase();
	}

	if (payload.isDefault === true) {
		await CommissionPlan.updateMany(
			{ _id: { $ne: plan._id }, isDefault: true },
			{ $set: { isDefault: false } }
		);
	}

	await plan.save();
	return toCommissionDto(plan);
};

const activateCommissionPlan = async (commissionId, { setDefault = false } = {}) => {
	assertObjectId(commissionId, 'commission plan id');

	const plan = await CommissionPlan.findById(commissionId);
	if (!plan) {
		throw new ApiError('Commission plan not found.', 404);
	}

	await CommissionPlan.updateMany(
		{ _id: { $ne: plan._id }, activeTo: null },
		{ $set: { activeTo: new Date() } }
	);

	plan.activeFrom = new Date();
	plan.activeTo = null;

	if (setDefault) {
		await CommissionPlan.updateMany(
			{ _id: { $ne: plan._id }, isDefault: true },
			{ $set: { isDefault: false } }
		);
		plan.isDefault = true;
	}

	await plan.save();
	return toCommissionDto(plan);
};

const setDefaultCommissionPlan = async (commissionId) => {
	assertObjectId(commissionId, 'commission plan id');

	const plan = await CommissionPlan.findById(commissionId);
	if (!plan) {
		throw new ApiError('Commission plan not found.', 404);
	}

	await CommissionPlan.updateMany({ _id: { $ne: plan._id }, isDefault: true }, { $set: { isDefault: false } });
	plan.isDefault = true;
	await plan.save();

	return toCommissionDto(plan);
};

module.exports = {
	getOverview,
	listUsers,
	updateUserStatus,
	listVendors,
	updateVendorStatus,
	listBookings,
	runBookingAction,
	listCommissionPlans,
	createCommissionPlan,
	updateCommissionPlan,
	activateCommissionPlan,
	setDefaultCommissionPlan,
};
