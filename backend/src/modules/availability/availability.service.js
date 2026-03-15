const ApiError = require('../../utils/apiError');
const { Booking } = require('../../models/Booking');
const { Service } = require('../../models/Service');
const { Vendor } = require('../../models/Vendor');
const mongoose = require('mongoose');

const ADDIS_TIMEZONE = 'Africa/Addis_Ababa';
const ACTIVE_BOOKING_CONFLICT_STATUSES = ['pending_payment', 'confirmed', 'in_service'];

const addisDateFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: ADDIS_TIMEZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	weekday: 'short',
	hour12: false,
});

const WEEKDAY_MAP = {
	Sun: 0,
	Mon: 1,
	Tue: 2,
	Wed: 3,
	Thu: 4,
	Fri: 5,
	Sat: 6,
};

const parseLocalDate = (value) => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
		throw new ApiError('localDate must be in YYYY-MM-DD format.', 400);
	}

	const [year, month, day] = String(value).split('-').map(Number);
	if (!year || !month || !day) {
		throw new ApiError('Invalid localDate.', 400);
	}

	return { year, month, day };
};

const ensureObjectId = (value, label) => {
	if (!mongoose.Types.ObjectId.isValid(value)) {
		throw new ApiError(`Invalid ${label}.`, 400);
	}
};

const timeStringToMinutes = (value) => {
	const [hours, minutes] = String(value).split(':').map(Number);
	return hours * 60 + minutes;
};

const minutesToTimeString = (value) => {
	const hours = Math.floor(value / 60)
		.toString()
		.padStart(2, '0');
	const minutes = Math.floor(value % 60)
		.toString()
		.padStart(2, '0');

	return `${hours}:${minutes}`;
};

const addisLocalMinuteToUtcDate = (localDate, minuteOfDay) => {
	const { year, month, day } = parseLocalDate(localDate);
	const hours = Math.floor(minuteOfDay / 60);
	const minutes = minuteOfDay % 60;
	return new Date(Date.UTC(year, month - 1, day, hours - 3, minutes, 0, 0));
};

const getAddisDayOfWeek = (localDate) => {
	const localMidnight = new Date(`${localDate}T00:00:00+03:00`);
	if (Number.isNaN(localMidnight.getTime())) {
		throw new ApiError('Invalid localDate.', 400);
	}

	return localMidnight.getUTCDay();
};

const getAddisDateParts = (date) => {
	const parts = addisDateFormatter.formatToParts(date);
	const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

	return {
		localDate: `${byType.year}-${byType.month}-${byType.day}`,
		dayOfWeek: WEEKDAY_MAP[byType.weekday],
		minuteOfDay: Number(byType.hour) * 60 + Number(byType.minute),
	};
};

const getVendorScheduleForDate = (vendor, localDate) => {
	const workingHours = Array.isArray(vendor.workingHours) ? vendor.workingHours : [];
	const blackouts = Array.isArray(vendor.blackoutSlots) ? vendor.blackoutSlots : [];
	const dayOfWeek = getAddisDayOfWeek(localDate);

	const workingDay = workingHours.find(
		(item) => item.dayOfWeek === dayOfWeek && item.isEnabled
	);

	if (!workingDay) {
		return {
			workingDay: null,
			openMinute: null,
			closeMinute: null,
			dayBlackouts: [],
		};
	}

	const openMinute = timeStringToMinutes(workingDay.startTime);
	const closeMinute = timeStringToMinutes(workingDay.endTime);

	const dayBlackouts = blackouts
		.filter((item) => item.date === localDate)
		.map((item) => ({
			startMinute: timeStringToMinutes(item.startTime),
			endMinute: timeStringToMinutes(item.endTime),
		}))
		.filter((item) => Number.isFinite(item.startMinute) && Number.isFinite(item.endMinute));

	return {
		workingDay,
		openMinute,
		closeMinute,
		dayBlackouts,
	};
};

