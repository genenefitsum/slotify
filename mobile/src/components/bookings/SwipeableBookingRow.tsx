import { X } from 'lucide-react-native';
import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import { BookingCard } from '@/components/bookings/BookingCard';
import { canCustomerCancel } from '@/lib/bookingStatus';
import { colors } from '@/theme/colors';
import type { Booking } from '@/types/booking';

/**
 * A booking row that reveals a Cancel action on left-swipe for cancellable
 * bookings. Non-cancellable bookings render as a plain card (nothing to swipe).
 */
export function SwipeableBookingRow({
  booking,
  onPress,
  onCancel,
}: {
  booking: Booking;
  onPress: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<SwipeableMethods>(null);

  if (!canCustomerCancel(booking.status)) {
    return <BookingCard booking={booking} onPress={onPress} />;
  }

  return (
    <ReanimatedSwipeable
      ref={ref}
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Cancel ${booking.serviceName ?? 'booking'}`}
          onPress={() => {
            ref.current?.close();
            onCancel();
          }}
          className="ml-3 w-24 items-center justify-center bg-destructive active:opacity-80"
        >
          <View className="items-center gap-1">
            <X size={20} color={colors.canvas} strokeWidth={2.5} />
            <Text className="font-mono text-[10px] uppercase tracking-[0.14em] text-canvas">
              Cancel
            </Text>
          </View>
        </Pressable>
      )}
    >
      <BookingCard booking={booking} onPress={onPress} />
    </ReanimatedSwipeable>
  );
}
