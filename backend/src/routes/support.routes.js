const express = require('express');
const rateLimit = require('express-rate-limit');

const supportController = require('../controllers/support.controller');
const { requireAuth } = require('../common/middlewares/auth');

const router = express.Router();

// Dedicated limiter — the support bot calls a paid LLM, so cap it tighter than
// the general API limit (per authenticated user / IP).
const supportLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/chat', requireAuth, supportLimiter, supportController.chat);

module.exports = router;
