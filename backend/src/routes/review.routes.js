const express = require("express");
const reviewController = require("../controllers/review.controller");
const { requireAuth } = require('../common/middlewares/auth');
const { requireRole } = require('../common/middlewares/role');

const router = express.Router();

router.get("/vendor/:vendorId", reviewController.listReviews);
router.post('/vendor/:vendorId', requireAuth, requireRole('customer', 'admin'), reviewController.createReview);

module.exports = router;
