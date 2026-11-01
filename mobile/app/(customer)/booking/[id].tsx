import { useLocalSearchParams } from 'expo-router';
import { WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/http';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { useBooking, useCancelBooking } from '@/hooks/useBookings';
import { useCreateReview } from '@/hooks/useReviews';
import { useHaptics } from '@/hooks/useHaptics';
import { canCustomerCancel, canReview } from '@/lib/bookingStatus';
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format';
import { colors } from '@/theme/colors';

export default function BookingDetail() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBooking(id);

  const cancelBooking = useCancelBooking();
  const createReview = useCreateReview(booking?.vendorId ?? '');

  const [sheet, setSheet] = useState<'cancel' | 'review' | null>(null);
  const [reason, setReason] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Skeleton while the booking is loading (unless the list cache already seeded
  // it, in which case we render straight through).
  if (isLoading && !booking) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-2">
          <BackButton />
          <View className="mt-6 gap-3">
            <Skeleton height={32} width="70%" />
            <Skeleton height={16} width="40%" />
            <Skeleton height={120} />
          </View>
        </View>
      </View>
    );
  }

  if (isError || !booking) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <View className="px-6 pt-2">
          <BackButton />
        </View>
        <EmptyState
          icon={WifiOff}
          title={isError ? "Can't load booking" : 'Booking not found'}
          message={isError ? 'Check your connection and try again.' : 'It may have been removed.'}
          actionLabel={isError ? 'Retry' : undefined}
          onAction={isError ? () => void refetch() : undefined}
        />
      </View>
    );
  }

  const { pricingSnapshot: price } = booking;

  const onCancel = () => {
    cancelBooking.mutate(
      { id: booking.id, payload: reason.trim() ? { reasonText: reason.trim() } : undefined },
      {
        onSuccess: () => {
          haptics.success();
          setSheet(null);
          setReason('');
        },
        onError: (error) => {
          haptics.error();
          Alert.alert('Could not cancel', getErrorMessage(error));
        },
      }
    );
  };

  const onSubmitReview = () => {
    createReview.mutate(
      { bookingId: booking.id, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          haptics.success();
          setSheet(null);
          setComment('');
          Alert.alert('Thanks!', 'Your review has been submitted.');
        },
        onError: (error) => {
          haptics.error();
          Alert.alert('Could not submit review', getErrorMessage(error));
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-2">
        <BackButton />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
      >
        <View className="mt-4 flex-row items-center justify-between">
          <Text className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
            {booking.bookingNumber}
          </Text>
          <StatusBadge status={booking.status} />
        </View>

        <Text className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink">
          {booking.serviceName ?? 'Service'}
        </Text>
        {booking.vendorName ? (
          <Text className="mt-2 font-sans text-base text-ink/60">{booking.vendorName}</Text>
        ) : null}

        {/* When */}
        <View className="mt-6 border border-ink bg-white p-5">
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">When</Text>
          <Text className="mt-2 font-display text-2xl uppercase tracking-tight text-ink">
            {formatBookingDate(booking.startsAtUtc)}
          </Text>
          <Text className="mt-1 font-sans text-base text-ink/70">
            {formatBookingTime(booking.startsAtUtc)} – {formatBookingTime(booking.endsAtUtc)}
          </Text>
        </View>

        {/* Pricing */}
        <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          Pricing
        </Text>
        <View className="border border-ink/15 bg-white">
          <PriceRow label="Service" value={formatPrice(price.servicePriceAmount, price.currency)} />
          {price.depositAmount > 0 ? (
            <PriceRow label="Deposit" value={formatPrice(price.depositAmount, price.currency)} />
          ) : null}
        </View>

        {booking.customerNotes ? (
          <>
            <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
              Your notes
            </Text>
            <Text className="font-sans text-base leading-relaxed text-ink/70">
              {booking.customerNotes}
            </Text>
          </>
        ) : null}

        {/* Actions */}
        <View className="mt-10 gap-3">
          {canReview(booking.status) ? (
            <Button label="Leave a review" onPress={() => setSheet('review')} />
          ) : null}
          {canCustomerCancel(booking.status) ? (
            <Button
              label="Cancel booking"
              variant="outline"
              onPress={() => setSheet('cancel')}
            />
          ) : null}
        </View>
      </ScrollView>

      {/* Cancel sheet */}
      <Sheet visible={sheet === 'cancel'} onClose={() => setSheet(null)} title="Cancel booking">
        <Text className="font-sans text-base text-ink/60">
          Let the pro know why (optional).
        </Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="Reason"
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.ink}
          multiline
          className="mt-4 min-h-[80px] border border-ink/15 bg-white p-4 font-sans text-base text-ink"
          style={{ textAlignVertical: 'top' }}
        />
        <View className="mt-5">
          <Button
            label="Cancel this booking"
            variant="outline"
            loading={cancelBooking.isPending}
            onPress={onCancel}
          />
        </View>
      </Sheet>

      {/* Review sheet */}
      <Sheet visible={sheet === 'review'} onClose={() => setSheet(null)} title="Leave a review">
        <Text className="font-sans text-base text-ink/60">How was your experience?</Text>
        <View className="mt-4">
          <StarRating value={rating} onChange={setRating} size={32} />
        </View>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Share the details (optional)"
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.ink}
          multiline
          className="mt-5 min-h-[96px] border border-ink/15 bg-white p-4 font-sans text-base text-ink"
          style={{ textAlignVertical: 'top' }}
        />
        <View className="mt-5">
          <Button label="Submit review" loading={createReview.isPending} onPress={onSubmitReview} />
        </View>
      </Sheet>
    </View>
  );
}

function PriceRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View className="flex-row items-center justify-between border-b border-ink/10 px-4 py-3.5">
      <Text className="font-sans text-base text-ink/70">{label}</Text>
      <Text className="font-sans-bold text-base text-ink">{value ?? '—'}</Text>
    </View>
  );
}
