import { useRouter } from 'expo-router';
import {
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  type LucideIcon,
  Star,
  Store,
  WifiOff,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBadge } from '@/components/bookings/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useVendorBookings } from '@/hooks/useBookings';
import { useMyServices } from '@/hooks/useServices';
import { useMyVendor } from '@/hooks/useMyVendor';
import { cn } from '@/lib/cn';
import {
  formatBookingDate,
  formatBookingTime,
  formatPrice,
  formatRating,
  greeting,
} from '@/lib/format';
import { getAllowedVendorActions, VENDOR_STATUS_META } from '@/lib/vendor';
import { colors } from '@/theme/colors';
import type { Booking } from '@/types/booking';

const NEEDS_ACTION_PREVIEW = 4;

export default function VendorDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const vendor = useMyVendor();
  const services = useMyServices(vendor.data?.id);
  const bookings = useVendorBookings({ all: true });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([vendor.refetch(), services.refetch(), bookings.refetch()]);
    } finally {
      setRefreshing(false);
    }
  };

  const serviceItems = useMemo(() => services.data?.items ?? [], [services.data]);
  const bookingItems = useMemo(() => bookings.data?.items ?? [], [bookings.data]);

  // Bookings that still need the vendor to act, soonest first.
  const needsAction = useMemo(
    () =>
      bookingItems
        .filter((b) => getAllowedVendorActions(b.status).length > 0)
        .sort((a, b) => +new Date(a.startsAtUtc) - +new Date(b.startsAtUtc)),
    [bookingItems],
  );

  // Soonest live booking still needing attention — powers the "next booking" line.
  // `needsAction` is already the live statuses sorted soonest-first.
  const nextBooking = needsAction[0] ?? null;

  const publishedCount = services.data?.pagination.total ?? serviceItems.length;
  const averagePrice =
    serviceItems.length > 0
      ? Math.round(
          serviceItems.reduce((sum, s) => sum + s.priceAmount, 0) / serviceItems.length,
        )
      : 0;
  const currency = serviceItems[0]?.currency ?? 'ETB';
  const statusMeta = vendor.data ? VENDOR_STATUS_META[vendor.data.status] : null;

  const businessName = vendor.data?.displayName?.trim();
  const headline = businessName || user?.firstName?.trim() || 'Your business';

  const loading = vendor.isLoading || (vendor.data && (services.isLoading || bookings.isLoading));
  const hardError = vendor.isError && !vendor.isMissing;

  const header = (
    <View className="pb-2 pt-2">
      <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
        {greeting()}
      </Text>
      <Text
        numberOfLines={1}
        className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink"
      >
        {headline}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />
        }
      >
        {header}

        {hardError ? (
          <EmptyState
            icon={WifiOff}
            title="Can't load dashboard"
            message="Check your connection and the API, then try again."
            actionLabel="Retry"
            onAction={() => void vendor.refetch()}
          />
        ) : vendor.isMissing ? (
          <OnboardingCTA onPress={() => router.push('/business')} />
        ) : loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Stat tiles */}
            <View className="mt-5 gap-3">
              <View className="flex-row gap-3">
                <StatTile
                  icon={BriefcaseBusiness}
                  label="Services"
                  value={String(publishedCount)}
                />
                <StatTile
                  icon={CalendarClock}
                  label="Needs action"
                  value={String(needsAction.length)}
                  accent={needsAction.length > 0}
                />
              </View>
              <View className="flex-row gap-3">
                <StatTile
                  icon={CircleDollarSign}
                  label="Avg price"
                  value={formatPrice(averagePrice, currency) ?? '—'}
                />
                <StatTile
                  icon={Store}
                  label="Status"
                  value={statusMeta?.label ?? '—'}
                />
              </View>
            </View>

            {/* Next booking */}
            {nextBooking ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View next booking"
                onPress={() => router.push('/orders')}
                className="mt-3 flex-row items-center gap-2.5 border border-ink/15 bg-white px-4 py-3 active:bg-ink/5"
              >
                <CalendarClock size={15} color={colors.ink} strokeWidth={2} />
                <Text className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
                  Next
                </Text>
                <Text numberOfLines={1} className="flex-1 font-sans text-sm text-ink/80">
                  {formatBookingDate(nextBooking.startsAtUtc)} ·{' '}
                  {formatBookingTime(nextBooking.startsAtUtc)}
                </Text>
                <ChevronRight size={16} color={colors.inkSubtle} strokeWidth={2} />
              </Pressable>
            ) : null}

            {/* Reviews */}
            {vendor.data ? (
              <ReviewsCard
                averageRating={vendor.data.averageRating}
                reviewCount={vendor.data.reviewCount}
                onPress={() => router.push('/reviews')}
              />
            ) : null}

            {/* Needs action */}
            <View className="mt-9 flex-row items-end justify-between">
              <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
                Needs action
              </Text>
              {needsAction.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all bookings"
                  onPress={() => router.push('/orders')}
                  className="active:opacity-70"
                >
                  <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/40">
                    View all
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {needsAction.length === 0 ? (
              <View className="mt-4 items-center border border-ink/15 bg-white px-6 py-10">
                <CalendarClock size={24} color={colors.inkMuted} strokeWidth={2} />
                <Text className="mt-3 text-center font-sans text-sm text-ink/60">
                  All caught up. Incoming bookings that need a response will show here.
                </Text>
              </View>
            ) : (
              <View className="mt-4 gap-3">
                {needsAction.slice(0, NEEDS_ACTION_PREVIEW).map((booking) => (
                  <NeedsActionRow
                    key={booking.id}
                    booking={booking}
                    onPress={() => router.push('/orders')}
                  />
                ))}
              </View>
            )}

            <View className="mt-6">
              <Button
                label="Manage bookings"
                variant="outline"
                icon={ChevronRight}
                onPress={() => router.push('/orders')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Single metric tile: mono label + large display value, optional acid accent. */
function StatTile({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View
      className={cn(
        'flex-1 border p-4',
        accent ? 'border-ink bg-acid' : 'border-ink/15 bg-white',
      )}
    >
      <Icon size={18} color={colors.ink} strokeWidth={2} />
      <Text
        numberOfLines={1}
        className="mt-6 font-display text-3xl uppercase leading-none tracking-tight text-ink"
      >
        {value}
      </Text>
      <Text className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
        {label}
      </Text>
    </View>
  );
}

/** Rating summary that doubles as the entry point to the full reviews list. */
function ReviewsCard({
  averageRating,
  reviewCount,
  onPress,
}: {
  averageRating: number;
  reviewCount: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View reviews"
      onPress={onPress}
      className="mt-3 flex-row items-center gap-3 border border-ink/15 bg-white p-4 active:bg-ink/5"
    >
      <View className="h-11 w-11 items-center justify-center bg-acid">
        <Star size={20} color={colors.ink} fill={colors.ink} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className="font-display text-2xl uppercase leading-none tracking-tight text-ink">
          {reviewCount > 0 ? formatRating(averageRating) : 'No reviews'}
        </Text>
        <Text className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
          {reviewCount > 0
            ? `${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}`
            : 'Reviews will appear here'}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
    </Pressable>
  );
}

/** Compact booking row for the needs-action list. */
function NeedsActionRow({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.serviceName ?? 'Booking'} ${booking.bookingNumber}`}
      onPress={onPress}
      className="flex-row items-center gap-3 border border-ink/15 bg-white p-4 active:bg-ink/5"
    >
      <View className="flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <Text
            numberOfLines={1}
            className="flex-1 font-display text-lg uppercase tracking-tight text-ink"
          >
            {booking.serviceName ?? 'Service'}
          </Text>
          <StatusBadge status={booking.status} />
        </View>
        {booking.customerName ? (
          <Text
            numberOfLines={1}
            className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50"
          >
            {booking.customerName}
          </Text>
        ) : null}
        <View className="mt-3 flex-row items-center gap-1.5">
          <CalendarClock size={14} color={colors.inkMuted} strokeWidth={2} />
          <Text className="font-sans text-xs text-ink/70">
            {formatBookingDate(booking.startsAtUtc)} · {formatBookingTime(booking.startsAtUtc)}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
    </Pressable>
  );
}

/** Shown when the vendor has no profile yet — points them to onboarding. */
function OnboardingCTA({ onPress }: { onPress: () => void }) {
  return (
    <View className="mt-5 border border-ink bg-white p-6">
      <View className="h-12 w-12 items-center justify-center bg-acid">
        <Store size={22} color={colors.ink} strokeWidth={2} />
      </View>
      <Text className="mt-5 font-display text-2xl uppercase tracking-tight text-ink">
        Set up your business
      </Text>
      <Text className="mt-2 font-sans text-sm leading-relaxed text-ink/60">
        Create your business profile to appear on the marketplace, publish services, and start
        taking bookings.
      </Text>
      <View className="mt-6">
        <Button label="Get started" icon={ChevronRight} onPress={onPress} />
      </View>
    </View>
  );
}

function DashboardSkeleton() {
  return (
    <View className="mt-5 gap-3">
      <View className="flex-row gap-3">
        <Skeleton className="flex-1" height={108} />
        <Skeleton className="flex-1" height={108} />
      </View>
      <View className="flex-row gap-3">
        <Skeleton className="flex-1" height={108} />
        <Skeleton className="flex-1" height={108} />
      </View>
      <Skeleton className="mt-6" height={16} width="40%" />
      <Skeleton height={96} />
      <Skeleton height={96} />
    </View>
  );
}
