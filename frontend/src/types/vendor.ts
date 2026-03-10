export type Pagination = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type PaginatedResponse<T> = {
	items: T[];
	pagination: Pagination;
};

export type VendorStatus = 'draft' | 'pending_verification' | 'active' | 'suspended';

export type VendorLocation = {
	countryCode: string;
	city: string;
	addressLine1?: string;
	addressLine2?: string;
	coordinates: {
		type: 'Point';
		coordinates: number[];
	};
};

export type Vendor = {
	id: string;
	displayName: string;
	legalBusinessName: string | null;
	description: string;
	categories: string[];
	timezone: string;
	location: VendorLocation;
	averageRating: number;
	reviewCount: number;
	status: VendorStatus;
	createdAt: string;
	updatedAt: string;
};

export type VendorListQuery = {
	city?: string;
	category?: string;
	page?: number;
	limit?: number;
};

export type VendorListResponse = PaginatedResponse<Vendor>;

export type CreateVendorPayload = {
	displayName: string;
	legalBusinessName?: string;
	description?: string;
	categories?: string[];
	timezone: string;
	location: {
		countryCode: string;
		city: string;
		addressLine1?: string;
		addressLine2?: string;
		coordinates?: number[];
	};
};

export type UpdateVendorPayload = Partial<CreateVendorPayload>;
