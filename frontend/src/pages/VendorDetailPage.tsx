import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { bookingsApi } from '@/api/bookings.api';
import { HttpError } from '@/api/http';
import { reviewsApi } from '@/api/reviews.api';
import { servicesApi } from '@/api/services.api';
import { vendorsApi } from '@/api/vendors.api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import PageSkeleton from '@/components/ui/page-skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Service } from '@/types/service';

const EMPTY_SERVICES: Service[] = [];

const VendorDetailPage = () => {
	const { id: vendorId } = useParams();
	const { isAuthenticated, user } = useAuth();
	const { push } = useToast();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();
	const [isBookingDialogOpen, setBookingDialogOpen] = useState(false);
	const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
	const [selectedServiceId, setSelectedServiceId] = useState('');
	const [bookingStartLocal, setBookingStartLocal] = useState('');
	const [bookingNotes, setBookingNotes] = useState('');
	const [reviewBookingId, setReviewBookingId] = useState('');
	const [reviewRating, setReviewRating] = useState('5');
	const [reviewComment, setReviewComment] = useState('');
	const [bookingFormError, setBookingFormError] = useState('');
	const [reviewFormError, setReviewFormError] = useState('');

	const isCustomer = user?.role === 'customer' || user?.role === 'admin';

	const vendorQuery = useQuery({
		queryKey: ['vendor', vendorId],
		queryFn: () => vendorsApi.getById(vendorId || ''),
		enabled: Boolean(vendorId),
	});

	const servicesQuery = useQuery({
		queryKey: ['services', { vendorId }],
		queryFn: () => servicesApi.list({ vendorId: vendorId || undefined, page: 1, limit: 50 }),
		enabled: Boolean(vendorId),
	});

	const reviewsQuery = useQuery({
		queryKey: ['reviews', { vendorId }],
		queryFn: () => reviewsApi.listByVendor(vendorId || ''),
		enabled: Boolean(vendorId),
	});

	const bookingMutation = useMutation({
		mutationFn: () => {
			if (!selectedServiceId) {
				throw new Error('Select a service before booking.');
			}

			if (!bookingStartLocal) {
				throw new Error('Choose a date and time before booking.');
			}

			const startsAtUtc = new Date(bookingStartLocal).toISOString();
			return bookingsApi.create({
				serviceId: selectedServiceId,
				startsAtUtc,
				localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				customerNotes: bookingNotes || undefined,
			});
		},
		onSuccess: () => {
			push('Booking request submitted successfully.', 'success');
			setBookingDialogOpen(false);
			setSelectedServiceId('');
			setBookingStartLocal('');
			setBookingNotes('');
			setBookingFormError('');
			void queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
		onError: (error) => {
			if (error instanceof HttpError) {
				setBookingFormError(error.message);
				return;
			}

			if (error instanceof Error) {
				setBookingFormError(error.message);
				return;
			}

			setBookingFormError('Booking failed. Please try again.');
		},
	});

	const reviewMutation = useMutation({
		mutationFn: () => {
			if (!vendorId) {
				throw new Error('Vendor not found.');
			}

			if (!reviewBookingId.trim()) {
				throw new Error('Booking ID is required to submit a review.');
			}

			const rating = Number(reviewRating);
			if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
				throw new Error('Rating must be between 1 and 5.');
			}

			return reviewsApi.createForVendor(vendorId, {
				bookingId: reviewBookingId.trim(),
				rating,
				comment: reviewComment.trim() || undefined,
			});
		},
		onSuccess: () => {
			push('Review submitted successfully.', 'success');
			setReviewDialogOpen(false);
			setReviewBookingId('');
			setReviewRating('5');
			setReviewComment('');
			setReviewFormError('');
			void queryClient.invalidateQueries({ queryKey: ['reviews', { vendorId }] });
		},
		onError: (error) => {
			if (error instanceof HttpError) {
				setReviewFormError(error.message);
				return;
			}

			if (error instanceof Error) {
				setReviewFormError(error.message);
				return;
			}

			setReviewFormError('Review submission failed. Please try again.');
		},
	});

	const ensureSignedIn = () => {
		if (isAuthenticated) {
			return true;
		}

		navigate('/login', { state: { from: location } });
		return false;
	};

	const vendor = vendorQuery.data;
	const services = servicesQuery.data?.items ?? EMPTY_SERVICES;
	const reviews = reviewsQuery.data || [];
	const currencyFormatter = useMemo(() => {
		const currency = services[0]?.currency || 'USD';
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			maximumFractionDigits: 2,
		});
	}, [services]);

	if (!vendorId) {
		return (
			<section className="container mx-auto px-4 py-14">
				<ErrorState description="Vendor id is missing from this route." />
			</section>
		);
	}

	if (vendorQuery.isLoading) {
		return (
			<section className="container mx-auto px-4 py-14">
				<PageSkeleton rows={3} className="grid-cols-1" />
			</section>
		);
	}

	if (vendorQuery.isError || !vendor) {
		return (
			<section className="container mx-auto px-4 py-14">
				<ErrorState
					description={
						vendorQuery.error instanceof Error
							? vendorQuery.error.message
							: 'Unable to load vendor details.'
					}
					actionLabel="Back to vendors"
					onAction={() => {
						navigate('/vendors');
					}}
				/>
			</section>
		);
	}

	return (
		<section className="container mx-auto px-4 py-14">
			<div className="rounded-2xl border border-border bg-card p-6">
				<p className="text-xs font-semibold uppercase tracking-wide text-primary">
					{vendor.categories[0] || 'General'}
				</p>
				<h1 className="mt-2 text-3xl font-semibold">{vendor.displayName}</h1>
				<p className="mt-3 max-w-3xl text-muted-foreground">
					{vendor.description || 'Professional services available for booking.'}
				</p>
				<div className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
					<p>
						<span className="font-medium text-foreground">City:</span> {vendor.location.city}
					</p>
					<p>
						<span className="font-medium text-foreground">Timezone:</span> {vendor.timezone}
					</p>
					<p>
						<span className="font-medium text-foreground">Rating:</span>{' '}
						{vendor.averageRating.toFixed(1)} ({vendor.reviewCount} reviews)
					</p>
				</div>

				<div className="mt-6 flex flex-wrap gap-3">
					<Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
						<DialogTrigger asChild>
							<Button
								onClick={() => {
									if (!ensureSignedIn() || !isCustomer) {
										if (isAuthenticated && !isCustomer) {
											push('Only customer accounts can create bookings.', 'error');
										}
										return;
									}
									setBookingFormError('');
								}}
							>
								Book Now
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create Booking</DialogTitle>
								<DialogDescription>
									Choose a service and preferred date/time. Slot discovery will be enhanced when
									availability endpoints are active.
								</DialogDescription>
							</DialogHeader>

							<form
								className="mt-4 space-y-3"
								onSubmit={(event) => {
									event.preventDefault();
									void bookingMutation.mutateAsync();
								}}
							>
								<div>
									<label htmlFor="serviceId" className="mb-1 block text-sm font-medium">
										Service
									</label>
									<select
										id="serviceId"
										className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
										value={selectedServiceId}
										onChange={(event) => setSelectedServiceId(event.target.value)}
										required
									>
										<option value="">Select a service</option>
										{services.map((service) => (
											<option key={service.id} value={service.id}>
												{service.name} • {currencyFormatter.format(service.priceAmount)}
											</option>
										))}
									</select>
								</div>

								<div>
									<label htmlFor="startDateTime" className="mb-1 block text-sm font-medium">
										Date and time
									</label>
									<Input
										id="startDateTime"
										type="datetime-local"
										value={bookingStartLocal}
										onChange={(event) => setBookingStartLocal(event.target.value)}
										required
									/>
								</div>

								<div>
									<label htmlFor="bookingNotes" className="mb-1 block text-sm font-medium">
										Notes (optional)
									</label>
									<Textarea
										id="bookingNotes"
										placeholder="Any details the vendor should know before your appointment"
										value={bookingNotes}
										onChange={(event) => setBookingNotes(event.target.value)}
									/>
								</div>

								{bookingFormError ? (
									<p className="text-sm text-destructive">{bookingFormError}</p>
								) : null}

								<DialogFooter>
									<Button
										type="submit"
										loading={bookingMutation.isPending}
										loadingText="Booking..."
									>
										Submit Booking
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>

					<Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								onClick={() => {
									if (!ensureSignedIn() || !isCustomer) {
										if (isAuthenticated && !isCustomer) {
											push('Only customer accounts can submit reviews.', 'error');
										}
										return;
									}
									setReviewFormError('');
								}}
							>
								Write Review
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Share Your Experience</DialogTitle>
								<DialogDescription>
									Submit your review using the booking id from your completed appointment.
								</DialogDescription>
							</DialogHeader>

							<form
								className="mt-4 space-y-3"
								onSubmit={(event) => {
									event.preventDefault();
									void reviewMutation.mutateAsync();
								}}
							>
								<div>
									<label htmlFor="bookingId" className="mb-1 block text-sm font-medium">
										Booking ID
									</label>
									<Input
										id="bookingId"
										placeholder="Paste booking id"
										value={reviewBookingId}
										onChange={(event) => setReviewBookingId(event.target.value)}
										required
									/>
								</div>

								<div>
									<label htmlFor="rating" className="mb-1 block text-sm font-medium">
										Rating
									</label>
									<select
										id="rating"
										className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
										value={reviewRating}
										onChange={(event) => setReviewRating(event.target.value)}
									>
										<option value="5">5 - Excellent</option>
										<option value="4">4 - Very good</option>
										<option value="3">3 - Good</option>
										<option value="2">2 - Fair</option>
										<option value="1">1 - Poor</option>
									</select>
								</div>

								<div>
									<label htmlFor="comment" className="mb-1 block text-sm font-medium">
										Comment (optional)
									</label>
									<Textarea
										id="comment"
										placeholder="Tell others about your experience"
										value={reviewComment}
										onChange={(event) => setReviewComment(event.target.value)}
									/>
								</div>

								{reviewFormError ? <p className="text-sm text-destructive">{reviewFormError}</p> : null}

								<DialogFooter>
									<Button
										type="submit"
										loading={reviewMutation.isPending}
										loadingText="Submitting..."
									>
										Submit Review
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
				<div>
					<h2 className="text-2xl font-semibold">Services</h2>
					{servicesQuery.isLoading ? <PageSkeleton rows={3} className="mt-4 grid-cols-1" /> : null}

					{servicesQuery.isError ? (
						<ErrorState
							description={
								servicesQuery.error instanceof Error
									? servicesQuery.error.message
									: 'Unable to load vendor services.'
							}
							className="mt-4"
						/>
					) : null}

					{!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0 ? (
						<EmptyState
							title="No services listed"
							description="This vendor has not published services yet."
						/>
					) : null}

					{services.length > 0 ? (
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							{services.map((service) => (
								<article key={service.id} className="rounded-xl border border-border bg-card p-4">
									<h3 className="font-semibold">{service.name}</h3>
									<p className="mt-2 text-sm text-muted-foreground">
										{service.description || 'No description provided for this service yet.'}
									</p>
									<div className="mt-4 flex items-center justify-between text-sm">
										<span>{service.durationMinutes} min</span>
										<span className="font-semibold">{currencyFormatter.format(service.priceAmount)}</span>
									</div>
								</article>
							))}
						</div>
					) : null}
				</div>

				<div>
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-semibold">Reviews</h2>
						<Link to="/bookings" className="text-sm text-primary hover:underline">
							My bookings
						</Link>
					</div>

					{reviewsQuery.isLoading ? <PageSkeleton rows={3} className="mt-4 grid-cols-1" /> : null}

					{reviewsQuery.isError ? (
						<ErrorState
							description={
								reviewsQuery.error instanceof Error
									? reviewsQuery.error.message
									: 'Unable to load vendor reviews.'
							}
							className="mt-4"
						/>
					) : null}

					{!reviewsQuery.isLoading && !reviewsQuery.isError && reviews.length === 0 ? (
						<EmptyState
							title="No reviews yet"
							description="Be the first customer to share feedback for this vendor."
						/>
					) : null}

					{reviews.length > 0 ? (
						<div className="mt-4 space-y-3">
							{reviews.map((review) => (
								<article key={review.id} className="rounded-xl border border-border bg-card p-4">
									<div className="flex items-center justify-between text-sm">
										<span className="font-medium">{review.rating}/5</span>
										<span className="text-muted-foreground">
											{new Date(review.createdAt).toLocaleDateString()}
										</span>
									</div>
									<p className="mt-2 text-sm text-muted-foreground">
										{review.comment || 'No written comment provided.'}
									</p>
								</article>
							))}
						</div>
					) : null}
				</div>
			</div>
		</section>
	);
};

export default VendorDetailPage;
