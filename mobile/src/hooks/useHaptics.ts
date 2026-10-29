import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Platform } from 'react-native';

// Haptics are a no-op off-device (web); guard so calls are always safe.
const supported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Thin wrapper over expo-haptics with intent-named helpers. This is the
 * "texture" layer — fire `light` on taps, `selection` on value changes,
 * `success`/`error` on outcomes.
 */
export function useHaptics() {
  return useMemo(
    () => ({
      light: () => {
        if (supported) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      medium: () => {
        if (supported) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },
      selection: () => {
        if (supported) void Haptics.selectionAsync();
      },
      success: () => {
        if (supported) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      error: () => {
        if (supported) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      },
    }),
    []
  );
}
