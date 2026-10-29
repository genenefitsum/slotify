import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/theme/colors';

/** A softly pulsing acid dot — the brand's "live" signal. */
export function PulseDot({ size = 6 }: { size?: number }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.set(
      withRepeat(
        withSequence(withTiming(0.25, { duration: 750 }), withTiming(1, { duration: 750 })),
        -1,
        false
      )
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.acid },
        style,
      ]}
    />
  );
}
