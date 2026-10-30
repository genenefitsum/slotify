import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { bookingsApi } from '@/api/bookings.api';
import type {
  BookingAvailabilityQuery,
  BookingListQuery,
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
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelBookingPayload }) =>
      bookingsApi.cancel(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['bookings', 'list'] });
    },
  });
}
