const express = require('express');

const serviceController = require('../controllers/service.controller');
const { requireAuth } = require('../common/middlewares/auth');
const { requireCsrf } = require('../common/middlewares/csrf');
const { requireRole } = require('../common/middlewares/role');
const { validateRequest } = require('../middleware/validate.middleware');
const {
	validateCreateServicePayload,
	validateUpdateServicePayload,
} = require('../validators/service.validators');

const router = express.Router();

router.get('/', serviceController.listServices);
router.post(
	'/',
	requireAuth,
	requireRole('vendor_owner'),
	requireCsrf,
	validateRequest(validateCreateServicePayload),
	serviceController.createService
);
router.patch(
	'/:id',
	requireAuth,
	requireRole('vendor_owner'),
	requireCsrf,
	validateRequest(validateUpdateServicePayload),
	serviceController.updateService
);
router.delete('/:id', requireAuth, requireRole('vendor_owner'), requireCsrf, serviceController.deleteService);

module.exports = router;
