const adminService = require('./admin.service');
const {
	validateCreateCommissionPayload,
} = require('./admin.validator');

const getOverview = async (req, res, next) => {
	try {
		const data = await adminService.getOverview({ days: req.query?.days });
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const listUsers = async (req, res, next) => {
	try {
		const data = await adminService.listUsers(req.query || {});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const suspendUser = async (req, res, next) => {
	try {
		const data = await adminService.updateUserStatus({
			userId: req.params.id,
			nextStatus: 'suspended',
			actorUserId: req.user.id,
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const reactivateUser = async (req, res, next) => {
	try {
		const data = await adminService.updateUserStatus({
			userId: req.params.id,
			nextStatus: 'active',
			actorUserId: req.user.id,
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const listVendors = async (req, res, next) => {
	try {
		const data = await adminService.listVendors(req.query || {});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const approveVendor = async (req, res, next) => {
	try {
		const data = await adminService.updateVendorStatus({
			vendorId: req.params.id,
			nextStatus: 'active',
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const rejectVendor = async (req, res, next) => {
	try {
		const data = await adminService.updateVendorStatus({
			vendorId: req.params.id,
			nextStatus: 'suspended',
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const suspendVendor = async (req, res, next) => {
	try {
		const data = await adminService.updateVendorStatus({
			vendorId: req.params.id,
			nextStatus: 'suspended',
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const reactivateVendor = async (req, res, next) => {
	try {
		const data = await adminService.updateVendorStatus({
			vendorId: req.params.id,
			nextStatus: 'active',
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const listBookings = async (req, res, next) => {
	try {
		const data = await adminService.listBookings(req.query || {});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const confirmBooking = async (req, res, next) => {
	try {
		const data = await adminService.runBookingAction({
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
		const data = await adminService.runBookingAction({
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
		const data = await adminService.runBookingAction({
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
		const data = await adminService.runBookingAction({
			bookingId: req.params.id,
			action: 'cancel',
			actor: req.user,
			reasonCode: req.body?.reasonCode || 'admin_intervention',
			reasonText: req.body?.reasonText,
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const markBookingNoShow = async (req, res, next) => {
	try {
		const data = await adminService.runBookingAction({
			bookingId: req.params.id,
			action: 'noShow',
			actor: req.user,
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const listCommissionPlans = async (req, res, next) => {
	try {
		const data = await adminService.listCommissionPlans(req.query || {});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const createCommissionPlan = async (req, res, next) => {
	try {
		validateCreateCommissionPayload(req.body || {});
		const data = await adminService.createCommissionPlan(req.body || {});
		res.status(201).json(data);
	} catch (error) {
		next(error);
	}
};

const updateCommissionPlan = async (req, res, next) => {
	try {
		const data = await adminService.updateCommissionPlan(req.params.id, req.body || {});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const activateCommissionPlan = async (req, res, next) => {
	try {
		const data = await adminService.activateCommissionPlan(req.params.id, {
			setDefault: Boolean(req.body?.setDefault),
		});
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

const setDefaultCommissionPlan = async (req, res, next) => {
	try {
		const data = await adminService.setDefaultCommissionPlan(req.params.id);
		res.status(200).json(data);
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getOverview,
	listUsers,
	suspendUser,
	reactivateUser,
	listVendors,
	approveVendor,
	rejectVendor,
	suspendVendor,
	reactivateVendor,
	listBookings,
	confirmBooking,
	startBooking,
	completeBooking,
	cancelBooking,
	markBookingNoShow,
	listCommissionPlans,
	createCommissionPlan,
	updateCommissionPlan,
	activateCommissionPlan,
	setDefaultCommissionPlan,
};
