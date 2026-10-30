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
  description?: string;
  coordinates: {
    type: 'Point';
    coordinates: number[];
  };
};

export type WorkingHour = {
  dayOfWeek: number;
  isEnabled: boolean;
  startTime: string;
  endTime: string;
};

export type BlackoutSlot = {
  date: string;
  startTime: string;
  endTime: string;
  label: string;
};

export type Vendor = {
  id: string;
  displayName: string;
  legalBusinessName: string | null;
  description: string;
  imageUrl: string | null;
  images: string[];
  categories: string[];
  timezone: string;
  location: VendorLocation;
  workingHours: WorkingHour[];
  blackoutSlots: BlackoutSlot[];
  averageRating: number;
  reviewCount: number;
  startingPrice: number | null;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
};

export type VendorImagePayload = {
  data: string;
  contentType: string;
};

export type VendorListQuery = {
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
  all?: boolean;
};

export type VendorListResponse = PaginatedResponse<Vendor>;

export type CreateVendorPayload = {
  displayName: string;
  images?: VendorImagePayload[] | null;
  image?: VendorImagePayload | null;
  legalBusinessName?: string;
  description?: string;
  categories?: string[];
  workingHours?: WorkingHour[];
  blackoutSlots?: BlackoutSlot[];
  location: {
    countryCode: string;
    city: string;
    addressLine1?: string;
    addressLine2?: string;
    description?: string;
    coordinates?: number[];
  };
};

export type UpdateVendorPayload = Partial<CreateVendorPayload>;
