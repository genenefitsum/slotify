type ClassValue = string | false | null | undefined;

/** Minimal classNames joiner for NativeWind `className` composition. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
