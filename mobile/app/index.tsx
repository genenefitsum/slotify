import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Placeholder landing screen. Confirms the toolchain (Expo Router + NativeWind
// + design tokens) is wired correctly. Replaced by real screens during feature work.
export default function Index() {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 items-center justify-center bg-canvas px-6"
      style={{ paddingTop: insets.top }}
    >
      <View className="h-10 w-10 items-center justify-center bg-ink">
        <View className="h-3 w-3 bg-acid" />
      </View>
      <Text className="mt-5 font-display text-4xl font-black tracking-tight text-ink">
        slotify
      </Text>
      <Text className="mt-2 text-base text-ink/60">Mobile dev environment is ready.</Text>
    </View>
  );
}
