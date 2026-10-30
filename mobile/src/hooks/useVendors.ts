import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { vendorsApi } from '@/api/vendors.api';
import type { VendorListQuery } from '@/types/vendor';

/** Paginated vendor list (public). */
export function useVendors(query?: VendorListQuery) {
  return useQuery({
    queryKey: queryKeys.vendors.list(query),
    queryFn: () => vendorsApi.list(query),
  });
}

/** Single vendor detail (public). */
export function useVendor(id: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(id),
    queryFn: () => vendorsApi.getById(id),
    enabled: Boolean(id),
  });
}
