import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { servicesApi } from '@/api/services.api';

/** Services for a vendor (public). */
export function useVendorServices(vendorId?: string) {
  return useQuery({
    queryKey: queryKeys.services.list(vendorId),
    queryFn: () => servicesApi.list({ vendorId }),
    enabled: Boolean(vendorId),
  });
}
