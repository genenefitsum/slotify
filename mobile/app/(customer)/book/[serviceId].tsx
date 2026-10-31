import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getErrorMessage } from '@/api/http';
import { useAvailability, useCreateBooking } from '@/hooks/useBookings';
import { useHaptics } from '@/hooks/useHaptics';
import { useVendorServices } from '@/hooks/useServices';
import { useVendor } from '@/hooks/useVendors';
import { cn } from '@/lib/cn';
import { computeDepositAmount, formatDuration, formatPrice, toLocalDateKey } from '@/lib/format';
import { colors } from '@/theme/colors';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookService() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { serviceId, vendorId } = useLocalSearchParams<{ serviceId: string; vendorId: string }>();

  const { data: vendor } = useVendor(vendorId);
  const { data: servicesData } = useVendorServices(vendorId);
  const service = servicesData?.items.find((s) => s.id === serviceId);

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const localDate = toLocalDateKey(selectedDate);
  const availabilityQuery =
    vendorId && serviceId ? { vendorId, serviceId, localDate } : null;
  const { data: availability, isLoading: slotsLoading } = useAvailability(availabilityQuery);
  const slots = availability?.items ?? [];

  const createBooking = useCreateBooking();

  const deposit = service
    ? computeDepositAmount(service.priceAmount, service.depositType, service.depositValue)
    : 0;

  const onConfirm = () => {
    if (!selectedSlot || !service) return;
    createBooking.mutate(
      {
        serviceId: service.id,
        startsAtUtc: selectedSlot,
        localTimezone: vendor?.timezone,
        customerNotes: notes.trim() || undefined,
      },
      {
        onSuccess: (booking) => {
          haptics.success();
          router.replace(`/booking/${booking.id}`);
        },
        onError: (error) => {
          haptics.error();
          Alert.alert('Booking failed', getErrorMessage(error));
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <View className="px-6 pb-2 pt-2">
        <BackButton />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service header */}
        <Text className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          {vendor?.displayName ?? 'Booking'}
        </Text>
        <Text className="mt-1.5 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink">
          {service?.name ?? 'Service'}
        </Text>
        {service ? (
          <Text className="mt-2 font-sans text-base text-ink/60">
            {formatDuration(service.durationMinutes)} ·{' '}
            {formatPrice(service.priceAmount, service.currency)}
          </Text>
        ) : null}

        {/* Date */}
        <SectionLabel>Choose a date</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-6"
          contentContainerClassName="gap-2 px-6"
        >
          {days.map((day) => {
            const active = toLocalDateKey(day) === localDate;
            return (
              <Pressable
                key={day.toISOString()}
                onPress={() => {
                  haptics.selection();
                  setSelectedDate(day);
                  setSelectedSlot(null);
                }}
                className={cn(
                  'h-20 w-16 items-center justify-center border',
                  active ? 'border-ink bg-ink' : 'border-ink/15 bg-white'
                )}
              >
                <Text
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-wide',
                    active ? 'text-canvas/70' : 'text-ink/40'
                  )}
                >
                  {WEEKDAYS[day.getDay()]}
                </Text>
                <Text
                  className={cn(
                    'mt-1 font-display text-2xl',
                    active ? 'text-canvas' : 'text-ink'
                  )}
                >
                  {day.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Slots */}
        <SectionLabel>Available times</SectionLabel>
        {slotsLoading ? (
          <View className="flex-row flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height={44} width={92} />
            ))}
          </View>
        ) : slots.length === 0 ? (
          <Text className="font-sans text-sm text-ink/50">
            No availability on this day. Try another date.
          </Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {slots.map((slot) => {
              const selected = slot.startsAtUtc === selectedSlot;
              return (
                <Pressable
                  key={slot.startsAtUtc}
                  disabled={!slot.isAvailable}
                  onPress={() => {
                    haptics.selection();
                    setSelectedSlot(slot.startsAtUtc);
                  }}
                  className={cn(
                    'h-11 min-w-[92px] items-center justify-center border px-3',
                    !slot.isAvailable
                      ? 'border-ink/10 bg-ink/5'
                      : selected
                        ? 'border-ink bg-ink'
                        : 'border-ink/20 bg-white'
                  )}
                >
                  <Text
                    className={cn(
                      'font-sans-bold text-sm',
                      !slot.isAvailable
                        ? 'text-ink/25 line-through'
                        : selected
                          ? 'text-canvas'
                          : 'text-ink'
                    )}
                  >
                    {slot.localStartTime}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Notes */}
        <SectionLabel>Notes (optional)</SectionLabel>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Anything the pro should know?"
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.ink}
          multiline
          className="min-h-[88px] border border-ink/15 bg-white p-4 font-sans text-base text-ink"
          style={{ textAlignVertical: 'top' }}
        />
      </ScrollView>

      {/* Pinned summary + confirm */}
      <View
        className="border-t border-ink/10 bg-canvas px-6 pt-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink/50">
            {deposit > 0 ? 'Deposit due' : 'Total'}
          </Text>
          <Text className="font-display text-2xl text-ink">
            {service
              ? formatPrice(deposit > 0 ? deposit : service.priceAmount, service.currency)
              : '—'}
          </Text>
        </View>
        <Button
          label="Confirm booking"
          loading={createBooking.isPending}
          disabled={!selectedSlot || !service}
          onPress={onConfirm}
        />
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
      {children}
    </Text>
  );
}
