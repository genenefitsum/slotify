import { useLocalSearchParams } from 'expo-router';
import { Mail, WifiOff } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/http';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Sheet } from '@/components/ui/Sheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBooking, useBookingAction, useCancelBooking } from '@/hooks/useBookings';
import { useHaptics } from '@/hooks/useHaptics';
import { showAlert } from '@/lib/alert';
import { formatBookingDate, formatBookingTime, formatPrice } from '@/lib/format';
import { BOOKING_ACTION_LABELS, getAllowedVendorActions } from '@/lib/vendor';
import { colors } from '@/theme/colors';
import type { BookingTransitionAction } from '@/types/booking';

/** Confirmation copy for the irreversible lifecycle steps. */
const CONFIRM_COPY: Record<Exclude<BookingTransitionAction, 'cancel'>, { title: string; body: string }> =
  {
    confirm: { title: 'Confirm booking?', body: 'The customer will be notified their booking is confirmed.' },
    start: { title: 'Start appointment?', body: 'Mark this booking as in service now.' },
    complete: { title: 'Complete booking?', body: 'Mark this appointment as finished.' },
    'no-show': { title: 'Mark as no-show?', body: 'Record that the customer did not show up.' },
  };

export default function VendorBookingDetail() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: booking, isLoading, isError, refetch } = useBooking(id);

  const bookingAction = useBookingAction();
  const cancelBooking = useCancelBooking();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState('');

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
  const actions = getAllowedVendorActions(booking.status);

  const runAction = (action: Exclude<BookingTransitionAction, 'cancel'>) => {
    haptics.selection();
    const copy = CONFIRM_COPY[action];
    showAlert(copy.title, copy.body, [
      { text: 'Back', style: 'cancel' },
      {
        text: BOOKING_ACTION_LABELS[action],
        onPress: () =>
          bookingAction.mutate(
            { id: booking.id, action },
            {
              onSuccess: () => haptics.success(),
              onError: (error) => {
                haptics.error();
                showAlert('Could not update booking', getErrorMessage(error));
              },
            },
          ),
      },
    ]);
  };

  const onCancel = () => {
    cancelBooking.mutate(
      { id: booking.id, payload: reason.trim() ? { reasonText: reason.trim() } : undefined },
      {
        onSuccess: () => {
          haptics.success();
          setCancelOpen(false);
          setReason('');
        },
        onError: (error) => {
          haptics.error();
          showAlert('Could not cancel', getErrorMessage(error));
        },
      },
    );
  };

  const isBusy = bookingAction.isPending || cancelBooking.isPending;

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

        {/* Customer */}
        <View className="mt-6 border border-ink bg-white p-5">
          <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
            Customer
          </Text>
          <Text className="mt-2 font-display text-2xl uppercase tracking-tight text-ink">
            {booking.customerName ?? 'Customer'}
          </Text>
          {booking.customerEmail ? (
            <View className="mt-1 flex-row items-center gap-1.5">
              <Mail size={14} color={colors.inkMuted} strokeWidth={2} />
              <Text className="font-sans text-base text-ink/70">{booking.customerEmail}</Text>
            </View>
          ) : null}
        </View>

        {/* When */}
        <View className="mt-4 border border-ink/15 bg-white p-5">
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
          {price.commissionAmount > 0 ? (
            <PriceRow label="Commission" value={`– ${formatPrice(price.commissionAmount, price.currency)}`} />
          ) : null}
          <PriceRow
            label="Net to you"
            value={formatPrice(price.netPayableToVendor, price.currency)}
            emphasis
            last
          />
        </View>

        {/* Customer notes */}
        {booking.customerNotes ? (
          <>
            <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
              Customer notes
            </Text>
            <Text className="font-sans text-base leading-relaxed text-ink/70">
              {booking.customerNotes}
            </Text>
          </>
        ) : null}

        {/* Cancellation detail */}
        {booking.status === 'cancelled' && booking.cancellation?.reasonText ? (
          <>
            <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
              Cancellation reason
            </Text>
            <Text className="font-sans text-base leading-relaxed text-ink/70">
              {booking.cancellation.reasonText}
            </Text>
          </>
        ) : null}

        {/* Lifecycle actions */}
        {actions.length > 0 ? (
          <View className="mt-10 gap-3">
            {actions.map((action) => {
              const isActionPending =
                bookingAction.isPending && bookingAction.variables?.action === action;
              const destructive = action === 'cancel' || action === 'no-show';
              return (
                <Button
                  key={action}
                  label={BOOKING_ACTION_LABELS[action]}
                  variant={destructive ? 'outline' : 'primary'}
                  loading={isActionPending}
                  disabled={isBusy && !isActionPending}
                  onPress={() => (action === 'cancel' ? setCancelOpen(true) : runAction(action))}
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {/* Cancel reason sheet */}
      <Sheet visible={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking">
        <Text className="font-sans text-base text-ink/60">
          Let the customer know why (optional).
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
    </View>
  );
}

function PriceRow({
  label,
  value,
  emphasis = false,
  last = false,
}: {
  label: string;
  value: string | null;
  emphasis?: boolean;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between px-4 py-3.5 ${last ? '' : 'border-b border-ink/10'}`}
    >
      <Text className={emphasis ? 'font-sans-bold text-base text-ink' : 'font-sans text-base text-ink/70'}>
        {label}
      </Text>
      <Text className="font-sans-bold text-base text-ink">{value ?? '—'}</Text>
    </View>
  );
}
