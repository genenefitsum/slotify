import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/queryKeys';
import { servicesApi } from '@/api/services.api';
import type { CreateServicePayload, UpdateServicePayload } from '@/types/service';

const SERVICES_PAGE_SIZE = 20;

/** Services for a vendor (public). */
export function useVendorServices(vendorId?: string) {
  return useQuery({
    queryKey: queryKeys.services.list(vendorId),
    queryFn: () => servicesApi.list({ vendorId }),
    enabled: Boolean(vendorId),
  });
}

/** The signed-in vendor's own services, paginated (vendor dashboard). */
export function useMyServices(vendorId: string | undefined, page = 1) {
  return useQuery({
    queryKey: queryKeys.services.mine(page),
    queryFn: () => servicesApi.list({ vendorId, page, limit: SERVICES_PAGE_SIZE }),
    enabled: Boolean(vendorId),
  });
}

/** Refresh every services cache (own paginated lists + public per-vendor lists). */
function invalidateServices(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['services'] });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServicePayload) => servicesApi.create(payload),
    onSuccess: () => invalidateServices(qc),
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateServicePayload }) =>
      servicesApi.update(id, payload),
    onSuccess: () => invalidateServices(qc),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => servicesApi.remove(id),
    onSuccess: () => invalidateServices(qc),
  });
}
