import { Text, View } from 'react-native';

import { StarRating } from '@/components/ui/StarRating';
import { formatBookingDate } from '@/lib/format';
import type { Review } from '@/types/review';

export function ReviewItem({ review }: { review: Review }) {
  return (
    <View className="border border-ink/15 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <StarRating value={review.rating} size={14} />
        <Text className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink/40">
          {formatBookingDate(review.createdAt)}
        </Text>
      </View>
      {review.comment ? (
        <Text className="mt-2.5 font-sans text-sm leading-relaxed text-ink/70">{review.comment}</Text>
      ) : null}
    </View>
  );
}
