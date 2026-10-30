import { CalendarClock } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/bookings/StatusBadge';
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Booking } from '@/types/booking';

export function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.serviceName ?? 'Booking'} ${booking.bookingNumber}`}
      onPress={onPress}
      className="border border-ink/15 bg-white p-4 active:bg-ink/5"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text numberOfLines={1} className="flex-1 font-display text-lg uppercase tracking-tight text-ink">
          {booking.serviceName ?? 'Service'}
        </Text>
        <StatusBadge status={booking.status} />
      </View>

      {booking.vendorName ? (
        <Text numberOfLines={1} className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
          {booking.vendorName}
        </Text>
      ) : null}

      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <CalendarClock size={14} color={colors.inkMuted} strokeWidth={2} />
          <Text className="font-sans text-xs text-ink/70">
            {formatBookingDate(booking.startsAtUtc)} · {formatBookingTime(booking.startsAtUtc)}
          </Text>
        </View>
        <Text className="font-sans-bold text-sm text-ink">
          {formatPrice(booking.pricingSnapshot.servicePriceAmount, booking.pricingSnapshot.currency)}
        </Text>
      </View>
    </Pressable>
  );
}
