import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'slotify.accessToken';

// SecureStore is async, but the HTTP client needs the token synchronously when
// building request headers. We keep an in-memory mirror, hydrated once at launch
// (loadAccessToken) and kept in sync on set/clear.
let cachedAccessToken: string | null = null;

/** Hydrate the in-memory token from secure storage. Call once on app start. */
export async function loadAccessToken(): Promise<string | null> {
  cachedAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return cachedAccessToken;
}

/** Synchronous read for request headers (reflects the last hydrate/set/clear). */
export function getAccessToken(): string | null {
  return cachedAccessToken;
}

export async function setAccessToken(token: string): Promise<void> {
  cachedAccessToken = token;
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/** Clear the session (logout, or on a 401). */
export async function clearAuthSession(): Promise<void> {
  cachedAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
