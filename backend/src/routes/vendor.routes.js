const express = require("express");
const vendorController = require("../controllers/vendor.controller");

const router = express.Router();

router.get("/", vendorController.listVendors);
router.get("/:id", vendorController.getVendorById);

module.exports = router;
