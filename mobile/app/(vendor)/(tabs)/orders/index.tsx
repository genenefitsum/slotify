import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

// Placeholder — bookings list + lifecycle actions land in Phase V2.
export default function VendorOrders() {
  return (
    <Screen contentClassName="px-6 pt-2">
      <Text className="mt-8 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
        Bookings
      </Text>
      <View className="mt-auto mb-24 items-center">
        <Text className="font-mono text-xs uppercase tracking-widest text-ink/40">Phase V2</Text>
      </View>
    </Screen>
  );
}
