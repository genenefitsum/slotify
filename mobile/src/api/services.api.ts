import { http } from '@/api/http';
import type {
  CreateServicePayload,
  Service,
  ServiceListQuery,
  ServiceListResponse,
  UpdateServicePayload,
} from '@/types/service';

export const servicesApi = {
  list: (query?: ServiceListQuery) => http.get<ServiceListResponse>('/services', query),
  create: (payload: CreateServicePayload) => http.post<Service>('/services', payload),
  update: (id: string, payload: UpdateServicePayload) =>
    http.patch<Service>(`/services/${id}`, payload),
  remove: (id: string) => http.delete<{ success: boolean }>(`/services/${id}`),
};
