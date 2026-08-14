import type { UserRole } from '@/types/auth';

/**
 * Returns the default workspace / home destination path for a given user role.
 * - Admin -> /dashboard/admin
 * - Vendor Owner / Staff -> /dashboard/vendor
 * - Customer -> /vendors (Browse Vendors marketplace)
 * - Guest / Unauthenticated -> /
 */
export const getRoleRedirectPath = (role?: UserRole | null): string => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'vendor_owner':
    case 'vendor_staff':
      return '/dashboard/vendor';
    case 'customer':
      return '/vendors';
    default:
      return '/';
  }
};
