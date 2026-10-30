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
