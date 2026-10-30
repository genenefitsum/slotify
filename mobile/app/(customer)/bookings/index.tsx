import { CalendarCheck } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';

export default function Bookings() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="px-6 pb-2 pt-2">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Your</Text>
        <Text className="mt-2 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Bookings
        </Text>
      </View>
      <EmptyState
        icon={CalendarCheck}
        title="No bookings yet"
        message="Once you book a service it'll show up here. The booking flow is coming next."
      />
    </View>
  );
}
