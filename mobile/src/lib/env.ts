/**
 * Typed access to the EXPO_PUBLIC_* runtime config. These are inlined into the
 * bundle at build time, so they must be read as static `process.env.X` members
 * (not dynamic lookups) for Expo's transform to replace them.
 */
export const env = {
  apiBaseUrl: (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:5000/api').replace(
    /\/$/,
    ''
  ),
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() ?? '',
  // Support contact for the profile "Help & support" action.
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'slotifyethiopia@outlook.com',
} as const;
