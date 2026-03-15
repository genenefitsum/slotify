const express = require('express');

const availabilityController = require('./availability.controller');
const { requireAuth } = require('../../common/middlewares/auth');

const router = express.Router();

router.use(requireAuth);
router.get('/slots', availabilityController.listSlots);

module.exports = router;
