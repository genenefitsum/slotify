const express = require("express");
const vendorController = require("../controllers/vendor.controller");
const { requireAuth } = require('../common/middlewares/auth');
const { requireRole } = require('../common/middlewares/role');

const router = express.Router();

router.get("/", vendorController.listVendors);
router.get('/me', requireAuth, requireRole('vendor_owner'), vendorController.getMyVendor);
router.post('/', requireAuth, requireRole('vendor_owner'), vendorController.createVendor);
router.patch('/me', requireAuth, requireRole('vendor_owner'), vendorController.updateMyVendor);
router.get("/:id", vendorController.getVendorById);

module.exports = router;
