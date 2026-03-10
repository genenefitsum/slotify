import type { PaginatedResponse } from '@/types/vendor';

export type DepositType = 'none' | 'fixed' | 'percentage';

export type Service = {
	id: string;
	vendorId: string;
	name: string;
	description: string;
	durationMinutes: number;
	bufferBeforeMinutes: number;
	bufferAfterMinutes: number;
	priceAmount: number;
	currency: string;
	depositType: DepositType;
	depositValue: number;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ServiceListQuery = {
	vendorId?: string;
	page?: number;
	limit?: number;
};

export type ServiceListResponse = PaginatedResponse<Service>;

export type CreateServicePayload = {
	name: string;
	description?: string;
	durationMinutes: number;
	bufferBeforeMinutes?: number;
	bufferAfterMinutes?: number;
	priceAmount: number;
	currency: string;
	depositType?: DepositType;
	depositValue?: number;
};

export type UpdateServicePayload = Partial<CreateServicePayload> & {
	isActive?: boolean;
};
