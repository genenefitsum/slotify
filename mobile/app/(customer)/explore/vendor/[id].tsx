import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Clock, MapPin, Star, WifiOff } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewItem } from '@/components/reviews/ReviewItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useHaptics } from '@/hooks/useHaptics';
import { useVendorReviews } from '@/hooks/useReviews';
import { useVendorServices } from '@/hooks/useServices';
import { useVendor } from '@/hooks/useVendors';
import { formatDuration, formatPrice, formatRating } from '@/lib/format';
import { colors } from '@/theme/colors';
import type { Service } from '@/types/service';
import type { WorkingHour } from '@/types/vendor';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function VendorDetail() {
  const insets = useSafeAreaInsets();
  const haptics = useHaptics();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: vendor, isLoading, isError, refetch } = useVendor(id);
  const { data: servicesData } = useVendorServices(id);
  const { data: reviews } = useVendorReviews(id);

  const services = servicesData?.items ?? [];
  const reviewList = reviews ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <Skeleton height={280} />
        <View className="gap-3 p-6">
          <Skeleton height={32} width="60%" />
          <Skeleton height={16} width="40%" />
          <Skeleton height={80} />
        </View>
      </View>
    );
  }

  if (isError || !vendor) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        <FloatingBack top={insets.top} />
        <EmptyState
          icon={WifiOff}
          title="Can't load this vendor"
          message="Something went wrong fetching the details."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </View>
    );
  }

  const openInMaps = () => {
    const [lng, lat] = vendor.location.coordinates?.coordinates ?? [];
    const query =
      lat != null && lng != null
        ? `${lat},${lng}`
        : encodeURIComponent(`${vendor.displayName} ${vendor.location.city}`);
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Hero */}
        <View className="aspect-[4/3] w-full bg-ink/5">
          {vendor.imageUrl ? (
            <Image
              source={{ uri: vendor.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <View className="h-14 w-14 items-center justify-center bg-ink">
                <View className="h-4 w-4 bg-acid" />
              </View>
            </View>
          )}
        </View>
        <FloatingBack top={insets.top} />

        {/* Body */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1 bg-acid px-2 py-1">
              <Star size={12} color={colors.ink} fill={colors.ink} />
              <Text className="font-mono text-[11px] font-bold text-ink">
                {formatRating(vendor.averageRating)}
              </Text>
            </View>
            <Text className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/50">
              {vendor.reviewCount} reviews
            </Text>
          </View>

          <Text className="mt-3 font-display text-4xl uppercase leading-[0.95] tracking-tight text-ink">
            {vendor.displayName}
          </Text>

          <Pressable onPress={openInMaps} className="mt-3 flex-row items-center gap-1.5">
            <MapPin size={15} color={colors.inkMuted} strokeWidth={2} />
            <Text className="font-sans text-sm text-ink/60 underline">
              {[vendor.location.addressLine1, vendor.location.city].filter(Boolean).join(', ')}
            </Text>
          </Pressable>

          {vendor.categories.length ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {vendor.categories.map((c) => (
                <View key={c} className="border border-ink/20 px-2.5 py-1">
                  <Text className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/70">
                    {c}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {vendor.description ? (
            <Text className="mt-5 font-sans text-base leading-relaxed text-ink/70">
              {vendor.description}
            </Text>
          ) : null}

          {/* Services */}
          <SectionTitle label="Services" />
          {services.length ? (
            <View className="gap-3">
              {services.map((service) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  onBook={() => {
                    haptics.light();
                    router.push({
                      pathname: '/explore/book/[serviceId]',
                      params: { serviceId: service.id, vendorId: vendor.id },
                    });
                  }}
                />
              ))}
            </View>
          ) : (
            <Text className="font-sans text-sm text-ink/50">No services listed yet.</Text>
          )}

          {/* Hours */}
          <SectionTitle label="Working hours" />
          <View className="border border-ink/15 bg-white">
            {vendor.workingHours.length ? (
              vendor.workingHours.map((wh) => <HoursRow key={wh.dayOfWeek} wh={wh} />)
            ) : (
              <Text className="p-4 font-sans text-sm text-ink/50">Not provided.</Text>
            )}
          </View>

          {/* Reviews */}
          <SectionTitle label="Reviews" />
          {reviewList.length ? (
            <View className="gap-3">
              {reviewList.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </View>
          ) : (
            <Text className="font-sans text-sm text-ink/50">No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function FloatingBack({ top }: { top: number }) {
  const haptics = useHaptics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={12}
      onPress={() => {
        haptics.light();
        router.back();
      }}
      style={{ top: top + 8 }}
      className="absolute left-5 h-11 w-11 items-center justify-center border border-ink bg-canvas"
    >
      <ChevronLeft size={22} color={colors.ink} strokeWidth={2.5} />
    </Pressable>
  );
}

function SectionTitle({ label }: { label: string }) {
  return (
    <Text className="mb-3 mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
      {label}
    </Text>
  );
}

function ServiceRow({ service, onBook }: { service: Service; onBook: () => void }) {
  return (
    <View className="flex-row items-center justify-between border border-ink/15 bg-white p-4">
      <View className="flex-1 pr-3">
        <Text numberOfLines={1} className="font-sans-bold text-base text-ink">
          {service.name}
        </Text>
        <View className="mt-1 flex-row items-center gap-1.5">
          <Clock size={13} color={colors.inkMuted} strokeWidth={2} />
          <Text className="font-mono text-[11px] uppercase tracking-wide text-ink/50">
            {formatDuration(service.durationMinutes)}
          </Text>
          <Text className="font-sans-bold text-sm text-ink">
            · {formatPrice(service.priceAmount, service.currency)}
          </Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Book ${service.name}`}
        onPress={onBook}
        className="bg-ink px-4 py-2.5 active:opacity-80"
      >
        <Text className="font-display text-xs uppercase tracking-wide text-canvas">Book</Text>
      </Pressable>
    </View>
  );
}

function HoursRow({ wh }: { wh: WorkingHour }) {
  return (
    <View className="flex-row items-center justify-between border-b border-ink/10 px-4 py-3">
      <Text className="font-sans-bold text-sm text-ink">{DAYS[wh.dayOfWeek] ?? '—'}</Text>
      <Text className="font-mono text-xs uppercase tracking-wide text-ink/60">
        {wh.isEnabled ? `${wh.startTime} – ${wh.endTime}` : 'Closed'}
      </Text>
    </View>
  );
}
