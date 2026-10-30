import { Star } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/theme/colors';

/**
 * Star rating. Read-only when `onChange` is omitted; interactive (tap a star)
 * when provided.
 */
export function StarRating({
  value,
  onChange,
  size = 20,
  max = 5,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  max?: number;
}) {
  const haptics = useHaptics();
  const interactive = Boolean(onChange);

  return (
    <View className="flex-row" style={{ gap: size * 0.2 }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => {
        const filled = star <= Math.round(value);
        const icon = (
          <Star
            size={size}
            color={colors.ink}
            fill={filled ? colors.acid : 'transparent'}
            strokeWidth={2}
          />
        );
        if (!interactive) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} of ${max}`}
            onPress={() => {
              haptics.selection();
              onChange?.(star);
            }}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}
