import type { Href } from 'expo-router';

import type { UserRole } from '@/types/auth';

/**
 * Where a signed-in user belongs, by role. Mirrors the web app's
 * `getRoleRedirectPath`: customers go to Explore, vendors to their dashboard.
 * Admin is out of scope for mobile, so it falls back to the public landing.
 */
export function roleHome(role: UserRole): Href {
  switch (role) {
    case 'customer':
      return '/explore';
    case 'vendor_owner':
    case 'vendor_staff':
      return '/dashboard';
    default:
      return '/landing';
  }
}
