const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require('../common/middlewares/auth');
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
router.post('/', validateRequest(validateCreateBookingPayload), bookingController.createBooking);
router.post('/:id/confirm', validateRequest(validateBookingIdParam), bookingController.confirmBooking);
router.post('/:id/start', validateRequest(validateBookingIdParam), bookingController.startBooking);
router.post('/:id/complete', validateRequest(validateBookingIdParam), bookingController.completeBooking);
router.post(
	'/:id/cancel',
	validateRequest(validateBookingIdParam, validateCancelBookingPayload),
	bookingController.cancelBooking
);
router.post('/:id/no-show', validateRequest(validateBookingIdParam), bookingController.markNoShow);

module.exports = router;
