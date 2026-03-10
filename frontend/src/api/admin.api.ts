import { http } from '@/api/http';

export type AdminOverviewResponse = {
	usersTotal: number;
	vendorsTotal: number;
	bookingsTotal: number;
};

export const adminApi = {
	getOverview: () => http.get<AdminOverviewResponse>('/admin/overview'),
};
