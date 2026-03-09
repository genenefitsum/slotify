const express = require('express');

const serviceController = require('../controllers/service.controller');
const { requireAuth } = require('../common/middlewares/auth');
const { requireRole } = require('../common/middlewares/role');

const router = express.Router();

router.get('/', serviceController.listServices);
router.post('/', requireAuth, requireRole('vendor_owner'), serviceController.createService);
router.patch('/:id', requireAuth, requireRole('vendor_owner'), serviceController.updateService);
router.delete('/:id', requireAuth, requireRole('vendor_owner'), serviceController.deleteService);

module.exports = router;
