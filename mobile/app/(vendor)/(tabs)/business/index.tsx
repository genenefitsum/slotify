import { Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';

// Placeholder — vendor profile onboarding/edit + reviews land in Phase V4.
export default function VendorBusiness() {
  return (
    <Screen contentClassName="px-6 pt-2">
      <Text className="mt-8 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
        Business
      </Text>
      <View className="mt-auto mb-24 items-center">
        <Text className="font-mono text-xs uppercase tracking-widest text-ink/40">Phase V4</Text>
      </View>
    </Screen>
  );
}
