const Anthropic = require('@anthropic-ai/sdk');

const env = require('../config/env');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

// The Slotify help corpus the bot is grounded in. Kept stable (no per-request
// values) so it caches as a prompt prefix. Edit here when product rules change.
const HELP_CONTENT = `You are the Slotify Support Assistant — a friendly, concise help bot for the Slotify booking marketplace. Slotify helps customers in Ethiopia discover, compare, and book trusted service professionals (vendors), and helps vendors manage their services and bookings.

# How Slotify works
- Customers browse vendors by city and category, open a vendor to see services, working hours, photos, and reviews, then book a service for an available time slot.
- Booking flow: pick a service → choose a date and an available time slot → add optional notes → confirm. A deposit may be required at booking; the remaining balance is paid to the vendor.
- Each booking has a status: pending payment, confirmed, in service, completed, cancelled, or no-show.
- Pricing shows the service price and any deposit up front. Slotify takes a small commission from the vendor's payout; customers are not charged extra commission.

# Cancellations & changes
- Customers can cancel a booking that is still pending payment or confirmed, from the booking's detail screen. Cancelling asks for a reason.
- Once a booking is in service or completed it can no longer be cancelled by the customer.
- To reschedule, cancel the existing booking and create a new one for the preferred time.

# Reviews
- Customers can leave a star rating and comment after a booking is completed — from the booking detail or the vendor's page.

# Accounts
- Users sign up as a Customer or a Vendor. Google sign-in is supported.
- Forgot a password: use "Reset it" on the sign-in screen to get a 6-digit email code, then set a new password (at least 8 characters with an uppercase letter, a lowercase letter, and a number).
- Profile name and photo can be edited from the profile/account screen.

# Vendors
- Vendors set up a business profile (name, category, location, working hours, photos), create services (name, price, duration, deposit), and manage incoming bookings (confirm, start, complete, mark no-show, or cancel).

# Guardrails
- Only answer questions about using Slotify. Ground every policy answer in the information above — never invent refund amounts, fees, or rules that aren't stated here.
- For account-specific actions you cannot perform (refunds, disputes, deleting an account, changing a specific booking for the user), or anything outside Slotify support, direct the user to email ${env.supportEmail}.
- Keep answers short and practical (2-4 sentences). Use plain language. If you are unsure, say so and point to ${env.supportEmail}.`;

const MODEL = 'claude-opus-4-8';
const MAX_HISTORY = 20;
const FALLBACK_REPLY = `I couldn't answer that one. Please email our team at ${env.supportEmail} and we'll help you directly.`;

let cachedClient;
const getClient = () => {
  if (!cachedClient) {
    cachedClient = new Anthropic({ apiKey: env.anthropicApiKey });
  }
  return cachedClient;
};

const isConfigured = () => Boolean(env.anthropicApiKey);

/** Normalize + bound the incoming chat history to valid, alternating-ish turns. */
const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) {
    throw new ApiError('messages must be an array.', 400);
  }
  const cleaned = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 4000) }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);

  if (cleaned.length === 0 || cleaned[cleaned.length - 1].role !== 'user') {
    throw new ApiError('The last message must be from the user.', 400);
  }
  return cleaned;
};

/**
 * Answer a support question grounded in the Slotify help corpus. Returns the
 * assistant's reply text. Throws ApiError(503) when the bot isn't configured.
 */
const answer = async (messages) => {
  if (!isConfigured()) {
    throw new ApiError('Support chat is not available right now.', 503);
  }

  const history = sanitizeMessages(messages);

  const response = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    // Grounding corpus as a cached system prefix (~90% cheaper on repeats).
    system: [{ type: 'text', text: HELP_CONTENT, cache_control: { type: 'ephemeral' } }],
    messages: history,
  });

  // A safety refusal or a hit token cap shouldn't surface as a crash — give the
  // user the email fallback instead.
  if (response.stop_reason === 'refusal') {
    return FALLBACK_REPLY;
  }

  const text = (response.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();

  return text || FALLBACK_REPLY;
};

module.exports = {
  answer,
  isConfigured,
};
