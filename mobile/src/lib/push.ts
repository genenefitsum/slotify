import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

// Foreground behaviour: show the banner + list entry and play a sound when a
// push arrives while the app is open. Set once at module load.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Remote push ships native code, so it never works in Expo Go — only in a
// dev/EAS build. appOwnership === 'expo' is the Expo Go signal.
const isExpoGo = Constants.appOwnership === 'expo';

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined
  );
}

// The Expo push token for this device, cached after a successful registration so
// it can be unregistered on logout.
let currentToken: string | null = null;

export function getCurrentPushToken(): string | null {
  return currentToken;
}

/**
 * Request notification permission and resolve this device's Expo push token.
 * Returns null (never throws) when push can't be set up — Expo Go, no EAS
 * project id, a simulator without push, or a denied permission — so callers can
 * safely fire-and-forget.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (isExpoGo) return null;

  const projectId = getProjectId();
  if (!projectId) return null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    currentToken = data;
    return data;
  } catch {
    return null;
  }
}
