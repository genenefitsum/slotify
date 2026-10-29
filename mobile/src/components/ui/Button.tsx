import { type LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/cn';
import { colors } from '@/theme/colors';
import { PRESS_SCALE, spring } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'lg' | 'md';

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  /** Icon placement relative to the label. */
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
} & Pick<PressableProps, 'accessibilityLabel' | 'testID'>;

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-ink',
  accent: 'bg-acid',
  outline: 'border border-ink bg-transparent',
  ghost: 'bg-transparent',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-canvas',
  accent: 'text-ink',
  outline: 'text-ink',
  ghost: 'text-ink',
};

const SIZE: Record<Size, string> = {
  lg: 'h-14 px-7',
  md: 'h-12 px-5',
};

const SPINNER: Record<Variant, string> = {
  primary: colors.canvas,
  accent: colors.ink,
  outline: colors.ink,
  ghost: colors.ink,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icon,
  iconPosition = 'trailing',
  loading = false,
  disabled = false,
  fullWidth = true,
  className,
  accessibilityLabel,
  testID,
}: ButtonProps) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const iconColor = variant === 'primary' ? colors.canvas : colors.ink;

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={() => {
        scale.set(withSpring(PRESS_SCALE, spring.press));
        haptics.light();
      }}
      onPressOut={() => {
        scale.set(withSpring(1, spring.press));
      }}
      onPress={onPress}
      style={animatedStyle}
      className={cn(
        'flex-row items-center justify-center',
        SIZE[size],
        CONTAINER[variant],
        fullWidth && 'w-full',
        isDisabled && 'opacity-40',
        className
      )}
    >
      {loading ? (
        <ActivityIndicator color={SPINNER[variant]} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {Icon && iconPosition === 'leading' ? (
            <Icon size={18} color={iconColor} strokeWidth={2.5} />
          ) : null}
          <Text className={cn('font-display text-sm uppercase tracking-wide', LABEL[variant])}>
            {label}
          </Text>
          {Icon && iconPosition === 'trailing' ? (
            <Icon size={18} color={iconColor} strokeWidth={2.5} />
          ) : null}
        </View>
      )}
    </AnimatedPressable>
  );
}
