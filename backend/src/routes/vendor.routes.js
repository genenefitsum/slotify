const express = require("express");
const vendorController = require("../controllers/vendor.controller");
const { requireAuth } = require('../common/middlewares/auth');
const { requireRole } = require('../common/middlewares/role');
const { validateRequest } = require('../middleware/validate.middleware');
const {
	validateCreateVendorPayload,
	validateUpdateVendorPayload,
	validateResolveMapLinkPayload,
} = require('../validators/vendor.validators');

const router = express.Router();

router.get("/", vendorController.listVendors);
router.get('/me', requireAuth, requireRole('vendor_owner'), vendorController.getMyVendor);
router.post(
	'/resolve-map-link',
	requireAuth,
	requireRole('vendor_owner'),
	validateRequest(validateResolveMapLinkPayload),
	vendorController.resolveMapLink
);
router.post(
	'/',
	requireAuth,
	requireRole('vendor_owner'),
	validateRequest(validateCreateVendorPayload),
	vendorController.createVendor
);
router.patch(
	'/me',
	requireAuth,
	requireRole('vendor_owner'),
	validateRequest(validateUpdateVendorPayload),
	vendorController.updateMyVendor
);
router.get("/:id", vendorController.getVendorById);

module.exports = router;
