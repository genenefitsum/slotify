import { CalendarClock, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { StatusBadge } from '@/components/bookings/StatusBadge';
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format';
import { getAllowedVendorActions } from '@/lib/vendor';
import { colors } from '@/theme/colors';
import type { Booking } from '@/types/booking';

/**
 * Booking row for the vendor side. Unlike the customer card it foregrounds the
 * *customer* (who's booking) and flags rows that still need a vendor response.
 */
export function VendorBookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const needsAction = getAllowedVendorActions(booking.status).length > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.serviceName ?? 'Booking'} ${booking.bookingNumber}`}
      onPress={onPress}
      className="border border-ink/15 bg-white p-4 active:bg-ink/5"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Text
          numberOfLines={1}
          className="flex-1 font-display text-lg uppercase tracking-tight text-ink"
        >
          {booking.serviceName ?? 'Service'}
        </Text>
        <StatusBadge status={booking.status} />
      </View>

      <View className="mt-1 flex-row items-center gap-1.5">
        <User size={13} color={colors.inkMuted} strokeWidth={2} />
        <Text numberOfLines={1} className="flex-1 font-sans text-sm text-ink/70">
          {booking.customerName ?? 'Customer'}
        </Text>
      </View>

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

      {needsAction ? (
        <View className="mt-3 self-start bg-acid px-2.5 py-1">
          <Text className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
            Needs action
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
