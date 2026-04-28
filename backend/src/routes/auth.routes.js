const express = require('express');

const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const { requireCsrf } = require('../common/middlewares/csrf');
const {
	validateLoginPayload,
	validateRegisterPayload,
	validateGoogleLoginPayload,
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/login', validateRequest(validateLoginPayload), authController.login);
router.post('/register', validateRequest(validateRegisterPayload), authController.register);
router.post('/google', validateRequest(validateGoogleLoginPayload), authController.googleLogin);
router.post('/logout', requireCsrf, authController.logout);

module.exports = router;
