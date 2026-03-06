const express = require("express");
const reviewController = require("../controllers/review.controller");

const router = express.Router();

router.get("/vendor/:vendorId", reviewController.listReviews);
router.post("/vendor/:vendorId", reviewController.createReview);

module.exports = router;
