import { http } from '@/api/http';
import type {
	CreateVendorPayload,
	UpdateVendorPayload,
	Vendor,
	VendorListQuery,
	VendorListResponse,
} from '@/types/vendor';

export const vendorsApi = {
	list: (query?: VendorListQuery) => http.get<VendorListResponse>('/vendors', query),
	getById: (id: string) => http.get<Vendor>(`/vendors/${id}`),
	getMyVendor: () => http.get<Vendor>('/vendors/me'),
	resolveMapLink: (link: string) =>
		http.post<{ coordinates: number[]; resolvedUrl: string }>('/vendors/resolve-map-link', { link }),
	create: (payload: CreateVendorPayload) => http.post<Vendor>('/vendors', payload),
	updateMyVendor: (payload: UpdateVendorPayload) => http.patch<Vendor>('/vendors/me', payload),
};
