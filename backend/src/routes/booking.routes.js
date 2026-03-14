const express = require("express");
const bookingController = require("../controllers/booking.controller");
const { requireAuth } = require('../common/middlewares/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/availability/slots', bookingController.listAvailableSlots);
router.get("/", bookingController.listBookings);
router.post("/", bookingController.createBooking);
router.post('/:id/confirm', bookingController.confirmBooking);
router.post('/:id/start', bookingController.startBooking);
router.post('/:id/complete', bookingController.completeBooking);
router.post('/:id/cancel', bookingController.cancelBooking);
router.post('/:id/no-show', bookingController.markNoShow);

module.exports = router;
