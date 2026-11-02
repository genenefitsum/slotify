import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { HttpError } from '@/api/http';
import { queryKeys } from '@/api/queryKeys';
import { vendorsApi } from '@/api/vendors.api';
import type { CreateVendorPayload, UpdateVendorPayload, Vendor } from '@/types/vendor';

/**
 * The signed-in vendor's own profile. A 404 means "no profile yet" (the vendor
 * still needs to onboard) — surfaced via `isMissing` rather than as an error, so
 * screens can show a create-profile CTA. Other failures stay as errors.
 */
export function useMyVendor() {
  const query = useQuery({
    queryKey: queryKeys.vendors.mine,
    queryFn: () => vendorsApi.getMyVendor(),
    retry: false,
  });

  const isMissing =
    query.isError && query.error instanceof HttpError && query.error.status === 404;

  return { ...query, isMissing };
}

/**
 * Create the profile when none exists, otherwise patch it. Callers pass the
 * already-assembled payload; on success we refresh the vendor's own profile and
 * the public vendor lists so the marketplace reflects the change.
 */
export function useUpsertVendor(hasVendor: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVendorPayload | UpdateVendorPayload): Promise<Vendor> =>
      hasVendor
        ? vendorsApi.updateMyVendor(payload as UpdateVendorPayload)
        : vendorsApi.create(payload as CreateVendorPayload),
    onSuccess: (vendor) => {
      qc.setQueryData(queryKeys.vendors.mine, vendor);
      void qc.invalidateQueries({ queryKey: queryKeys.vendors.mine });
      void qc.invalidateQueries({ queryKey: queryKeys.vendors.all });
    },
  });
}

/** Resolve a shortened/opaque Google Maps link to coordinates server-side. */
export function useResolveMapLink() {
  return useMutation({
    mutationFn: (link: string) => vendorsApi.resolveMapLink(link),
  });
}
