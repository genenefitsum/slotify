import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Clock3, MapPin, MessageSquare, ShieldCheck, Star } from 'lucide-react';
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
import type { BookingAvailabilitySlot } from '@/types/booking';
import type { Service } from '@/types/service';

const EMPTY_SERVICES: Service[] = [];
const ADDIS_TIMEZONE = 'Africa/Addis_Ababa';
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getCurrentAddisDate = () => {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: ADDIS_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).formatToParts(new Date());
	const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
	return `${byType.year}-${byType.month}-${byType.day}`;
};

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
	const [bookingDateLocal, setBookingDateLocal] = useState(getCurrentAddisDate);
	const [selectedSlotStartUtc, setSelectedSlotStartUtc] = useState('');
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

	const customerBookingsQuery = useQuery({
		queryKey: ['bookings', 'review-eligible', vendorId],
		queryFn: () => bookingsApi.list({ status: 'completed', page: 1, limit: 50 }),
		enabled: Boolean(vendorId && isAuthenticated && isCustomer),
		staleTime: 20_000,
	});

	const availabilityQuery = useQuery({
		queryKey: ['bookings', 'available-slots', vendorId, selectedServiceId, bookingDateLocal],
		queryFn: () =>
			bookingsApi.listAvailableSlots({
				vendorId: vendorId || '',
				serviceId: selectedServiceId,
				localDate: bookingDateLocal,
			}),
		enabled: Boolean(
			vendorId &&
				selectedServiceId &&
				bookingDateLocal &&
				isAuthenticated &&
				isCustomer &&
				isBookingDialogOpen
		),
		staleTime: 10_000,
	});

	const bookingMutation = useMutation({
		mutationFn: () => {
			if (!selectedServiceId) {
				throw new Error('Select a service before booking.');
			}

			if (!selectedSlotStartUtc) {
				throw new Error('Choose an available slot before booking.');
			}

			return bookingsApi.create({
				serviceId: selectedServiceId,
				startsAtUtc: selectedSlotStartUtc,
				localTimezone: ADDIS_TIMEZONE,
				customerNotes: bookingNotes || undefined,
			});
		},
		onSuccess: () => {
			push('Booking request submitted successfully.', 'success');
			setBookingDialogOpen(false);
			setSelectedServiceId('');
			setBookingDateLocal(getCurrentAddisDate());
			setSelectedSlotStartUtc('');
			setBookingNotes('');
			setBookingFormError('');
			void queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
		onError: (error) => {
			if (error instanceof HttpError) {
				setBookingFormError(error.message);
				if (error.status === 409) {
					setSelectedSlotStartUtc('');
					void availabilityQuery.refetch();
				}
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
				throw new Error('Choose a completed booking before submitting a review.');
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
	const reviewEligibleBookings = useMemo(
		() => (customerBookingsQuery.data?.items || []).filter((booking) => booking.vendorId === vendorId),
		[customerBookingsQuery.data?.items, vendorId]
	);
	const selectedService = useMemo(
		() => services.find((service) => service.id === selectedServiceId) || null,
		[selectedServiceId, services]
	);
	const availableSlots = useMemo(
		() => (availabilityQuery.data?.items || []).filter((item) => item.isAvailable),
		[availabilityQuery.data?.items]
	);
	const selectedSlot = useMemo(
		() =>
			(availabilityQuery.data?.items || []).find(
				(item) => item.startsAtUtc === selectedSlotStartUtc
			) || null,
		[availabilityQuery.data?.items, selectedSlotStartUtc]
	);
	const startingPrice = useMemo(() => {
		if (!services.length) {
			return null;
		}

		return Math.min(...services.map((service) => service.priceAmount));
	}, [services]);
	const mapEmbedUrl = useMemo(() => {
		const [longitude, latitude] = vendor?.location.coordinates.coordinates || [0, 0];
		if (!latitude || !longitude) {
			return '';
		}

		return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
	}, [vendor?.location.coordinates.coordinates]);
	const formattedWorkingHours = useMemo(
		() =>
			(vendor?.workingHours || [])
				.filter((item) => item.isEnabled)
				.sort((left, right) => left.dayOfWeek - right.dayOfWeek)
				.map((item) => ({
					label: DAY_LABELS[item.dayOfWeek],
					time: `${item.startTime} - ${item.endTime}`,
				})),
		[vendor?.workingHours]
	);
	const upcomingBlackouts = useMemo(
		() =>
			(vendor?.blackoutSlots || [])
				.filter((item) => item.date)
				.sort((left, right) => left.date.localeCompare(right.date))
				.slice(0, 4),
		[vendor?.blackoutSlots]
	);

	const currencyFormatter = useMemo(() => {
		const currency = selectedService?.currency || services[0]?.currency || 'USD';
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			maximumFractionDigits: 2,
		});
	}, [selectedService?.currency, services]);

	const longDateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			}),
		[]
	);

	const shortDateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			}),
		[]
	);

	const openBookingDialog = (serviceId?: string) => {
		if (!ensureSignedIn() || !isCustomer) {
			if (isAuthenticated && !isCustomer) {
				push('Only customer accounts can create bookings.', 'error');
			}
			return;
		}

		if (serviceId) {
			setSelectedServiceId(serviceId);
			setSelectedSlotStartUtc('');
		}

		setBookingFormError('');
		setBookingDialogOpen(true);
	};

	const handleServiceSelection = (serviceId: string) => {
		setSelectedServiceId(serviceId);
		setSelectedSlotStartUtc('');
		setBookingFormError('');
	};

	const handleDateSelection = (localDate: string) => {
		setBookingDateLocal(localDate);
		setSelectedSlotStartUtc('');
		setBookingFormError('');
	};

	const formatSlotLabel = (slot: BookingAvailabilitySlot) => {
		const start = new Date(slot.startsAtUtc);
		const end = new Date(slot.endsAtUtc);
		return `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
	};

	const openReviewDialog = () => {
		if (!ensureSignedIn() || !isCustomer) {
			if (isAuthenticated && !isCustomer) {
				push('Only customer accounts can submit reviews.', 'error');
			}
			return;
		}

		setReviewFormError('');
		if (!reviewBookingId && reviewEligibleBookings[0]) {
			setReviewBookingId(reviewEligibleBookings[0].id);
		}
		setReviewDialogOpen(true);
	};

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
		<section className="container mx-auto px-4 py-10 lg:px-6 lg:py-14">
			<div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
				<div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.95))] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
					<div className="flex flex-wrap items-start justify-between gap-6">
						<div className="max-w-3xl">
							<div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
								<span className="rounded-full bg-emerald-100 px-3 py-1">{vendor.categories[0] || 'General'}</span>
								<span className="rounded-full bg-white/80 px-3 py-1 text-slate-600">{vendor.status.replace('_', ' ')}</span>
							</div>
							<h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
								{vendor.displayName}
							</h1>
							<p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
								{vendor.description || 'Professional services with clear booking details, modern scheduling, and customer-friendly support.'}
							</p>
							<div className="mt-6 flex flex-wrap gap-3">
								<Dialog open={isBookingDialogOpen} onOpenChange={setBookingDialogOpen}>
									<DialogTrigger asChild>
										<Button onClick={() => openBookingDialog()} className="rounded-full px-6">
											Book an appointment
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Book your appointment</DialogTitle>
											<DialogDescription>
												Choose a service, pick a time, and add any notes the vendor should see before your visit.
											</DialogDescription>
										</DialogHeader>

										<form
											className="mt-4 space-y-4"
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
													className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
													value={selectedServiceId}
													onChange={(event) => handleServiceSelection(event.target.value)}
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
												<label htmlFor="slotDate" className="mb-1 block text-sm font-medium">
													Date
												</label>
												<Input
													id="slotDate"
													type="date"
													value={bookingDateLocal}
													onChange={(event) => handleDateSelection(event.target.value)}
													min={getCurrentAddisDate()}
													required
												/>
											</div>

											<div>
												<p className="mb-2 block text-sm font-medium">Available slots</p>
												{!selectedServiceId ? (
													<p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
														Choose a service to load available slots.
													</p>
												) : availabilityQuery.isLoading ? (
													<p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
														Loading slots...
													</p>
												) : availabilityQuery.isError ? (
													<p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
														{availabilityQuery.error instanceof Error
															? availabilityQuery.error.message
															: 'Failed to load availability slots.'}
													</p>
												) : availableSlots.length === 0 ? (
													<p className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
														No open slots on this date. Try another day.
													</p>
												) : (
													<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
														{availableSlots.map((slot) => {
															const isSelected = selectedSlotStartUtc === slot.startsAtUtc;
															return (
																<Button
																	key={slot.startsAtUtc}
																	type="button"
																	variant={isSelected ? 'default' : 'outline'}
																	onClick={() => {
																		setSelectedSlotStartUtc(slot.startsAtUtc);
																		setBookingFormError('');
																	}}
																>
																	{formatSlotLabel(slot)}
																</Button>
															);
														})}
													</div>
												)}
											</div>

											<div className="rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
												{selectedService ? (
													<div className="space-y-1">
														<p>
															You selected <span className="font-medium text-foreground">{selectedService.name}</span> for{' '}
															<span className="font-medium text-foreground">{currencyFormatter.format(selectedService.priceAmount)}</span>.
														</p>
														{selectedSlot ? (
															<p>
																Booking time:{' '}
																<span className="font-medium text-foreground">{formatSlotLabel(selectedSlot)}</span>{' '}
																on {bookingDateLocal}.
															</p>
														) : null}
													</div>
												) : (
													<p>Choose a service to see the appointment summary here.</p>
												)}
											</div>

											<div>
												<label htmlFor="bookingNotes" className="mb-1 block text-sm font-medium">
													Notes (optional)
												</label>
												<Textarea
													id="bookingNotes"
													placeholder="Anything the vendor should know before your appointment"
													value={bookingNotes}
													onChange={(event) => setBookingNotes(event.target.value)}
												/>
											</div>

											{bookingFormError ? <p className="text-sm text-destructive">{bookingFormError}</p> : null}

											<DialogFooter>
												<Button
													type="submit"
													loading={bookingMutation.isPending}
													loadingText="Booking..."
													disabled={!selectedSlotStartUtc}
												>
													Submit booking
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>

								<Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
									<DialogTrigger asChild>
										<Button variant="outline" onClick={openReviewDialog} className="rounded-full px-6">
											Write a review
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Share your experience</DialogTitle>
											<DialogDescription>
												Pick a completed appointment and leave short feedback that helps future customers.
											</DialogDescription>
										</DialogHeader>

										<form
											className="mt-4 space-y-4"
											onSubmit={(event) => {
												event.preventDefault();
												void reviewMutation.mutateAsync();
											}}
										>
											<div>
												<label htmlFor="bookingId" className="mb-1 block text-sm font-medium">
													Completed booking
												</label>
												{reviewEligibleBookings.length > 0 ? (
													<select
														id="bookingId"
														className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
														value={reviewBookingId}
														onChange={(event) => setReviewBookingId(event.target.value)}
														required
													>
														<option value="">Choose a completed appointment</option>
														{reviewEligibleBookings.map((booking) => (
															<option key={booking.id} value={booking.id}>
																{booking.serviceName || 'Completed service'} • {shortDateFormatter.format(new Date(booking.startsAtUtc))}
															</option>
														))}
													</select>
												) : (
													<>
														<Input
															id="bookingId"
															placeholder="Paste a completed booking id"
															value={reviewBookingId}
															onChange={(event) => setReviewBookingId(event.target.value)}
															required
														/>
														<p className="mt-2 text-sm text-muted-foreground">
															Completed appointments from this vendor will appear here automatically once available.
														</p>
													</>
												)}
											</div>

											<div>
												<label htmlFor="rating" className="mb-1 block text-sm font-medium">
													Rating
												</label>
												<select
													id="rating"
													className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
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
													placeholder="What stood out about the experience?"
													value={reviewComment}
													onChange={(event) => setReviewComment(event.target.value)}
												/>
											</div>

											{reviewFormError ? <p className="text-sm text-destructive">{reviewFormError}</p> : null}

											<DialogFooter>
												<Button type="submit" loading={reviewMutation.isPending} loadingText="Submitting...">
													Submit review
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						<div className="grid min-w-[280px] flex-1 gap-3 sm:grid-cols-2">
							<div className="sm:col-span-2 overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/70 backdrop-blur">
								{(vendor.images?.[0] || vendor.imageUrl) ? (
									<img src={vendor.images?.[0] || vendor.imageUrl || ''} alt={vendor.displayName} className="h-56 w-full object-cover" />
								) : (
									<div className="flex h-56 items-end bg-[linear-gradient(135deg,rgba(5,150,105,0.88),rgba(15,23,42,0.9))] p-6 text-white">
										<div>
											<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Featured vendor</p>
											<p className="mt-3 text-2xl font-semibold">{vendor.displayName}</p>
										</div>
									</div>
								)}
							</div>
							{vendor.images?.length > 1 ? (
								<div className="sm:col-span-2 grid grid-cols-4 gap-2 rounded-2xl border border-white/60 bg-white/70 p-3 backdrop-blur">
									{vendor.images.slice(1, 5).map((image, index) => (
										<div key={`${image}-${index}`} className="h-16 overflow-hidden rounded-lg border border-border bg-background">
											<img src={image} alt={`${vendor.displayName} gallery ${index + 2}`} className="h-full w-full object-cover" />
										</div>
									))}
								</div>
							) : null}
							<div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
										<MapPin className="h-4 w-4" />
									</div>
									<div>
										<p className="text-sm text-slate-500">Location</p>
										<p className="font-semibold text-slate-900">{vendor.location.city}</p>
										<p className="text-xs text-slate-500">Addis Ababa timezone</p>
									</div>
								</div>
							</div>
							<div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
										<Star className="h-4 w-4" />
									</div>
									<div>
										<p className="text-sm text-slate-500">Rating</p>
										<p className="font-semibold text-slate-900">{vendor.averageRating.toFixed(1)} out of 5</p>
									</div>
								</div>
							</div>
							<div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
										<CalendarDays className="h-4 w-4" />
									</div>
									<div>
										<p className="text-sm text-slate-500">Services</p>
										<p className="font-semibold text-slate-900">{services.length} published</p>
									</div>
								</div>
							</div>
							<div className="rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur">
								<div className="flex items-center gap-3">
									<div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
										<Clock3 className="h-4 w-4" />
									</div>
									<div>
										<p className="text-sm text-slate-500">Pricing</p>
										<p className="font-semibold text-slate-900">
											{startingPrice !== null ? `From ${currencyFormatter.format(startingPrice)}` : 'View services'}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
				<div className="space-y-8">
					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<p className="text-sm font-medium text-primary">Location and schedule</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">Find the vendor and plan your visit</h2>
						<div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
							<div className="space-y-4">
								<div className="rounded-2xl bg-muted/20 p-4">
									<p className="font-medium text-foreground">Address</p>
									<p className="mt-2 text-sm text-muted-foreground">
										{vendor.location.addressLine1 || vendor.location.city}
										{vendor.location.addressLine2 ? `, ${vendor.location.addressLine2}` : ''}
									</p>
									{vendor.location.description ? (
										<p className="mt-2 text-sm text-muted-foreground">{vendor.location.description}</p>
									) : null}
								</div>
								<div className="rounded-2xl bg-muted/20 p-4">
									<p className="font-medium text-foreground">Working hours</p>
									<div className="mt-3 space-y-2 text-sm text-muted-foreground">
										{formattedWorkingHours.length > 0 ? (
											formattedWorkingHours.map((item) => (
												<div key={item.label} className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2">
													<span className="font-medium text-foreground">{item.label}</span>
													<span>{item.time}</span>
												</div>
											))
										) : (
											<p>No working hours published yet.</p>
										)}
									</div>
								</div>
								{upcomingBlackouts.length > 0 ? (
									<div className="rounded-2xl bg-muted/20 p-4">
										<p className="font-medium text-foreground">Unavailable times</p>
										<div className="mt-3 space-y-2 text-sm text-muted-foreground">
											{upcomingBlackouts.map((item, index) => (
												<div key={`${item.date}-${index}`} className="rounded-xl bg-background px-3 py-2">
													<p className="font-medium text-foreground">{item.date} • {item.startTime} - {item.endTime}</p>
													{item.label ? <p className="mt-1">{item.label}</p> : null}
												</div>
											))}
										</div>
									</div>
								) : null}
							</div>
							<div className="overflow-hidden rounded-2xl border border-border bg-background">
								{mapEmbedUrl ? (
									<iframe title="Vendor location" src={mapEmbedUrl} className="h-full min-h-80 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
								) : (
									<div className="flex h-full min-h-80 items-center justify-center p-6 text-sm text-muted-foreground">
										Location coordinates have not been published yet.
									</div>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div>
								<p className="text-sm font-medium text-primary">Services</p>
								<h2 className="mt-1 text-2xl font-semibold tracking-tight">Choose what fits your visit</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									Each option includes pricing, duration, and a direct booking path.
								</p>
							</div>
							{startingPrice !== null ? (
								<div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
									Starting from <span className="font-semibold text-foreground">{currencyFormatter.format(startingPrice)}</span>
								</div>
							) : null}
						</div>

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
							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								{services.map((service) => (
									<article key={service.id} className="flex h-full flex-col rounded-[1.5rem] border border-border bg-muted/20 p-5 transition-colors hover:bg-muted/35">
										{service.imageUrl ? (
											<div className="mb-4 h-36 overflow-hidden rounded-xl border border-border bg-background">
												<img src={service.imageUrl} alt={service.name} className="h-full w-full object-cover" />
											</div>
										) : null}
										<div className="flex items-start justify-between gap-3">
											<div>
												<h3 className="text-lg font-semibold">{service.name}</h3>
												<p className="mt-2 text-sm leading-6 text-muted-foreground">
													{service.description || 'No description provided for this service yet.'}
												</p>
											</div>
											<span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
												{currencyFormatter.format(service.priceAmount)}
											</span>
										</div>

										<div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
											<span>{service.durationMinutes} min</span>
											<span>{service.depositType === 'none' ? 'No deposit required' : 'Deposit may apply'}</span>
										</div>

										<div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
											<p className="text-sm text-muted-foreground">Fast booking confirmation starts here.</p>
											<Button onClick={() => openBookingDialog(service.id)} variant="outline">
												Book this service
											</Button>
										</div>
									</article>
								))}
							</div>
						) : null}
					</div>
				</div>

				<div className="space-y-8">
					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<p className="text-sm font-medium text-primary">Before you book</p>
						<h2 className="mt-1 text-2xl font-semibold tracking-tight">What to expect</h2>
						<div className="mt-5 space-y-4">
							<div className="flex gap-3 rounded-2xl bg-muted/30 p-4">
								<div className="rounded-2xl bg-white p-2 shadow-sm">
									<CalendarDays className="h-4 w-4 text-primary" />
								</div>
								<div>
									<p className="font-medium">Choose the right service</p>
									<p className="mt-1 text-sm text-muted-foreground">Compare pricing and duration before confirming your appointment.</p>
								</div>
							</div>
							<div className="flex gap-3 rounded-2xl bg-muted/30 p-4">
								<div className="rounded-2xl bg-white p-2 shadow-sm">
									<MessageSquare className="h-4 w-4 text-primary" />
								</div>
								<div>
									<p className="font-medium">Add notes if needed</p>
									<p className="mt-1 text-sm text-muted-foreground">Use notes for preferences, concerns, or anything the vendor should prepare for.</p>
								</div>
							</div>
							<div className="flex gap-3 rounded-2xl bg-muted/30 p-4">
								<div className="rounded-2xl bg-white p-2 shadow-sm">
									<ShieldCheck className="h-4 w-4 text-primary" />
								</div>
								<div>
									<p className="font-medium">Leave feedback after completion</p>
									<p className="mt-1 text-sm text-muted-foreground">Once a booking is completed you can review the experience directly from your appointments.</p>
								</div>
							</div>
						</div>
						<div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
							Need to manage existing appointments? <Link to="/bookings" className="font-medium text-primary hover:underline">Open my bookings</Link>
						</div>
					</div>

					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-primary">Customer reviews</p>
								<h2 className="mt-1 text-2xl font-semibold tracking-tight">What people are saying</h2>
							</div>
							<div className="text-right">
								<p className="text-2xl font-semibold">{vendor.averageRating.toFixed(1)}</p>
								<p className="text-sm text-muted-foreground">from {vendor.reviewCount} reviews</p>
							</div>
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
							<div className="mt-5 space-y-3">
								{reviews.map((review) => (
									<article key={review.id} className="rounded-2xl border border-border bg-muted/20 p-4">
										<div className="flex items-center justify-between gap-3">
											<div className="flex items-center gap-1 text-amber-500">
												{Array.from({ length: 5 }, (_, index) => (
													<Star
														key={`${review.id}-${index}`}
														className={`h-4 w-4 ${index < review.rating ? 'fill-current' : ''}`}
													/>
												))}
											</div>
											<span className="text-sm text-muted-foreground">
												{shortDateFormatter.format(new Date(review.createdAt))}
											</span>
										</div>
										<p className="mt-3 text-sm leading-6 text-muted-foreground">
											{review.comment || 'No written comment provided.'}
										</p>
									</article>
								))}
							</div>
						) : null}
					</div>
				</div>
			</div>

			{reviewEligibleBookings.length > 0 ? (
				<div className="mt-8 rounded-[1.75rem] border border-border bg-card p-6 text-sm text-muted-foreground">
					Your completed bookings with this vendor are ready for feedback. Recent visit:{' '}
					<span className="font-medium text-foreground">
						{longDateFormatter.format(new Date(reviewEligibleBookings[0].startsAtUtc))}
					</span>
				</div>
			) : null}
		</section>
	);
};

export default VendorDetailPage;
