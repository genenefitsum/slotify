import { http } from '@/api/http';
import type { CreateReviewPayload, Review } from '@/types/review';

export const reviewsApi = {
  listByVendor: (vendorId: string) => http.get<Review[]>(`/reviews/vendor/${vendorId}`),
  createForVendor: (vendorId: string, payload: CreateReviewPayload) =>
    http.post<Review | { message: string }>(`/reviews/vendor/${vendorId}`, payload),
};
