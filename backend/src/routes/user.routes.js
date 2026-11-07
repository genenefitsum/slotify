const express = require("express");
const userController = require("../controllers/user.controller");
const { requireAuth } = require('../common/middlewares/auth');
const { requireCsrf } = require('../common/middlewares/csrf');

const router = express.Router();

router.get('/me', requireAuth, userController.getCurrentUser);
router.patch('/me', requireAuth, requireCsrf, userController.updateCurrentUser);
router.post('/me/push-token', requireAuth, requireCsrf, userController.addPushToken);
router.delete('/me/push-token', requireAuth, requireCsrf, userController.removePushToken);

module.exports = router;
