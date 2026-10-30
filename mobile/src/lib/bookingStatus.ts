import type { BookingStatus } from '@/types/booking';

export type StatusTone = 'ink' | 'acid' | 'muted' | 'destructive';

/** Display label + visual tone for each booking status. */
export const BOOKING_STATUS_META: Record<BookingStatus, { label: string; tone: StatusTone }> = {
  pending_payment: { label: 'Pending', tone: 'muted' },
  confirmed: { label: 'Confirmed', tone: 'acid' },
  in_service: { label: 'In service', tone: 'ink' },
  completed: { label: 'Completed', tone: 'ink' },
  cancelled: { label: 'Cancelled', tone: 'destructive' },
  no_show: { label: 'No-show', tone: 'destructive' },
};

/** Customers may cancel a booking only before/at service start. */
export function canCustomerCancel(status: BookingStatus): boolean {
  return status === 'pending_payment' || status === 'confirmed';
}

/** A completed booking can be reviewed. */
export function canReview(status: BookingStatus): boolean {
  return status === 'completed';
}
