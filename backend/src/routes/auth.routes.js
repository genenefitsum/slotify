const express = require('express');

const authController = require('../controllers/auth.controller');
const { validateRequest } = require('../middleware/validate.middleware');
const {
	validateLoginPayload,
	validateRegisterPayload,
	validateGoogleLoginPayload,
} = require('../validators/auth.validators');

const router = express.Router();

router.post('/login', validateRequest(validateLoginPayload), authController.login);
router.post('/register', validateRequest(validateRegisterPayload), authController.register);
router.post('/google', validateRequest(validateGoogleLoginPayload), authController.googleLogin);

module.exports = router;
