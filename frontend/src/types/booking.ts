import type { PaginatedResponse } from '@/types/vendor';

export type BookingStatus =
	| 'pending_payment'
	| 'confirmed'
	| 'in_service'
	| 'completed'
	| 'cancelled'
	| 'no_show';

export type BookingPricingSnapshot = {
	currency: string;
	servicePriceAmount: number;
	depositAmount: number;
	commissionAmount: number;
	netPayableToVendor: number;
};

export type BookingCancellation = {
	cancelledAt: string | null;
	cancelledByUserId: string | null;
	reasonCode: string | null;
	reasonText: string | null;
};

export type Booking = {
	id: string;
	bookingNumber: string;
	customerUserId: string;
	vendorId: string;
	vendorName: string | null;
	staffId: string | null;
	serviceId: string;
	serviceName: string | null;
	serviceDurationMinutes: number | null;
	startsAtUtc: string;
	endsAtUtc: string;
	localTimezone: string;
	pricingSnapshot: BookingPricingSnapshot;
	status: BookingStatus;
	customerNotes: string;
	cancellation?: BookingCancellation;
	createdAt: string;
	updatedAt: string;
};

export type BookingListQuery = {
	status?: BookingStatus;
	page?: number;
	limit?: number;
};

export type BookingListResponse = PaginatedResponse<Booking>;

export type CreateBookingPayload = {
	serviceId: string;
	staffId?: string;
	startsAtUtc: string;
	localTimezone?: string;
	customerNotes?: string;
};

export type CancelBookingPayload = {
	reasonCode?: string;
	reasonText?: string;
};

export type BookingTransitionAction = 'confirm' | 'start' | 'complete' | 'cancel' | 'no-show';
