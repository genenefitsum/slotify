import { Image } from 'expo-image';
import { MapPin, Star } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useHaptics } from '@/hooks/useHaptics';
import { formatPrice, formatRating } from '@/lib/format';
import { colors } from '@/theme/colors';
import { PRESS_SCALE, spring } from '@/theme/motion';
import type { Vendor } from '@/types/vendor';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VendorCard({ vendor, onPress }: { vendor: Vendor; onPress: () => void }) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const price = formatPrice(vendor.startingPrice);
  const categories = vendor.categories.slice(0, 3).join(' · ');

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={vendor.displayName}
      style={animatedStyle}
      onPressIn={() => {
        scale.set(withSpring(PRESS_SCALE, spring.press));
        haptics.light();
      }}
      onPressOut={() => scale.set(withSpring(1, spring.press))}
      onPress={onPress}
      className="border border-ink bg-white"
    >
      <View className="aspect-[16/10] w-full bg-ink/5">
        {vendor.imageUrl ? (
          <Image
            source={{ uri: vendor.imageUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <View className="h-10 w-10 items-center justify-center bg-ink">
              <View className="h-3 w-3 bg-acid" />
            </View>
          </View>
        )}

        {/* Rating pill */}
        <View className="absolute right-3 top-3 flex-row items-center gap-1 bg-acid px-2 py-1">
          <Star size={12} color={colors.ink} fill={colors.ink} />
          <Text className="font-mono text-[11px] font-bold text-ink">
            {formatRating(vendor.averageRating)}
          </Text>
        </View>
      </View>

      <View className="p-4">
        <Text numberOfLines={1} className="font-display text-xl uppercase tracking-tight text-ink">
          {vendor.displayName}
        </Text>
        {categories ? (
          <Text numberOfLines={1} className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
            {categories}
          </Text>
        ) : null}

        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <MapPin size={13} color={colors.inkMuted} strokeWidth={2} />
            <Text className="font-sans text-xs text-ink/60">{vendor.location.city}</Text>
          </View>
          {price ? (
            <Text className="font-sans-bold text-sm text-ink">
              from <Text className="font-display">{price}</Text>
            </Text>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}
