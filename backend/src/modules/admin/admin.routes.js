const express = require('express');

const { requireAuth } = require('../../common/middlewares/auth');
const { requireRole } = require('../../common/middlewares/role');
const adminController = require('./admin.controller');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/overview', adminController.getOverview);

router.get('/users', adminController.listUsers);
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/reactivate', adminController.reactivateUser);

router.get('/vendors', adminController.listVendors);
router.post('/vendors/:id/approve', adminController.approveVendor);
router.post('/vendors/:id/reject', adminController.rejectVendor);
router.post('/vendors/:id/suspend', adminController.suspendVendor);
router.post('/vendors/:id/reactivate', adminController.reactivateVendor);

router.get('/bookings', adminController.listBookings);
router.post('/bookings/:id/confirm', adminController.confirmBooking);
router.post('/bookings/:id/start', adminController.startBooking);
router.post('/bookings/:id/complete', adminController.completeBooking);
router.post('/bookings/:id/cancel', adminController.cancelBooking);
router.post('/bookings/:id/no-show', adminController.markBookingNoShow);

router.get('/commissions', adminController.listCommissionPlans);
router.post('/commissions', adminController.createCommissionPlan);
router.patch('/commissions/:id', adminController.updateCommissionPlan);
router.post('/commissions/:id/activate', adminController.activateCommissionPlan);
router.post('/commissions/:id/set-default', adminController.setDefaultCommissionPlan);

module.exports = router;