const ensureVendorAvailable = ({ vendor, startsAtUtc, endsAtUtc }) => {
	const start = getAddisDateParts(startsAtUtc);
	const end = getAddisDateParts(endsAtUtc);

	if (start.localDate !== end.localDate) {
		throw new ApiError('Appointments must start and end on the same Addis Ababa calendar day.', 400);
	}

	const { workingDay, openMinute, closeMinute, dayBlackouts } = getVendorScheduleForDate(vendor, start.localDate);

	if (!workingDay) {
		throw new ApiError('This vendor is not accepting bookings on the selected day.', 409);
	}

	if (start.minuteOfDay < openMinute || end.minuteOfDay > closeMinute) {
		throw new ApiError('Selected time is outside this vendor\'s working hours.', 409);
	}

	const hasBlackoutConflict = dayBlackouts.some(
		(item) => start.minuteOfDay < item.endMinute && end.minuteOfDay > item.startMinute
	);

	if (hasBlackoutConflict) {
		throw new ApiError('Selected time is unavailable because the vendor has blocked that period.', 409);
	}
};

const listVendorServiceSlots = ({ vendor, service, localDate, existingBookings }) => {
	parseLocalDate(localDate);

	const { workingDay, openMinute, closeMinute, dayBlackouts } = getVendorScheduleForDate(vendor, localDate);
	const timezone = vendor.timezone || ADDIS_TIMEZONE;

	if (!workingDay || openMinute >= closeMinute) {
		return {
			vendorId: String(vendor._id),
			serviceId: String(service._id),
			localDate,
			timezone,
			slotDurationMinutes: service.durationMinutes,
			items: [],
		};
	}

	const slots = [];
	for (
		let currentStartMinute = openMinute;
		currentStartMinute + service.durationMinutes <= closeMinute;
		currentStartMinute += service.durationMinutes
	) {
		const currentEndMinute = currentStartMinute + service.durationMinutes;
		const startsAtUtc = addisLocalMinuteToUtcDate(localDate, currentStartMinute);
		const endsAtUtc = addisLocalMinuteToUtcDate(localDate, currentEndMinute);

		const hasBlackout = dayBlackouts.some(
			(item) => currentStartMinute < item.endMinute && currentEndMinute > item.startMinute
		);

		const hasBookingConflict = existingBookings.some(
			(item) => startsAtUtc < item.endsAtUtc && endsAtUtc > item.startsAtUtc
		);

		let reasonCode = null;
		if (hasBlackout) {
			reasonCode = 'blackout';
		} else if (hasBookingConflict) {
			reasonCode = 'conflict';
		}

		slots.push({
			startsAtUtc: startsAtUtc.toISOString(),
			endsAtUtc: endsAtUtc.toISOString(),
			localStartTime: minutesToTimeString(currentStartMinute),
			localEndTime: minutesToTimeString(currentEndMinute),
			isAvailable: !reasonCode,
			reasonCode,
		});
	}

	return {
		vendorId: String(vendor._id),
		serviceId: String(service._id),
		localDate,
		timezone,
		slotDurationMinutes: service.durationMinutes,
		items: slots,
	};
};

const listAvailableSlotsByVendorService = async ({ vendorId, serviceId, localDate }) => {
	ensureObjectId(vendorId, 'vendor id');
	ensureObjectId(serviceId, 'service id');
	parseLocalDate(localDate);

	const [vendor, service] = await Promise.all([
		Vendor.findOne({
			_id: vendorId,
			deletedAt: null,
			status: 'active',
		}).lean(),
		Service.findOne({
			_id: serviceId,
			vendorId,
			isActive: true,
			deletedAt: null,
		}).lean(),
	]);

	if (!vendor) {
		throw new ApiError('Vendor not found.', 404);
	}

	if (!service) {
		throw new ApiError('Service not found for this vendor.', 404);
	}

	const dayStartUtc = addisLocalMinuteToUtcDate(localDate, 0);
	const dayEndUtc = addisLocalMinuteToUtcDate(localDate, 24 * 60);

	const existingBookings = await Booking.find({
		vendorId,
		status: { $in: ACTIVE_BOOKING_CONFLICT_STATUSES },
		startsAtUtc: { $lt: dayEndUtc },
		endsAtUtc: { $gt: dayStartUtc },
	})
		.select({ startsAtUtc: 1, endsAtUtc: 1 })
		.lean();

	return listVendorServiceSlots({
		vendor,
		service,
		localDate,
		existingBookings,
	});
};

module.exports = {
	ADDIS_TIMEZONE,
	ACTIVE_BOOKING_CONFLICT_STATUSES,
	parseLocalDate,
	addisLocalMinuteToUtcDate,
	ensureVendorAvailable,
	listVendorServiceSlots,
	listAvailableSlotsByVendorService,
};
