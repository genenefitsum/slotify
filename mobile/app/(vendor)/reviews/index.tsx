import { FlashList } from '@shopify/flash-list';
import { MessageSquareText, Store, WifiOff } from 'lucide-react-native';
import { RefreshControl, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewItem } from '@/components/reviews/ReviewItem';
import { BackButton } from '@/components/ui/BackButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StarRating } from '@/components/ui/StarRating';
import { useMyVendor } from '@/hooks/useMyVendor';
import { useVendorReviews } from '@/hooks/useReviews';
import { formatRating } from '@/lib/format';
import { colors } from '@/theme/colors';

export default function VendorReviews() {
  const insets = useSafeAreaInsets();

  const vendor = useMyVendor();
  const vendorId = vendor.data?.id;
  const reviews = useVendorReviews(vendorId);

  const reviewList = reviews.data ?? [];

  const title = (
    <View className="px-6">
      <View className="pt-2">
        <BackButton />
      </View>
      <View className="pb-1 pt-6">
        <Text className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/50">
          What customers say
        </Text>
        <Text className="mt-1.5 font-display text-5xl uppercase leading-[0.9] tracking-tight text-ink">
          Reviews
        </Text>
      </View>

      {vendor.data ? (
        <View className="mt-5 flex-row items-center gap-5 border border-ink/15 bg-white p-5">
          <View className="items-center">
            <Text className="font-display text-5xl uppercase leading-none tracking-tight text-ink">
              {vendor.data.reviewCount > 0 ? formatRating(vendor.data.averageRating) : '—'}
            </Text>
            <View className="mt-2.5">
              <StarRating value={vendor.data.averageRating} size={14} />
            </View>
          </View>
          <View className="h-12 w-px bg-ink/10" />
          <View className="flex-1">
            <Text className="font-display text-3xl uppercase leading-none tracking-tight text-ink">
              {vendor.data.reviewCount}
            </Text>
            <Text className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
              {vendor.data.reviewCount === 1 ? 'Review' : 'Reviews'}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View className="flex-1 bg-canvas" style={{ paddingTop: insets.top }}>
      {title}

      {vendor.isMissing ? (
        <EmptyState
          icon={Store}
          title="No business yet"
          message="Create your business profile to start collecting reviews from customers."
        />
      ) : vendor.isError ? (
        <EmptyState
          icon={WifiOff}
          title="Can't load reviews"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void vendor.refetch()}
        />
      ) : vendor.isLoading || reviews.isLoading ? (
        <View className="mt-5 gap-3 px-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={96} />
          ))}
        </View>
      ) : reviews.isError ? (
        <EmptyState
          icon={WifiOff}
          title="Can't load reviews"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void reviews.refetch()}
        />
      ) : (
        <FlashList
          data={reviewList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReviewItem review={item} />}
          ItemSeparatorComponent={() => <View className="h-3" />}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: insets.bottom + 48,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={reviews.isRefetching}
              onRefresh={() => void reviews.refetch()}
              tintColor={colors.ink}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={MessageSquareText}
              title="No reviews yet"
              message="Once customers complete bookings, their reviews will appear here."
            />
          }
        />
      )}
    </View>
  );
}
