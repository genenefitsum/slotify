import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { bookingsApi } from '@/api/bookings.api';
import type {
  Booking,
  BookingAvailabilityQuery,
  BookingListQuery,
  BookingListResponse,
  BookingTransitionAction,
  CancelBookingPayload,
  CreateBookingPayload,
} from '@/types/booking';

/** The customer's bookings, optionally filtered by status. */
export function useBookings(query?: BookingListQuery) {
  return useQuery({
    queryKey: queryKeys.bookings.list(query),
    queryFn: () => bookingsApi.list(query),
  });
}

/**
 * The signed-in vendor's incoming bookings (the backend scopes `/bookings` to
 * the vendor when a vendor is authenticated). Kept on its own cache key so it
 * never collides with the customer's list.
 */
export function useVendorBookings(query?: BookingListQuery) {
  return useQuery({
    queryKey: queryKeys.bookings.vendorList(query),
    queryFn: () => bookingsApi.list(query),
    staleTime: 15_000,
  });
}

/** Drive a booking through its lifecycle from the vendor side. */
export function useBookingAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: BookingTransitionAction }) => {
      switch (action) {
        case 'confirm':
          return bookingsApi.confirm(id);
        case 'start':
          return bookingsApi.start(id);
        case 'complete':
          return bookingsApi.complete(id);
        case 'no-show':
          return bookingsApi.markNoShow(id);
        case 'cancel':
          return bookingsApi.cancel(id, {
            reasonCode: 'vendor_update',
            reasonText: 'Cancelled from vendor dashboard',
          });
      }
    },
    onSuccess: (booking) => {
      qc.setQueryData(queryKeys.bookings.detail(booking.id), booking);
      void qc.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

/** Pull a booking out of any cached list/infinite-list query for instant render. */
function seedBookingFromCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
): Booking | undefined {
  // Scan every cached bookings collection — the customer list, the vendor list,
  // and any infinite-list pages. Non-list entries (detail/availability) simply
  // have no matching booking id and fall through.
  const entries = qc.getQueriesData<{ items?: Booking[]; pages?: BookingListResponse[] }>({
    queryKey: ['bookings'],
  });
  for (const [, data] of entries) {
    const items = data?.pages ? data.pages.flatMap((page) => page.items) : data?.items;
    const found = items?.find((b) => b.id === id);
    if (found) return found;
  }
  return undefined;
}

/** A single booking, fetched by id; seeded from the list cache so it renders instantly. */
export function useBooking(id: string) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingsApi.getById(id),
    enabled: Boolean(id),
    placeholderData: () => seedBookingFromCache(qc, id),
  });
}

/** Bookable slots for a service on a given local date. */
export function useAvailability(query: BookingAvailabilityQuery | null) {
  return useQuery({
    queryKey: query ? queryKeys.bookings.availability(query) : ['bookings', 'availability', 'idle'],
    queryFn: () => bookingsApi.listAvailableSlots(query as BookingAvailabilityQuery),
    enabled: Boolean(query),
    staleTime: 30_000,
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingsApi.create(payload),
    onSuccess: (booking) => {
      // Prime the list cache so the detail screen finds the new booking
      // immediately (no "not found" flash), then refetch for server truth.
      qc.setQueryData<BookingListResponse>(queryKeys.bookings.list(), (old) => {
        const items = (old?.items ?? []).filter((b) => b.id !== booking.id);
        return {
          items: [booking, ...items],
          pagination: old?.pagination ?? {
            page: 1,
            limit: 20,
            total: items.length + 1,
            totalPages: 1,
          },
        };
      });
      void qc.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelBookingPayload }) =>
      bookingsApi.cancel(id, payload),
    onSuccess: (booking) => {
      // Reflect the cancelled status in the detail cache immediately, then
      // refresh the lists so segments/counts update.
      qc.setQueryData(queryKeys.bookings.detail(booking.id), booking);
      void qc.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}
