const express = require("express");
const userController = require("../controllers/user.controller");
const { requireAuth } = require('../common/middlewares/auth');

const router = express.Router();

router.get('/me', requireAuth, userController.getCurrentUser);

module.exports = router;
