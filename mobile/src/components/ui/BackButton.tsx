import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/theme/colors';

/** Hard-edged back control for stacked screens. */
export function BackButton({ onPress }: { onPress?: () => void }) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={() => {
        haptics.light();
        if (onPress) onPress();
        else router.back();
      }}
      className="h-11 w-11 items-center justify-center border border-ink/20 bg-canvas active:bg-ink/5"
    >
      <ChevronLeft size={22} color={colors.ink} strokeWidth={2.5} />
    </Pressable>
  );
}
