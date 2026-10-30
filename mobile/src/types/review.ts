export type ReviewStatus = 'published' | 'hidden' | 'flagged';

export type Review = {
  id: string;
  bookingId: string;
  customerUserId: string;
  vendorId: string;
  staffId: string | null;
  rating: number;
  comment?: string;
  status: ReviewStatus;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type ListReviewsQuery = {
  vendorId: string;
};

export type CreateReviewPayload = {
  bookingId: string;
  rating: number;
  comment?: string;
};
