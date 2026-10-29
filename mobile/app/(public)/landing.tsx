import { router } from 'expo-router';
import { ArrowRight, CalendarCheck, Store, type LucideIcon } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/ui/Screen';
import { Wordmark } from '@/components/brand/Logo';
import { useHaptics } from '@/hooks/useHaptics';
import { colors } from '@/theme/colors';
import { PRESS_SCALE, spring, STAGGER } from '@/theme/motion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Role = 'customer' | 'vendor_owner';

export default function Landing() {
  return (
    <Screen contentClassName="px-6">
      {/* Wordmark */}
      <Animated.View entering={FadeIn.duration(400)} className="pt-2">
        <Wordmark size={36} />
      </Animated.View>

      {/* Hero */}
      <View className="flex-1 justify-center">
        <Animated.View entering={FadeInDown.delay(STAGGER).springify().damping(18)}>
          <Badge label="Ethiopia's booking platform" />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(STAGGER * 2).springify().damping(18)}>
          <Text className="mt-6 font-display text-6xl uppercase leading-[0.9] tracking-tight text-ink">
            Book the{'\n'}right pro
          </Text>
          {/* Acid-highlighted phrase */}
          <View className="mt-1 flex-row">
            <View className="bg-acid px-2 py-0.5">
              <Text className="font-display text-6xl uppercase leading-[0.9] tracking-tight text-ink">
                in 3 taps
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(STAGGER * 3).springify().damping(18)}>
          <Text className="mt-6 max-w-[320px] font-sans text-base leading-relaxed text-ink/60">
            Real availability, verified vendors, no back-and-forth DMs. Compare, confirm, and
            show up.
          </Text>
        </Animated.View>
      </View>

      {/* Role selection */}
      <View className="gap-4 pb-2">
        <Animated.View entering={FadeInDown.delay(STAGGER * 4).springify().damping(18)}>
          <RoleCard
            icon={CalendarCheck}
            title="Book a service"
            subtitle="Find & book verified pros"
            accent={colors.acid}
            iconColor={colors.ink}
            onPress={() => goToRegister('customer')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(STAGGER * 5).springify().damping(18)}>
          <RoleCard
            icon={Store}
            title="Grow your business"
            subtitle="Manage bookings & clients"
            accent={colors.ink}
            iconColor={colors.canvas}
            onPress={() => goToRegister('vendor_owner')}
          />
        </Animated.View>
      </View>

      {/* Log in */}
      <Animated.View
        entering={FadeInDown.delay(STAGGER * 6).springify().damping(18)}
        className="flex-row items-center justify-center gap-1.5 pb-1 pt-4"
      >
        <Text className="font-sans text-sm text-ink/60">Already have an account?</Text>
        <Pressable hitSlop={8} onPress={() => router.push('/login')}>
          <Text className="font-sans-bold text-sm text-ink underline">Log in</Text>
        </Pressable>
      </Animated.View>
    </Screen>
  );
}

function goToRegister(role: Role) {
  router.push({ pathname: '/register', params: { role } });
}

function RoleCard({
  icon: Icon,
  title,
  subtitle,
  accent,
  iconColor,
  onPress,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  accent: string;
  iconColor: string;
  onPress: () => void;
}) {
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={animatedStyle}
      onPressIn={() => {
        scale.set(withSpring(PRESS_SCALE, spring.press));
        haptics.light();
      }}
      onPressOut={() => scale.set(withSpring(1, spring.press))}
      onPress={onPress}
    >
      <View className="relative">
        {/* Hard offset shadow — the editorial signature */}
        <View className="absolute left-1.5 top-1.5 h-full w-full bg-ink" />
        <View className="flex-row items-center gap-4 border border-ink bg-canvas p-4">
          <View className="h-12 w-12 items-center justify-center" style={{ backgroundColor: accent }}>
            <Icon size={22} color={iconColor} strokeWidth={2.5} />
          </View>
          <View className="flex-1">
            <Text className="font-display text-xl uppercase tracking-tight text-ink">{title}</Text>
            <Text className="mt-0.5 font-sans text-sm text-ink/60">{subtitle}</Text>
          </View>
          <ArrowRight size={22} color={colors.ink} strokeWidth={2.5} />
        </View>
      </View>
    </AnimatedPressable>
  );
}
