import { http } from '@/api/http';
import type {
  Booking,
  BookingAvailabilityQuery,
  BookingAvailabilityResponse,
  BookingListQuery,
  BookingListResponse,
  CancelBookingPayload,
  CreateBookingPayload,
} from '@/types/booking';

export const bookingsApi = {
  list: (query?: BookingListQuery) => http.get<BookingListResponse>('/bookings', query),
  getById: (id: string) => http.get<Booking>(`/bookings/${id}`),
  create: (payload: CreateBookingPayload) => http.post<Booking>('/bookings', payload),
  confirm: (id: string) => http.post<Booking>(`/bookings/${id}/confirm`),
  start: (id: string) => http.post<Booking>(`/bookings/${id}/start`),
  complete: (id: string) => http.post<Booking>(`/bookings/${id}/complete`),
  cancel: (id: string, payload?: CancelBookingPayload) =>
    http.post<Booking>(`/bookings/${id}/cancel`, payload),
  markNoShow: (id: string) => http.post<Booking>(`/bookings/${id}/no-show`),
  listAvailableSlots: (query: BookingAvailabilityQuery) =>
    http.get<BookingAvailabilityResponse>('/bookings/availability/slots', query),
};
