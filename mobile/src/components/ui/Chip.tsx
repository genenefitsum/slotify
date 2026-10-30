import { Pressable, Text } from 'react-native';

import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/cn';

/** Selectable filter chip. Hard-edged, uppercase — matches the editorial labels. */
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={() => {
        haptics.selection();
        onPress();
      }}
      className={cn(
        'h-10 items-center justify-center border px-4',
        active ? 'border-ink bg-ink' : 'border-ink/15 bg-white'
      )}
    >
      <Text
        className={cn(
          'font-mono text-[11px] uppercase tracking-[0.12em]',
          active ? 'text-canvas' : 'text-ink/60'
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
