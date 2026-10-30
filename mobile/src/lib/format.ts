/** Presentation helpers for prices, ratings, and durations. */

export function formatPrice(amount: number | null | undefined, currency = 'ETB'): string | null {
  if (amount === null || amount === undefined) return null;
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatRating(rating: number): string {
  return rating > 0 ? rating.toFixed(1) : 'New';
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function greeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Deposit owed for a service, derived from its deposit policy. */
export function computeDepositAmount(
  priceAmount: number,
  depositType: 'none' | 'fixed' | 'percentage',
  depositValue: number
): number {
  if (depositType === 'fixed') return depositValue;
  if (depositType === 'percentage') return Math.round((priceAmount * depositValue) / 100);
  return 0;
}

/** Local date key (YYYY-MM-DD) used by the availability API. */
export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatBookingDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatBookingTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}
