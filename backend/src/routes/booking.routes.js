const express = require("express");
const bookingController = require("../controllers/booking.controller");

const router = express.Router();

router.get("/", bookingController.listBookings);
router.post("/", bookingController.createBooking);

module.exports = router;
