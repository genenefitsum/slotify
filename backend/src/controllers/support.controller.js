const supportService = require('../services/support.service');

// POST /api/support/chat — grounded FAQ answer for the mobile/web help chat.
const chat = async (req, res, next) => {
  try {
    const { messages } = req.body ?? {};
    const reply = await supportService.answer(messages);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };
