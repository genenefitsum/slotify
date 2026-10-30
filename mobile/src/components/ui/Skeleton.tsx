import { useEffect } from 'react';
import { type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib/cn';

/** Pulsing placeholder block for loading states. */
export function Skeleton({
  className,
  width,
  height,
}: {
  className?: string;
  width?: DimensionValue;
  height?: DimensionValue;
}) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.set(
      withRepeat(
        withSequence(withTiming(1, { duration: 650 }), withTiming(0.5, { duration: 650 })),
        -1,
        false
      )
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View className={cn('bg-ink/10', className)} style={[{ width, height }, style]} />;
}
