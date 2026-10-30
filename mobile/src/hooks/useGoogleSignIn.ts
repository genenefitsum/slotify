import { useCallback } from 'react';
import { Alert } from 'react-native';

type Role = 'customer' | 'vendor_owner';

/**
 * Single integration point for "Continue with Google".
 *
 * Reuses the web app's Google setup: the backend verifies the ID token against
 * its Web OAuth client ID (auth.service.js → `audience: env.googleClientId`).
 * So on mobile we obtain an ID token whose audience is that *same* Web client
 * ID — passed as `webClientId` to @react-native-google-signin — and POST it to
 * `/auth/google`. No backend changes.
 *
 * Native Google Sign-In needs a development build (not Expo Go) plus iOS/Android
 * OAuth client IDs in the same Google project. Once those exist and AuthContext
 * is wired, replace the guard below with:
 *
 *   GoogleSignin.configure({ webClientId, iosClientId });
 *   await GoogleSignin.hasPlayServices();
 *   const { data } = await GoogleSignin.signIn();
 *   return authApi.googleLogin({ credential: data.idToken, role });
 */
export function useGoogleSignIn() {
  const signInWithGoogle = useCallback(async (_role?: Role) => {
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim();

    Alert.alert(
      'Finish Google setup',
      webClientId
        ? 'Google is configured. Run a development build with @react-native-google-signin installed to enable native sign-in (it does not run in Expo Go).'
        : 'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (reuse the web client ID), add iOS/Android client IDs in the same Google project, then run a development build.'
    );
    return null;
  }, []);

  return { signInWithGoogle };
}
