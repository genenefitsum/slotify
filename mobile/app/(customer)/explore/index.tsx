import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { Compass, WifiOff } from 'lucide-react-native';
import { RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { VendorCard } from '@/components/vendors/VendorCard';
import { useVendors } from '@/hooks/useVendors';
import { colors } from '@/theme/colors';
import type { Vendor } from '@/types/vendor';

export default function Explore() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useVendors();

  const vendors = data?.items ?? [];

  const header = (
    <View className="px-6 pb-6 pt-2">
      <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
        Discover
      </Text>
      <Text className="mt-2 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
        Explore
      </Text>
      <Text className="mt-3 font-sans text-base text-ink/60">
        Verified pros with real-time availability.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        {header}
        <View className="gap-4 px-6">
          {[0, 1, 2].map((i) => (
            <View key={i} className="border border-ink/10 bg-white">
              <Skeleton height={168} />
              <View className="gap-2 p-4">
                <Skeleton height={22} width="70%" />
                <Skeleton height={12} width="45%" />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
        {header}
        <EmptyState
          icon={WifiOff}
          title="Can't load vendors"
          message="Check your connection and the API URL, then try again."
          actionLabel="Retry"
          onAction={() => void refetch()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      <FlashList
        data={vendors}
        keyExtractor={(item: Vendor) => item.id}
        ListHeaderComponent={header}
        renderItem={({ item }: { item: Vendor }) => (
          <VendorCard vendor={item} onPress={() => router.push(`/explore/vendor/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 96 }}
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
            icon={Compass}
            title="No vendors yet"
            message="Check back soon — new pros are joining all the time."
          />
        }
      />
    </View>
  );
}
