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
    // The signed-in vendor's own services, paginated (vendor dashboard).
    mine: (page?: number) => ['services', 'mine', page ?? 1] as const,
  },
  bookings: {
    list: (query?: BookingListQuery) => ['bookings', 'list', query ?? {}] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
    availability: (query: BookingAvailabilityQuery) =>
      ['bookings', 'availability', query] as const,
    // The signed-in vendor's incoming bookings (vendor dashboard).
    vendorList: (query?: BookingListQuery) => ['bookings', 'vendor-list', query ?? {}] as const,
  },
  reviews: {
    byVendor: (vendorId: string) => ['reviews', 'vendor', vendorId] as const,
  },
} as const;
