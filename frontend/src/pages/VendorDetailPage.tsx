import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, MapPin, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { bookingsApi } from '@/api/bookings.api';
import { HttpError } from '@/api/http';
import { reviewsApi } from '@/api/reviews.api';
import { servicesApi } from '@/api/services.api';
import { vendorsApi } from '@/api/vendors.api';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/back-button';
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

const parseLocalDate = (localDate: string) => {
	const [year, month, day] = localDate.split('-').map(Number);
	if (!year || !month || !day) {
		return new Date(Date.UTC(1970, 0, 1));
	}

	return new Date(Date.UTC(year, month - 1, day));
};

const formatDatePart = (localDate: string, options: Intl.DateTimeFormatOptions) => {
	return new Intl.DateTimeFormat(undefined, {
		timeZone: 'UTC',
		...options,
	}).format(parseLocalDate(localDate));
};

const addDaysToLocalDate = (localDate: string, days: number) => {
	const next = parseLocalDate(localDate);
	next.setUTCDate(next.getUTCDate() + days);
	const year = next.getUTCFullYear();
	const month = String(next.getUTCMonth() + 1).padStart(2, '0');
	const day = String(next.getUTCDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const buildDateOptions = (startDate: string, count: number) => {
	return Array.from({ length: count }, (_, index) => {
		const value = addDaysToLocalDate(startDate, index);
		return {
			value,
			weekday: formatDatePart(value, { weekday: 'short' }),
			dayNumber: formatDatePart(value, { day: 'numeric' }),
			monthLabel: formatDatePart(value, { month: 'short' }),
			isToday: index === 0,
		};
	});
};

const formatTime24To12 = (value: string) => {
	const [hoursRaw, minutesRaw] = value.split(':').map(Number);
	if (!Number.isFinite(hoursRaw) || !Number.isFinite(minutesRaw)) {
		return value;
	}

	const period = hoursRaw >= 12 ? 'PM' : 'AM';
	const hours12 = hoursRaw % 12 || 12;
	const minutes = String(minutesRaw).padStart(2, '0');
	return `${hours12}:${minutes} ${period}`;
};

const VendorDetailPage = () => {
	const { id: vendorId } = useParams();
	const { isAuthenticated, user } = useAuth();
	const { push } = useToast();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const location = useLocation();
	const bookingPanelRef = useRef<HTMLDivElement | null>(null);
	const availabilityPrefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
		enabled: Boolean(vendorId && selectedServiceId && bookingDateLocal && isAuthenticated && isCustomer),
		staleTime: 30_000,
		gcTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
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

	useEffect(() => {
		return () => {
			if (availabilityPrefetchTimerRef.current) {
				clearTimeout(availabilityPrefetchTimerRef.current);
			}
		};
	}, []);

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
					time: `${formatTime24To12(item.startTime)} - ${formatTime24To12(item.endTime)}`,
				})),
		[vendor?.workingHours]
	);

	const dateOptions = useMemo(() => {
		return buildDateOptions(getCurrentAddisDate(), 7);
	}, []);

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
				hour12: true,
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
				hour12: true,
			}),
		[]
	);

	const focusBookingPanel = (serviceId?: string) => {
		if (serviceId) {
			setSelectedServiceId(serviceId);
			setSelectedSlotStartUtc('');
		}

		bookingPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const scheduleAvailabilityPrefetch = (serviceId: string, dates: string[]) => {
		if (!vendorId || !serviceId || !isAuthenticated || !isCustomer) {
			return;
		}

		if (availabilityPrefetchTimerRef.current) {
			clearTimeout(availabilityPrefetchTimerRef.current);
		}

		availabilityPrefetchTimerRef.current = setTimeout(() => {
			dates.forEach((localDate) => {
				const queryKey = ['bookings', 'available-slots', vendorId, serviceId, localDate] as const;
				const queryState = queryClient.getQueryState(queryKey);
				const isStillFresh = Boolean(
					queryState?.dataUpdatedAt && Date.now() - queryState.dataUpdatedAt < 30_000
				);

				if (isStillFresh) {
					return;
				}

				void queryClient.prefetchQuery({
					queryKey,
					queryFn: () =>
						bookingsApi.listAvailableSlots({
							vendorId,
							serviceId,
							localDate,
						}),
					staleTime: 30_000,
				});
			});
		}, 180);
	};

	const handleServiceSelection = (serviceId: string) => {
		setSelectedServiceId(serviceId);
		setSelectedSlotStartUtc('');
		setBookingFormError('');

		scheduleAvailabilityPrefetch(serviceId, [
			bookingDateLocal,
			addDaysToLocalDate(bookingDateLocal, -1),
			addDaysToLocalDate(bookingDateLocal, 1),
		]);
	};

	const handleDateSelection = (localDate: string) => {
		setBookingDateLocal(localDate);
		setSelectedSlotStartUtc('');
		setBookingFormError('');

		if (!selectedServiceId) {
			return;
		}

		scheduleAvailabilityPrefetch(selectedServiceId, [
			addDaysToLocalDate(localDate, -1),
			addDaysToLocalDate(localDate, 1),
		]);
	};

	const formatSlotLabel = (slot: BookingAvailabilitySlot) => {
		const start = new Date(slot.startsAtUtc);
		const end = new Date(slot.endsAtUtc);
		return `${start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })} - ${end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;
	};

	const formatSlotStart = (slot: BookingAvailabilitySlot) => {
		const start = new Date(slot.startsAtUtc);
		return start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
	};

	const showAvailabilitySkeleton =
		availabilityQuery.isLoading || (availabilityQuery.isFetching && !availabilityQuery.data);

	const submitBooking = () => {
		if (!ensureSignedIn()) {
			return;
		}

		if (!isCustomer) {
			push('Only customer accounts can create bookings.', 'error');
			return;
		}

		void bookingMutation.mutateAsync();
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
		<section className="container mx-auto px-4 py-8 lg:px-6 lg:py-12">
			<BackButton className="mb-4" fallbackTo="/vendors" />

			<div className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
				<div className="relative h-44 bg-gradient-primary sm:h-56">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_10%,rgba(255,255,255,0.24),transparent_40%)]" />
				</div>

				<div className="relative z-10 px-5 pb-6 sm:px-8 sm:pb-8">
					<div className="-mt-16 flex flex-wrap items-end justify-between gap-5 sm:-mt-20">
						<div className="flex items-end gap-4">
							<div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-md sm:h-28 sm:w-28">
								{(vendor.images?.[0] || vendor.imageUrl) ? (
									<img
										src={vendor.images?.[0] || vendor.imageUrl || ''}
										alt={vendor.displayName}
										className="h-full w-full object-cover"
									/>
								) : null}
							</div>

							<div className="pb-1">
								<p className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
									{vendor.categories[0] || 'General'}
								</p>
								<h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
									{vendor.displayName}
								</h1>
								<div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
									<span className="inline-flex items-center gap-1 text-amber-500">
										<Star className="h-4 w-4 fill-current" />
										<span className="font-semibold text-slate-800">{vendor.averageRating.toFixed(1)}</span>
									</span>
									<span>{vendor.reviewCount} reviews</span>
									<span className="inline-flex items-center gap-1">
										<MapPin className="h-4 w-4" />
										{vendor.location.city}
									</span>
								</div>
							</div>
						</div>

					</div>

					<p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
						{vendor.description ||
							'Professional services with clear booking details, modern scheduling, and customer-friendly support.'}
					</p>

					<div className="mt-4 flex flex-wrap justify-end gap-3 sm:mt-5">
						<Button className="rounded-full px-6" onClick={() => focusBookingPanel()}>
							Book Now
						</Button>
						<Button variant="outline" className="rounded-full px-6" onClick={openReviewDialog}>
							Write Review
						</Button>
					</div>
				</div>
			</div>

			<div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
				<div className="space-y-8">
					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<h2 className="text-xl font-semibold tracking-tight">About</h2>
						<p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
							{vendor.description ||
								'Experienced service provider with verified scheduling, transparent pricing, and responsive communication.'}
						</p>
					</div>

					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div>
								<h2 className="text-xl font-semibold tracking-tight">Services</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									Choose a service to unlock available times instantly.
								</p>
							</div>
							{startingPrice !== null ? (
								<div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">
									From{' '}
									<span className="font-semibold text-foreground">
										{currencyFormatter.format(startingPrice)}
									</span>
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
							<div className="mt-5 space-y-3">
								{services.map((service) => {
									const isActive = selectedServiceId === service.id;
									return (
										<article
											key={service.id}
											className={`rounded-2xl border p-4 transition-colors ${
												isActive
													? 'border-primary/45 bg-primary/5'
													: 'border-border bg-muted/15 hover:bg-muted/30'
											}`}
										>
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<p className="text-base font-semibold text-foreground">{service.name}</p>
													<p className="mt-1 text-sm text-muted-foreground">
														{service.durationMinutes} min
													</p>
												</div>
												<p className="text-lg font-semibold text-slate-900">
													{currencyFormatter.format(service.priceAmount)}
												</p>
											</div>
											<p className="mt-3 text-sm leading-6 text-muted-foreground">
												{service.description ||
													'No description provided for this service yet.'}
											</p>
											<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
												<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
													{service.depositType === 'none' ? 'No deposit required' : 'Deposit may apply'}
												</span>
												<Button variant={isActive ? 'default' : 'outline'} onClick={() => focusBookingPanel(service.id)}>
													{isActive ? 'Selected' : 'Book this service'}
												</Button>
											</div>
										</article>
									);
								})}
							</div>
						) : null}
					</div>

					<div className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-7">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div>
								<h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									Real customer feedback after completed appointments.
								</p>
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

						<div className="mt-5 rounded-2xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
							Need to manage existing appointments?{' '}
							<Link to="/bookings" className="font-medium text-primary hover:underline">
								Open my bookings
							</Link>
						</div>
					</div>

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
												<div
													key={item.label}
													className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2"
												>
													<span className="font-medium text-foreground">{item.label}</span>
													<span>{item.time}</span>
												</div>
											))
										) : (
											<p>No working hours published yet.</p>
										)}
									</div>
								</div>
							</div>
							<div className="overflow-hidden rounded-2xl border border-border bg-background">
								{mapEmbedUrl ? (
									<iframe
										title="Vendor location"
										src={mapEmbedUrl}
										className="h-full min-h-80 w-full border-0"
										loading="lazy"
										referrerPolicy="no-referrer-when-downgrade"
									/>
								) : (
									<div className="flex h-full min-h-80 items-center justify-center p-6 text-sm text-muted-foreground">
										Location coordinates have not been published yet.
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				<div ref={bookingPanelRef} className="xl:sticky xl:top-24">
					<div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm sm:p-6">
						<p className="text-base font-semibold tracking-tight text-slate-900">Select Date and Time</p>
						<p className="mt-1 text-sm text-muted-foreground">
							Pick a service, choose a date, then lock an available slot.
						</p>

						<div className="mt-3 grid grid-cols-3 gap-2 text-xs">
							<div className={`rounded-xl border px-2 py-2 text-center ${selectedServiceId ? 'border-success/35 bg-success/10 text-success' : 'border-border bg-muted/25 text-muted-foreground'}`}>
								<span className="sm:hidden">1 Service</span>
								<span className="hidden sm:inline">Step 1: Service</span>
							</div>
							<div className={`rounded-xl border px-2 py-2 text-center ${selectedServiceId ? 'border-info/35 bg-info/10 text-info' : 'border-border bg-muted/25 text-muted-foreground'}`}>
								<span className="sm:hidden">2 Date</span>
								<span className="hidden sm:inline">Step 2: Date</span>
							</div>
							<div className={`rounded-xl border px-2 py-2 text-center ${selectedSlotStartUtc ? 'border-primary/35 bg-primary/10 text-primary' : 'border-border bg-muted/25 text-muted-foreground'}`}>
								<span className="sm:hidden">3 Confirm</span>
								<span className="hidden sm:inline">Step 3: Confirm</span>
							</div>
						</div>

						<div className="mt-3 rounded-xl border border-info/30 bg-info/10 px-3 py-2 text-xs text-info">
							All availability is shown in East Africa Time ({ADDIS_TIMEZONE}).
						</div>

						<div className="mt-5">
							<label htmlFor="serviceId" className="mb-1 block text-sm font-medium">
								Service
							</label>
							<select
								id="serviceId"
								className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm"
								value={selectedServiceId}
								onChange={(event) => handleServiceSelection(event.target.value)}
								disabled={services.length === 0}
							>
								<option value="">Select a service</option>
								{services.map((service) => (
									<option key={service.id} value={service.id}>
										{service.name} • {currencyFormatter.format(service.priceAmount)}
									</option>
								))}
							</select>
						</div>

						<div className="mt-5">
							<p className="mb-2 text-sm font-medium">Select date</p>
							<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
								{dateOptions.map((item) => {
									const isActive = bookingDateLocal === item.value;
									return (
										<button
											key={item.value}
											type="button"
											onClick={() => handleDateSelection(item.value)}
											className={`rounded-xl border px-2 py-2 text-center transition-colors ${
												isActive
													? 'border-primary bg-primary text-primary-foreground'
													: 'border-border bg-muted/20 text-foreground hover:bg-muted/40'
											}`}
										>
											<p className="text-[11px] font-medium uppercase tracking-wide opacity-90">{item.weekday}</p>
											<p className="text-lg font-semibold leading-5">{item.dayNumber}</p>
											<p className="text-[11px] opacity-90">{item.monthLabel}</p>
											{item.isToday ? <p className="text-[10px] opacity-80">Today</p> : null}
										</button>
									);
								})}
							</div>
						</div>

						<div className="mt-5">
							<p className="mb-2 text-sm font-medium">Available times</p>
							{!isAuthenticated ? (
								<div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground" role="status">
									Sign in as a customer to view live availability.
								</div>
							) : !isCustomer ? (
								<div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground" role="status">
									Only customer accounts can book appointments.
								</div>
							) : !selectedServiceId ? (
								<div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground" role="status">
									Choose a service to load available slots.
								</div>
							) : showAvailabilitySkeleton ? (
								<div className="grid grid-cols-2 gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-3">
									{Array.from({ length: 8 }).map((_, index) => (
										<div key={`slot-skeleton-${index}`} className="h-9 animate-pulse rounded-md bg-muted" />
									))}
								</div>
							) : availabilityQuery.isError ? (
								<div className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">
									{availabilityQuery.error instanceof Error
										? availabilityQuery.error.message
										: 'Failed to load availability slots.'}
								</div>
							) : availableSlots.length === 0 ? (
								<div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
									No open slots on this date. Try another day.
								</div>
							) : (
								<div className="grid grid-cols-2 gap-2">
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
												{formatSlotStart(slot)}
											</Button>
										);
									})}
								</div>
							)}
						</div>

						<div className="mt-5 rounded-2xl bg-muted/50 p-3 text-sm text-muted-foreground">
							{selectedService ? (
								<div className="space-y-1">
									<p>
										Service:{' '}
										<span className="font-medium text-foreground">{selectedService.name}</span>{' '}
										for{' '}
										<span className="font-medium text-foreground">
											{currencyFormatter.format(selectedService.priceAmount)}
										</span>
									</p>
									{selectedSlot ? (
										<p>
											Slot:{' '}
											<span className="font-medium text-foreground">{formatSlotLabel(selectedSlot)}</span>{' '}
											on <span className="font-medium text-foreground">{bookingDateLocal}</span>
										</p>
									) : null}
								</div>
							) : (
								<p>Choose a service to see the booking summary.</p>
							)}
						</div>

						<div className="mt-4">
							<label htmlFor="bookingNotes" className="mb-1 block text-sm font-medium">
								Notes (optional)
							</label>
							<Textarea
								id="bookingNotes"
								placeholder="Any preferences or details to share before your appointment"
								value={bookingNotes}
								onChange={(event) => setBookingNotes(event.target.value)}
							/>
						</div>

						{bookingFormError ? <p className="mt-3 text-sm text-destructive">{bookingFormError}</p> : null}

						<div className="mt-5 space-y-3">
							{!isAuthenticated ? (
								<Button
									className="w-full"
									onClick={() => {
										navigate('/login', { state: { from: location } });
									}}
								>
									Sign in to book
								</Button>
							) : (
								<Button
									className="w-full"
									disabled={!selectedSlotStartUtc || !isCustomer}
									loading={bookingMutation.isPending}
									loadingText="Booking..."
									onClick={submitBooking}
								>
									Confirm Booking
								</Button>
							)}

							<div className="space-y-3 pt-1">
								<div className="flex gap-3 rounded-2xl bg-muted/30 p-3">
									<div className="rounded-xl bg-white p-2 shadow-sm">
										<CalendarDays className="h-4 w-4 text-primary" />
									</div>
									<p className="text-xs leading-5 text-muted-foreground">
										Choose the service that best matches your visit goal.
									</p>
								</div>
								<div className="flex gap-3 rounded-2xl bg-muted/30 p-3">
									<div className="rounded-xl bg-white p-2 shadow-sm">
										<MessageSquare className="h-4 w-4 text-primary" />
									</div>
									<p className="text-xs leading-5 text-muted-foreground">
										Share notes so the vendor can prepare before your slot.
									</p>
								</div>
								<div className="flex gap-3 rounded-2xl bg-muted/30 p-3">
									<div className="rounded-xl bg-white p-2 shadow-sm">
										<ShieldCheck className="h-4 w-4 text-primary" />
									</div>
									<p className="text-xs leading-5 text-muted-foreground">
										Review after completion to help future customers choose better.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
				<DialogTrigger asChild>
					<span className="hidden" aria-hidden="true" />
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
											{booking.serviceName || 'Completed service'} •{' '}
											{shortDateFormatter.format(new Date(booking.startsAtUtc))}
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
										Completed appointments from this vendor will appear here automatically once
										available.
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
