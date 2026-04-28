const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require('../common/middlewares/auth');
const { requireCsrf } = require('../common/middlewares/csrf');
const { validateRequest } = require('../middleware/validate.middleware');
const {
	validateCreateBookingPayload,
	validateAvailableSlotsQuery,
	validateCancelBookingPayload,
	validateBookingIdParam,
} = require('../validators/booking.validators');

const router = express.Router();

router.use(requireAuth);

router.get('/availability/slots', validateRequest(validateAvailableSlotsQuery), bookingController.listAvailableSlots);
router.get("/", bookingController.listBookings);
router.post('/', requireCsrf, validateRequest(validateCreateBookingPayload), bookingController.createBooking);
router.post('/:id/confirm', requireCsrf, validateRequest(validateBookingIdParam), bookingController.confirmBooking);
router.post('/:id/start', requireCsrf, validateRequest(validateBookingIdParam), bookingController.startBooking);
router.post('/:id/complete', requireCsrf, validateRequest(validateBookingIdParam), bookingController.completeBooking);
router.post(
	'/:id/cancel',
	requireCsrf,
	validateRequest(validateBookingIdParam, validateCancelBookingPayload),
	bookingController.cancelBooking
);
router.post('/:id/no-show', requireCsrf, validateRequest(validateBookingIdParam), bookingController.markNoShow);

module.exports = router;
