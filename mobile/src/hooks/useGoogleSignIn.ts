import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getErrorMessage } from '@/api/http';
import { useAuth } from '@/contexts/AuthContext';
import { env } from '@/lib/env';
import type { AuthUser } from '@/types/auth';

type Role = 'customer' | 'vendor_owner';

// Native Google Sign-In can't run in Expo Go (it ships native code). Detect that
// so the app still works in Expo Go — the button just explains the requirement.
const isExpoGo = Constants.executionEnvironment === 'storeClient';

let configured = false;

/**
 * "Continue with Google". Reuses the web app's setup: we obtain a Google ID
 * token whose audience is the shared Web client ID (passed as `webClientId`)
 * and hand it to AuthContext.loginWithGoogle → POST /auth/google, which the
 * backend verifies against that same Web client ID. No backend changes.
 */
export function useGoogleSignIn() {
  const { loginWithGoogle } = useAuth();
  const [inProgress, setInProgress] = useState(false);

  const signInWithGoogle = useCallback(
    async (role?: Role): Promise<AuthUser | null> => {
      if (isExpoGo) {
        Alert.alert(
          'Development build required',
          'Google sign-in uses native code and cannot run in Expo Go. Run a development build (npx expo run:ios / run:android).'
        );
        return null;
      }
      if (!env.googleWebClientId) {
        Alert.alert(
          'Google not configured',
          'Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and the iOS client ID), then rebuild the app.'
        );
        return null;
      }

      setInProgress(true);
      try {
        // Loaded lazily so the native module is never touched in Expo Go.
        const { GoogleSignin, isSuccessResponse } = await import(
          '@react-native-google-signin/google-signin'
        );

        if (!configured) {
          GoogleSignin.configure({
            webClientId: env.googleWebClientId,
            iosClientId: env.googleIosClientId || undefined,
            offlineAccess: false,
          });
          configured = true;
        }

        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        // Non-success (e.g. the user cancelled) — bail quietly.
        if (!isSuccessResponse(response)) {
          return null;
        }

        const idToken = response.data.idToken;
        if (!idToken) {
          Alert.alert('Google sign-in failed', 'No ID token returned. Check the Web client ID.');
          return null;
        }

        return await loginWithGoogle({ credential: idToken, role });
      } catch (error) {
        Alert.alert('Google sign-in failed', getErrorMessage(error));
        return null;
      } finally {
        setInProgress(false);
      }
    },
    [loginWithGoogle]
  );

  return { signInWithGoogle, inProgress };
}
