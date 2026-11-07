const { Expo } = require('expo-server-sdk');

const ApiError = require('../utils/apiError');
const { User } = require('../models/User');
const logger = require('../utils/logger');

// A single Expo client is reused across sends. An access token is only required
// for enhanced push security; the default (unauthenticated) client works fine.
const expo = new Expo(
  process.env.EXPO_ACCESS_TOKEN ? { accessToken: process.env.EXPO_ACCESS_TOKEN } : undefined
);

/** Add an Expo push token to a user's device list (deduped). */
const registerToken = async (userId, token) => {
  if (!Expo.isExpoPushToken(token)) {
    throw new ApiError('Invalid Expo push token.', 400);
  }
  await User.updateOne({ _id: userId }, { $addToSet: { pushTokens: token } });
};

/** Remove an Expo push token from a user's device list. */
const unregisterToken = async (userId, token) => {
  if (!token) return;
  await User.updateOne({ _id: userId }, { $pull: { pushTokens: token } });
};

/**
 * Send a push notification to every device registered to a user. Fire-and-forget
 * by design: it never throws, so a push failure can't break the booking flow.
 * No-ops when the user has no (valid) tokens. Tokens Expo reports as
 * `DeviceNotRegistered` are pruned so the list stays clean.
 */
const sendPush = async (userId, { title, body, data } = {}) => {
  try {
    if (!userId) return;

    const user = await User.findById(userId).select({ pushTokens: 1 }).lean();
    const tokens = (user?.pushTokens || []).filter((t) => Expo.isExpoPushToken(t));
    if (!tokens.length) return;

    const messages = tokens.map((to) => ({
      to,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    const invalidTokens = [];
    for (const chunk of expo.chunkPushNotifications(messages)) {
      try {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        tickets.forEach((ticket, index) => {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            invalidTokens.push(chunk[index].to);
          }
        });
      } catch (error) {
        logger.warn('Push chunk send failed', { error: error.message });
      }
    }

    if (invalidTokens.length) {
      await User.updateOne({ _id: userId }, { $pull: { pushTokens: { $in: invalidTokens } } });
    }
  } catch (error) {
    logger.warn('Push notification failed', {
      userId: String(userId),
      error: error.message,
    });
  }
};

module.exports = {
  registerToken,
  unregisterToken,
  sendPush,
};
