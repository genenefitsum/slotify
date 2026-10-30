import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { reviewsApi } from '@/api/reviews.api';
import type { CreateReviewPayload } from '@/types/review';

/** Published reviews for a vendor (public). */
export function useVendorReviews(vendorId?: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byVendor(vendorId ?? ''),
    queryFn: () => reviewsApi.listByVendor(vendorId as string),
    enabled: Boolean(vendorId),
  });
}

export function useCreateReview(vendorId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewsApi.createForVendor(vendorId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.reviews.byVendor(vendorId) });
      void qc.invalidateQueries({ queryKey: queryKeys.vendors.detail(vendorId) });
    },
  });
}
