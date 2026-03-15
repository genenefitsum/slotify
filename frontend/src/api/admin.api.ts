import { http } from '@/api/http';

type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type AdminTrendPoint = {
	date: string;
	bookings: number;
	completedBookings: number;
	platformRevenue: number;
};

export type AdminOverviewResponse = {
	usersTotal: number;
	vendorsTotal: number;
	bookingsTotal: number;
	usersByStatus?: Record<string, number>;
	vendorsByStatus?: Record<string, number>;
	bookingsByStatus?: Record<string, number>;
	financials?: {
		platformRevenueTotal: number;
		payoutsTotal: number;
	};
	quality?: {
		averageRating: number;
	};
	queues?: {
		vendorsPendingVerification: number;
		bookingsPendingPayment: number;
		bookingsConfirmed: number;
	};
	trends?: AdminTrendPoint[];
};

export type AdminUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	role: string;
	status: string;
	provider: string;
	phone: string | null;
	lastLoginAt: string | null;
	createdAt: string;
	updatedAt: string;
};

export type AdminVendor = {
	id: string;
	ownerUserId: string;
	owner: {
		id: string;
		email: string;
		fullName: string;
	} | null;
	displayName: string;
	legalBusinessName: string | null;
	status: string;
	categories: string[];
	city: string | null;
	countryCode: string | null;
	averageRating: number;
	reviewCount: number;
	commissionPlanCode: string;
	createdAt: string;
	updatedAt: string;
};

export type AdminBooking = {
	id: string;
	bookingNumber: string;
	status: string;
	vendorId: string;
	vendorName: string | null;
	customerUserId: string;
	customerName: string | null;
	customerEmail: string | null;
	serviceId: string;
	serviceName: string | null;
	startsAtUtc: string;
	endsAtUtc: string;
	localTimezone: string;
	pricingSnapshot: {
		currency: string;
		servicePriceAmount: number;
		depositAmount: number;
		commissionAmount: number;
		netPayableToVendor: number;
	};
	cancellation: {
		cancelledAt?: string | null;
		reasonCode?: string | null;
		reasonText?: string | null;
	};
	createdAt: string;
	updatedAt: string;
};

export type AdminCommissionPlan = {
	id: string;
	code: string;
	name: string;
	type: 'percentage' | 'fixed';
	value: number;
	minFeeAmount: number;
	maxFeeAmount: number | null;
	currency: string;
	isDefault: boolean;
	activeFrom: string;
	activeTo: string | null;
	createdAt: string;
	updatedAt: string;
};

type ListResponse<T> = {
	items: T[];
	pagination: Pagination;
};

type ListQuery = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	role?: string;
	vendorId?: string;
	customerUserId?: string;
	category?: string;
	city?: string;
	fromDate?: string;
	toDate?: string;
};

export const adminApi = {
	getOverview: (query?: { days?: number }) => http.get<AdminOverviewResponse>('/admin/overview', query),
	listUsers: (query?: ListQuery) => http.get<ListResponse<AdminUser>>('/admin/users', query),
	suspendUser: (id: string) => http.post<AdminUser>(`/admin/users/${id}/suspend`),
	reactivateUser: (id: string) => http.post<AdminUser>(`/admin/users/${id}/reactivate`),
	listVendors: (query?: ListQuery) => http.get<ListResponse<AdminVendor>>('/admin/vendors', query),
	approveVendor: (id: string) => http.post<AdminVendor>(`/admin/vendors/${id}/approve`),
	rejectVendor: (id: string) => http.post<AdminVendor>(`/admin/vendors/${id}/reject`),
	suspendVendor: (id: string) => http.post<AdminVendor>(`/admin/vendors/${id}/suspend`),
	reactivateVendor: (id: string) => http.post<AdminVendor>(`/admin/vendors/${id}/reactivate`),
	listBookings: (query?: ListQuery) => http.get<ListResponse<AdminBooking>>('/admin/bookings', query),
	confirmBooking: (id: string) => http.post<AdminBooking>(`/admin/bookings/${id}/confirm`),
	startBooking: (id: string) => http.post<AdminBooking>(`/admin/bookings/${id}/start`),
	completeBooking: (id: string) => http.post<AdminBooking>(`/admin/bookings/${id}/complete`),
	cancelBooking: (id: string, payload?: { reasonCode?: string; reasonText?: string }) =>
		http.post<AdminBooking>(`/admin/bookings/${id}/cancel`, payload),
	markBookingNoShow: (id: string) => http.post<AdminBooking>(`/admin/bookings/${id}/no-show`),
	listCommissionPlans: (query?: ListQuery) =>
		http.get<ListResponse<AdminCommissionPlan>>('/admin/commissions', query),
	createCommissionPlan: (payload: Partial<AdminCommissionPlan>) =>
		http.post<AdminCommissionPlan>('/admin/commissions', payload),
	updateCommissionPlan: (id: string, payload: Partial<AdminCommissionPlan>) =>
		http.patch<AdminCommissionPlan>(`/admin/commissions/${id}`, payload),
	activateCommissionPlan: (id: string, payload?: { setDefault?: boolean }) =>
		http.post<AdminCommissionPlan>(`/admin/commissions/${id}/activate`, payload),
	setDefaultCommissionPlan: (id: string) =>
		http.post<AdminCommissionPlan>(`/admin/commissions/${id}/set-default`),
};
