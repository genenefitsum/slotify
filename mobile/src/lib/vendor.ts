import type { StatusTone } from '@/lib/bookingStatus';
import type { BookingStatus, BookingTransitionAction } from '@/types/booking';
import type { BlackoutSlot, VendorStatus, WorkingHour } from '@/types/vendor';

/** Fixed operating timezone for the marketplace (mirrors the web dashboard). */
export const VENDOR_TIMEZONE = 'Africa/Addis_Ababa';

/** Vendor photo / service photo upload ceiling (matches the backend limit). */
export const MAX_IMAGE_COUNT = 5;

export const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/** Display label + tone for each vendor profile status. */
export const VENDOR_STATUS_META: Record<VendorStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Draft', tone: 'muted' },
  pending_verification: { label: 'Pending review', tone: 'acid' },
  active: { label: 'Active', tone: 'ink' },
  suspended: { label: 'Suspended', tone: 'destructive' },
};

/** Mon–Fri 9–6 open by default, matching the web dashboard's seed. */
export const createDefaultWorkingHours = (): WorkingHour[] =>
  DAY_LABELS.map((_, index) => ({
    dayOfWeek: index,
    isEnabled: index >= 1 && index <= 5,
    startTime: '09:00',
    endTime: '18:00',
  }));

export const createEmptyBlackout = (): BlackoutSlot => ({
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  label: '',
});

/** Button label for each booking lifecycle action. */
export const BOOKING_ACTION_LABELS: Record<BookingTransitionAction, string> = {
  confirm: 'Confirm',
  start: 'Start',
  complete: 'Complete',
  cancel: 'Cancel',
  'no-show': 'No-show',
};

/** Lifecycle actions a vendor can take from a booking's current status. */
export const getAllowedVendorActions = (status: BookingStatus): BookingTransitionAction[] => {
  switch (status) {
    case 'pending_payment':
      return ['confirm', 'cancel'];
    case 'confirmed':
      return ['start', 'cancel', 'no-show'];
    case 'in_service':
      return ['complete'];
    default:
      return [];
  }
};
