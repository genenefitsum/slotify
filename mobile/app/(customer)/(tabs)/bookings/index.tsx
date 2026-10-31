import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { CalendarCheck, WifiOff } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookingCard } from '@/components/bookings/BookingCard';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useBookings } from '@/hooks/useBookings';
import { colors } from '@/theme/colors';
import type { BookingStatus } from '@/types/booking';

type Filter = 'All' | 'Upcoming' | 'Completed' | 'Cancelled';
const FILTERS: Filter[] = ['All', 'Upcoming', 'Completed', 'Cancelled'];

const GROUP: Record<Exclude<Filter, 'All'>, BookingStatus[]> = {
  Upcoming: ['pending_payment', 'confirmed', 'in_service'],
  Completed: ['completed'],
  Cancelled: ['cancelled', 'no_show'],
};

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useBookings();
  const [filter, setFilter] = useState<Filter>('All');

  const bookings = useMemo(() => {
    const items = [...(data?.items ?? [])].sort(
      (a, b) => new Date(b.startsAtUtc).getTime() - new Date(a.startsAtUtc).getTime()
    );
    if (filter === 'All') return items;
    return items.filter((b) => GROUP[filter].includes(b.status));
  }, [data, filter]);

  const header = (
    <View className="px-6">
      <View className="pb-1 pt-2">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">Your</Text>
        <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Bookings
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-6 mt-5"
        contentContainerClassName="gap-2 px-6"
      >
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {header}

      {isLoading ? (
        <View className="mt-5 gap-3 px-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={116} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={WifiOff}
          title="Can't load bookings"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      ) : (
        <FlashList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookingCard booking={item} onPress={() => router.push(`/booking/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 96,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={colors.ink}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={CalendarCheck}
              title={filter === 'All' ? 'No bookings yet' : `No ${filter.toLowerCase()} bookings`}
              message={
                filter === 'All'
                  ? 'Book a service from Explore and it’ll show up here.'
                  : 'Nothing in this filter right now.'
              }
            />
          }
        />
      )}
    </View>
  );
}
