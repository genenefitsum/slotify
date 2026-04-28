const express = require('express');

const { requireAuth } = require('../../common/middlewares/auth');
const { requireCsrf } = require('../../common/middlewares/csrf');
const { requireRole } = require('../../common/middlewares/role');
const adminController = require('./admin.controller');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/overview', adminController.getOverview);

router.get('/users', adminController.listUsers);
router.post('/users/:id/suspend', requireCsrf, adminController.suspendUser);
router.post('/users/:id/reactivate', requireCsrf, adminController.reactivateUser);

router.get('/vendors', adminController.listVendors);
router.post('/vendors/:id/approve', requireCsrf, adminController.approveVendor);
router.post('/vendors/:id/reject', requireCsrf, adminController.rejectVendor);
router.post('/vendors/:id/suspend', requireCsrf, adminController.suspendVendor);
router.post('/vendors/:id/reactivate', requireCsrf, adminController.reactivateVendor);

router.get('/bookings', adminController.listBookings);
router.post('/bookings/:id/confirm', requireCsrf, adminController.confirmBooking);
router.post('/bookings/:id/start', requireCsrf, adminController.startBooking);
router.post('/bookings/:id/complete', requireCsrf, adminController.completeBooking);
router.post('/bookings/:id/cancel', requireCsrf, adminController.cancelBooking);
router.post('/bookings/:id/no-show', requireCsrf, adminController.markBookingNoShow);

router.get('/commissions', adminController.listCommissionPlans);
router.post('/commissions', requireCsrf, adminController.createCommissionPlan);
router.patch('/commissions/:id', requireCsrf, adminController.updateCommissionPlan);
router.post('/commissions/:id/activate', requireCsrf, adminController.activateCommissionPlan);
router.post('/commissions/:id/set-default', requireCsrf, adminController.setDefaultCommissionPlan);

module.exports = router;
