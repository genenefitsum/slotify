import type { BookingAvailabilityQuery, BookingListQuery } from '@/types/booking';
import type { VendorListQuery } from '@/types/vendor';

/** Centralised React Query keys so caches invalidate consistently. */
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  vendors: {
    all: ['vendors'] as const,
    list: (query?: VendorListQuery) => ['vendors', 'list', query ?? {}] as const,
    detail: (id: string) => ['vendors', 'detail', id] as const,
    mine: ['vendors', 'mine'] as const,
  },
  services: {
    list: (vendorId?: string) => ['services', 'list', vendorId ?? null] as const,
  },
  bookings: {
    list: (query?: BookingListQuery) => ['bookings', 'list', query ?? {}] as const,
    availability: (query: BookingAvailabilityQuery) =>
      ['bookings', 'availability', query] as const,
  },
  reviews: {
    byVendor: (vendorId: string) => ['reviews', 'vendor', vendorId] as const,
  },
} as const;
