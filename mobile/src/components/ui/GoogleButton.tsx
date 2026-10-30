import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GoogleGLogo } from '@/components/brand/GoogleGLogo';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';
import { PRESS_SCALE, spring } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * "Continue with Google" — Google's light button treatment (white surface, the
 * 4-colour G) squared off to sit in the editorial system.
 */
export function GoogleButton({
  onPress,
  loading = false,
  disabled = false,
  label = 'Continue with Google',
  className,
}: {
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={animatedStyle}
      onPressIn={() => {
        scale.set(withSpring(PRESS_SCALE, spring.press));
        haptics.light();
      }}
      onPressOut={() => scale.set(withSpring(1, spring.press))}
      onPress={onPress}
      className={cn(
        'h-14 w-full flex-row items-center justify-center border border-ink bg-white',
        isDisabled && 'opacity-40',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={colors.ink} />
      ) : (
        <View className="flex-row items-center justify-center gap-3">
          <GoogleGLogo size={20} />
          <Text className="font-display text-sm uppercase tracking-wide text-ink">{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
}
