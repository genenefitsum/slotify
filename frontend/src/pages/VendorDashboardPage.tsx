import { type ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BriefcaseBusiness, CalendarClock, CircleDollarSign, MapPin, Upload } from 'lucide-react';

import { bookingsApi } from '@/api/bookings.api';
import { HttpError } from '@/api/http';
import { servicesApi } from '@/api/services.api';
import { vendorsApi } from '@/api/vendors.api';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import PageSkeleton from '@/components/ui/page-skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import type { Booking, BookingTransitionAction } from '@/types/booking';
import type { CreateServicePayload, Service, UpdateServicePayload } from '@/types/service';
import type { BlackoutSlot, CreateVendorPayload, UpdateVendorPayload, Vendor, WorkingHour } from '@/types/vendor';

const BOOKINGS_PAGE_SIZE = 8;
const SERVICES_PAGE_SIZE = 10;
const ADDIS_TIMEZONE = 'Africa/Addis_Ababa';
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
type CoordinatePair = [number, number];

const createDefaultWorkingHours = (): WorkingHour[] =>
	DAY_LABELS.map((_, index) => ({
		dayOfWeek: index,
		isEnabled: index >= 1 && index <= 5,
		startTime: '09:00',
		endTime: '18:00',
	}));

const createEmptyBlackout = (): BlackoutSlot => ({
	date: '',
	startTime: '09:00',
	endTime: '10:00',
	label: '',
});

const createVendorForm = (vendor?: Vendor): CreateVendorPayload => ({
	displayName: vendor?.displayName || '',
	image: undefined,
	legalBusinessName: vendor?.legalBusinessName || '',
	description: vendor?.description || '',
	categories: vendor?.categories || [],
	workingHours: vendor?.workingHours?.length ? vendor.workingHours : createDefaultWorkingHours(),
	blackoutSlots: vendor?.blackoutSlots || [],
	location: {
		countryCode: vendor?.location.countryCode || 'ET',
		city: vendor?.location.city || '',
		addressLine1: vendor?.location.addressLine1 || '',
		addressLine2: vendor?.location.addressLine2 || '',
		description: vendor?.location.description || '',
		coordinates: vendor?.location.coordinates.coordinates || [0, 0],
	},
});

const isValidLatitude = (value: number) => Number.isFinite(value) && value >= -90 && value <= 90;

const isValidLongitude = (value: number) => Number.isFinite(value) && value >= -180 && value <= 180;

const toLatLng = (latitude: number, longitude: number): CoordinatePair | null => {
	if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
		return null;
	}

	return [latitude, longitude];
};

const parseCoordinatePair = (value: string): CoordinatePair | null => {
	const match = value.match(/(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/);
	if (!match) {
		return null;
	}

	return toLatLng(Number(match[1]), Number(match[2]));
};

const parseGoogleMapsCoordinates = (value: string): CoordinatePair | null => {
	const text = value.trim();
	if (!text) {
		return null;
	}

	const normalizedText = text.replace(/\+/g, ' ');
	const decodedText = (() => {
		try {
			return decodeURIComponent(normalizedText);
		} catch {
			return normalizedText;
		}
	})();

	const parserStrategies: Array<(candidate: string) => CoordinatePair | null> = [
		(candidate: string): CoordinatePair | null => {
			const dataMatch = candidate.match(/!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/);
			return dataMatch ? toLatLng(Number(dataMatch[1]), Number(dataMatch[2])) : null;
		},
		(candidate: string): CoordinatePair | null => {
			const atMatch = candidate.match(/@(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/);
			return atMatch ? toLatLng(Number(atMatch[1]), Number(atMatch[2])) : null;
		},
		(candidate: string): CoordinatePair | null => {
			const queryMatch = candidate.match(/(?:q|query|ll|center|destination|saddr|daddr)=(-?\d{1,3}(?:\.\d+)?)(?:,|%2C)\s*(-?\d{1,3}(?:\.\d+)?)/i);
			return queryMatch ? toLatLng(Number(queryMatch[1]), Number(queryMatch[2])) : null;
		},
		parseCoordinatePair,
	];

	for (const candidate of [decodedText, text]) {
		for (const parseCandidate of parserStrategies) {
			const parsed = parseCandidate(candidate);
			if (parsed) {
				return parsed;
			}
		}
	}

	const urlText = /^[a-z][a-z\d+.-]*:\/\//i.test(text)
		? text
		: text.startsWith('www.')
			? `https://${text}`
			: null;

	if (urlText) {
		try {
			const url = new URL(urlText);
			const paramCandidates = ['q', 'query', 'll', 'center', 'destination', 'saddr', 'daddr']
				.map((key) => url.searchParams.get(key))
				.filter((item): item is string => Boolean(item));

			for (const candidate of [url.href, url.pathname, url.hash, ...paramCandidates]) {
				const parsed = parseGoogleMapsCoordinates(candidate);
				if (parsed) {
					return parsed;
				}
			}
		} catch {
			return null;
		}
	}

	return null;
};

const looksLikeUrl = (value: string) => /^[a-z][a-z\d+.-]*:\/\//i.test(value) || value.startsWith('www.') || value.includes('.');

const actionLabelMap: Record<BookingTransitionAction, string> = {
	confirm: 'Confirm',
	start: 'Start',
	complete: 'Complete',
	cancel: 'Cancel',
	'no-show': 'No-show',
};

const bookingStatusLabelMap: Record<Booking['status'], string> = {
	pending_payment: 'Pending payment',
	confirmed: 'Confirmed',
	in_service: 'In service',
	completed: 'Completed',
	cancelled: 'Cancelled',
	no_show: 'No-show',
};

const getAllowedActions = (booking: Booking): BookingTransitionAction[] => {
	switch (booking.status) {
		case 'pending_payment':
			return ['confirm', 'cancel'];
		case 'confirmed':
			return ['start', 'cancel', 'no-show'];
		case 'in_service':
			return ['complete'];
		default:
			return [];
	}
};

const VendorDashboardPage = () => {
	const queryClient = useQueryClient();
	const { push } = useToast();
	const [servicePage, setServicePage] = useState(1);
	const [bookingPage, setBookingPage] = useState(1);

	const [vendorDraft, setVendorDraft] = useState<CreateVendorPayload | null>(null);
	const [categoryInput, setCategoryInput] = useState<string | null>(null);
	const [googleMapsLink, setGoogleMapsLink] = useState('');
	const [isResolvingMapLink, setIsResolvingMapLink] = useState(false);
	const [serviceDraft, setServiceDraft] = useState<CreateServicePayload>({
		name: '',
		description: '',
		durationMinutes: 60,
		bufferBeforeMinutes: 0,
		bufferAfterMinutes: 0,
		priceAmount: 0,
		currency: 'ETB',
		depositType: 'none',
		depositValue: 0,
	});
	const [serviceEditingId, setServiceEditingId] = useState<string | null>(null);

	const vendorQuery = useQuery({
		queryKey: ['vendor', 'me'],
		queryFn: () => vendorsApi.getMyVendor(),
		retry: false,
	});

	const vendorForm = vendorDraft ?? createVendorForm(vendorQuery.data);
	const imagePreview = useMemo(() => {
		if (vendorDraft?.image === null) {
			return '';
		}

		if (vendorDraft?.image?.data) {
			return vendorDraft.image.data;
		}

		return vendorQuery.data?.imageUrl || '';
	}, [vendorDraft, vendorQuery.data?.imageUrl]);
	const updateVendorForm = (updater: (current: CreateVendorPayload) => CreateVendorPayload) => {
		setVendorDraft((prev) => updater(prev ?? createVendorForm(vendorQuery.data)));
	};

	const applyCoordinates = (coordinates: number[]) => {
		if (coordinates.length < 2) {
			push('Could not extract coordinates from that link.', 'error');
			return;
		}

		const [longitude, latitude] = coordinates;
		if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
			push('Could not extract coordinates from that link.', 'error');
			return;
		}

		updateVendorForm((current) => ({
			...current,
			location: {
				...current.location,
				coordinates: [longitude, latitude],
			},
		}));
		setGoogleMapsLink('');
		push('Coordinates updated from Google Maps.', 'success');
	};

	const handleMapLinkApply = async () => {
		const rawLink = googleMapsLink.trim();
		const parsed = parseGoogleMapsCoordinates(rawLink);
		if (!parsed) {
			if (!looksLikeUrl(rawLink)) {
				push('Paste a Google Maps link or coordinates like 8.9950, 38.7924.', 'error');
				return;
			}

			setIsResolvingMapLink(true);
			try {
				const resolved = await vendorsApi.resolveMapLink(rawLink);
				applyCoordinates(resolved.coordinates);
			} catch (error) {
				push(error instanceof HttpError ? error.message : 'Unable to resolve that Google Maps link.', 'error');
			} finally {
				setIsResolvingMapLink(false);
			}

			return;
		}

		applyCoordinates([parsed[1], parsed[0]]);
	};

	const updateWorkingHour = (dayOfWeek: number, patch: Partial<WorkingHour>) => {
		updateVendorForm((current) => ({
			...current,
			workingHours: (current.workingHours || createDefaultWorkingHours()).map((item) =>
				item.dayOfWeek === dayOfWeek ? { ...item, ...patch } : item
			),
		}));
	};

	const updateBlackoutSlot = (index: number, patch: Partial<BlackoutSlot>) => {
		updateVendorForm((current) => ({
			...current,
			blackoutSlots: (current.blackoutSlots || []).map((item, itemIndex) =>
				itemIndex === index ? { ...item, ...patch } : item
			),
		}));
	};

	const addBlackoutSlot = () => {
		updateVendorForm((current) => ({
			...current,
			blackoutSlots: [...(current.blackoutSlots || []), createEmptyBlackout()],
		}));
	};

	const removeBlackoutSlot = (index: number) => {
		updateVendorForm((current) => ({
			...current,
			blackoutSlots: (current.blackoutSlots || []).filter((_, itemIndex) => itemIndex !== index),
		}));
	};

	const handleVendorImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		if (!file.type.startsWith('image/')) {
			push('Select a valid image file.', 'error');
			return;
		}

		if (file.size > 2 * 1024 * 1024) {
			push('Vendor image must be 2MB or less.', 'error');
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const result = typeof reader.result === 'string' ? reader.result : '';
			if (!result) {
				push('Unable to read the selected image.', 'error');
				return;
			}

			updateVendorForm((current) => ({
				...current,
				image: {
					data: result,
					contentType: file.type,
				},
			}));
		};
		reader.readAsDataURL(file);
		event.target.value = '';
	};

	const servicesQuery = useQuery({
		queryKey: ['services', 'vendor-dashboard', { page: servicePage, vendorId: vendorQuery.data?.id }],
		queryFn: () =>
			servicesApi.list({
				vendorId: vendorQuery.data?.id,
				page: servicePage,
				limit: SERVICES_PAGE_SIZE,
			}),
		enabled: Boolean(vendorQuery.data?.id),
	});

	const bookingsQuery = useQuery({
		queryKey: ['bookings', 'vendor-dashboard', { page: bookingPage }],
		queryFn: () => bookingsApi.list({ page: bookingPage, limit: BOOKINGS_PAGE_SIZE }),
		staleTime: 15_000,
	});

	const upsertVendorMutation = useMutation({
		mutationFn: () => {
			const payload = {
				...vendorForm,
				image: vendorForm.image,
				legalBusinessName: vendorForm.legalBusinessName || undefined,
				description: vendorForm.description || undefined,
				categories: vendorForm.categories,
				location: {
					...vendorForm.location,
					addressLine1: vendorForm.location.addressLine1 || undefined,
					addressLine2: vendorForm.location.addressLine2 || undefined,
					coordinates: vendorForm.location.coordinates,
				},
			};

			if (vendorQuery.data) {
				return vendorsApi.updateMyVendor(payload as UpdateVendorPayload);
			}

			return vendorsApi.create(payload as CreateVendorPayload);
		},
		onSuccess: () => {
			push(vendorQuery.data ? 'Vendor profile updated.' : 'Vendor profile created.', 'success');
			void queryClient.invalidateQueries({ queryKey: ['vendor', 'me'] });
			void queryClient.invalidateQueries({ queryKey: ['vendors'] });
		},
		onError: (error) => {
			push(error instanceof HttpError ? error.message : 'Unable to save vendor profile.', 'error');
		},
	});

	const upsertServiceMutation = useMutation({
		mutationFn: () => {
			if (serviceEditingId) {
				return servicesApi.update(serviceEditingId, serviceDraft as UpdateServicePayload);
			}
			return servicesApi.create(serviceDraft);
		},
		onSuccess: () => {
			push(serviceEditingId ? 'Service updated.' : 'Service created.', 'success');
			setServiceEditingId(null);
			setServiceDraft({
				name: '',
				description: '',
				durationMinutes: 60,
				bufferBeforeMinutes: 0,
				bufferAfterMinutes: 0,
				priceAmount: 0,
					currency: 'ETB',
				depositType: 'none',
				depositValue: 0,
			});
			void queryClient.invalidateQueries({ queryKey: ['services'] });
		},
		onError: (error) => {
			push(error instanceof HttpError ? error.message : 'Unable to save service.', 'error');
		},
	});

	const deleteServiceMutation = useMutation({
		mutationFn: (serviceId: string) => servicesApi.remove(serviceId),
		onSuccess: () => {
			push('Service removed.', 'success');
			void queryClient.invalidateQueries({ queryKey: ['services'] });
		},
		onError: (error) => {
			push(error instanceof HttpError ? error.message : 'Unable to remove service.', 'error');
		},
	});

	const bookingActionMutation = useMutation({
		mutationFn: ({ bookingId, action }: { bookingId: string; action: BookingTransitionAction }) => {
			if (action === 'confirm') {
				return bookingsApi.confirm(bookingId);
			}
			if (action === 'start') {
				return bookingsApi.start(bookingId);
			}
			if (action === 'complete') {
				return bookingsApi.complete(bookingId);
			}
			if (action === 'cancel') {
				return bookingsApi.cancel(bookingId, { reasonCode: 'vendor_update', reasonText: 'Cancelled from vendor dashboard' });
			}
			return bookingsApi.markNoShow(bookingId);
		},
		onSuccess: () => {
			push('Booking status updated.', 'success');
			void queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
		onError: (error) => {
			push(error instanceof HttpError ? error.message : 'Unable to update booking status.', 'error');
		},
	});

	const isVendorMissing =
		vendorQuery.isError && vendorQuery.error instanceof HttpError && vendorQuery.error.status === 404;

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: 'ETB',
				maximumFractionDigits: 2,
			}),
		[]
	);

	const mapEmbedUrl = useMemo(() => {
		const [longitude, latitude] = vendorForm.location.coordinates || [0, 0];
		if (!latitude || !longitude) {
			return '';
		}

		return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
	}, [vendorForm.location.coordinates]);

	const googleMapsOpenUrl = useMemo(() => {
		const [longitude, latitude] = vendorForm.location.coordinates || [0, 0];
		if (latitude && longitude) {
			return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
		}

		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vendorForm.location.city || 'Addis Ababa')}`;
	}, [vendorForm.location.city, vendorForm.location.coordinates]);

	const serviceItems = servicesQuery.data?.items || [];
	const bookingItems = bookingsQuery.data?.items || [];
	const nextActionableBookings = bookingItems.filter(
		(booking) => booking.status === 'pending_payment' || booking.status === 'confirmed' || booking.status === 'in_service'
	).length;
	const averageServicePrice =
		serviceItems.length > 0
			? serviceItems.reduce((sum, service) => sum + service.priceAmount, 0) / serviceItems.length
			: 0;
	const nextBookingTime = bookingItems[0]?.startsAtUtc
		? new Date(bookingItems[0].startsAtUtc).toLocaleString()
		: null;

	const syncServiceDraftFromItem = (service: Service) => {
		setServiceEditingId(service.id);
		setServiceDraft({
			name: service.name,
			description: service.description,
			durationMinutes: service.durationMinutes,
			bufferBeforeMinutes: service.bufferBeforeMinutes,
			bufferAfterMinutes: service.bufferAfterMinutes,
			priceAmount: service.priceAmount,
			currency: 'ETB',
			depositType: service.depositType,
			depositValue: service.depositValue,
		});
	};

	return (
		<section className="container mx-auto space-y-8 px-4 py-14">
			<header>
				<h1 className="text-3xl font-semibold">Vendor Dashboard</h1>
				<p className="mt-2 text-muted-foreground">Manage your profile, services, and booking operations from one place.</p>
			</header>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<div className="rounded-2xl border border-border bg-card p-5">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-emerald-100 p-2 text-emerald-700">
							<BriefcaseBusiness className="h-4 w-4" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Published services</p>
							<p className="text-xl font-semibold">{serviceItems.length}</p>
						</div>
					</div>
				</div>
				<div className="rounded-2xl border border-border bg-card p-5">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-sky-100 p-2 text-sky-700">
							<CalendarClock className="h-4 w-4" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Needs action</p>
							<p className="text-xl font-semibold">{nextActionableBookings}</p>
						</div>
					</div>
				</div>
				<div className="rounded-2xl border border-border bg-card p-5">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
							<CircleDollarSign className="h-4 w-4" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Average service price</p>
							<p className="text-xl font-semibold">{currencyFormatter.format(averageServicePrice || 0)}</p>
							<p className="text-xs text-muted-foreground">Displayed in Ethiopian Birr</p>
						</div>
					</div>
				</div>
				<div className="rounded-2xl border border-border bg-card p-5">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
							<MapPin className="h-4 w-4" />
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Profile status</p>
							<p className="text-xl font-semibold">
								{vendorQuery.data ? vendorQuery.data.status.replace('_', ' ') : 'Set up profile'}
							</p>
							<p className="text-xs text-muted-foreground">{nextBookingTime ? `Next booking ${nextBookingTime}` : 'No upcoming bookings yet'}</p>
						</div>
					</div>
				</div>
			</div>

			{vendorQuery.isLoading ? <PageSkeleton rows={2} className="grid-cols-1" /> : null}

			{vendorQuery.isError && !isVendorMissing ? (
				<ErrorState
					description={vendorQuery.error instanceof Error ? vendorQuery.error.message : 'Unable to load vendor profile.'}
					actionLabel="Retry"
					onAction={() => {
						void vendorQuery.refetch();
					}}
				/>
			) : null}

			{vendorQuery.isSuccess || isVendorMissing ? (
				<article className="rounded-[1.75rem] border border-border bg-card p-6">
					<h2 className="text-xl font-semibold">
						{isVendorMissing ? 'Create Vendor Profile' : 'Vendor Profile'}
					</h2>
					<p className="mt-1 text-sm text-muted-foreground">
						This information powers your public profile on the vendors marketplace.
					</p>

					<form
						className="mt-5 grid gap-3 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							void upsertVendorMutation.mutateAsync();
						}}
					>
						<div>
							<label htmlFor="displayName" className="mb-1 block text-sm font-medium">Display Name</label>
							<Input
								id="displayName"
								value={vendorForm.displayName}
								onChange={(event) => updateVendorForm((current) => ({ ...current, displayName: event.target.value }))}
								required
							/>
						</div>
						<div>
							<label htmlFor="legalBusinessName" className="mb-1 block text-sm font-medium">Legal Business Name</label>
							<Input
								id="legalBusinessName"
								value={vendorForm.legalBusinessName || ''}
								onChange={(event) => updateVendorForm((current) => ({ ...current, legalBusinessName: event.target.value }))}
							/>
						</div>
						<div>
							<label htmlFor="city" className="mb-1 block text-sm font-medium">City</label>
							<Input
								id="city"
								value={vendorForm.location.city}
								onChange={(event) => updateVendorForm((current) => ({
									...current,
									location: { ...current.location, city: event.target.value },
								}))}
								required
							/>
						</div>
						<div>
							<label htmlFor="countryCode" className="mb-1 block text-sm font-medium">Country Code</label>
							<Input
								id="countryCode"
								value={vendorForm.location.countryCode}
								onChange={(event) => updateVendorForm((current) => ({
									...current,
									location: { ...current.location, countryCode: event.target.value },
								}))}
								required
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium">Timezone</label>
							<div className="h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
								{ADDIS_TIMEZONE}
							</div>
						</div>
						<div>
							<label htmlFor="categories" className="mb-1 block text-sm font-medium">Categories</label>
							<Input
								id="categories"
								value={categoryInput ?? (vendorForm.categories?.join(', ') || '')}
								placeholder="Comma separated e.g. Beauty, Nails"
								onChange={(event) => setCategoryInput(event.target.value)}
								onBlur={() => {
									const categoriesSource = categoryInput ?? vendorForm.categories?.join(', ') ?? '';
									const categories = categoriesSource
										.split(',')
										.map((item) => item.trim())
										.filter(Boolean);

									updateVendorForm((current) => ({ ...current, categories }));
									setCategoryInput(categories.join(', '));
								}}
							/>
							{(vendorForm.categories?.length ?? 0) > 0 ? (
								<p className="mt-1 text-xs text-muted-foreground">Saved: {vendorForm.categories?.join(', ')}</p>
							) : null}
						</div>
						<div className="md:col-span-2">
							<label htmlFor="vendorImage" className="mb-1 block text-sm font-medium">Profile Image</label>
							<div className="flex flex-col gap-4 rounded-2xl border border-dashed border-border bg-muted/20 p-4 md:flex-row md:items-center">
								<div className="h-28 w-full overflow-hidden rounded-2xl bg-background md:w-44">
									{imagePreview ? (
										<img src={imagePreview} alt="Vendor preview" className="h-full w-full object-cover" />
									) : (
										<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
											No image uploaded
										</div>
									)}
								</div>
								<div className="flex-1 space-y-3">
										<input id="vendorImage" type="file" accept="image/*" onChange={handleVendorImageChange} className="hidden" />
										<label
											htmlFor="vendorImage"
											className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
										>
											<Upload className="h-4 w-4" />
											Choose image
										</label>
									<p className="text-xs text-muted-foreground">Upload a square or landscape image up to 2MB.</p>
									{imagePreview ? (
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												updateVendorForm((current) => ({ ...current, image: null }));
											}}
										>
											Remove image
										</Button>
									) : null}
								</div>
							</div>
						</div>
						<div className="md:col-span-2 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
							<div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<h3 className="font-semibold">Exact location</h3>
										<p className="text-sm text-muted-foreground">Paste a Google Maps link or enter coordinates directly.</p>
									</div>
									<Button asChild type="button" variant="outline">
										<a href={googleMapsOpenUrl} target="_blank" rel="noreferrer">Open Google Maps</a>
									</Button>
								</div>
								<div className="grid gap-3 md:grid-cols-[1fr_auto]">
									<Input
										value={googleMapsLink}
										onChange={(event) => setGoogleMapsLink(event.target.value)}
										placeholder="Paste Google Maps link or coordinates"
									/>
									<Button type="button" variant="outline" loading={isResolvingMapLink} loadingText="Resolving..." onClick={() => {
										void handleMapLinkApply();
									}}>Use link</Button>
								</div>
								<div className="grid gap-3 md:grid-cols-2">
									<div>
										<label htmlFor="latitude" className="mb-1 block text-sm font-medium">Latitude</label>
										<Input
											id="latitude"
											type="number"
											step="0.000001"
											value={vendorForm.location.coordinates?.[1] || ''}
											onChange={(event) => updateVendorForm((current) => ({
												...current,
												location: {
													...current.location,
													coordinates: [current.location.coordinates?.[0] || 0, Number(event.target.value)],
												},
											}))}
										/>
									</div>
									<div>
										<label htmlFor="longitude" className="mb-1 block text-sm font-medium">Longitude</label>
										<Input
											id="longitude"
											type="number"
											step="0.000001"
											value={vendorForm.location.coordinates?.[0] || ''}
											onChange={(event) => updateVendorForm((current) => ({
												...current,
												location: {
													...current.location,
													coordinates: [Number(event.target.value), current.location.coordinates?.[1] || 0],
												},
											}))}
										/>
									</div>
								</div>
								<div>
									<label htmlFor="locationDescription" className="mb-1 block text-sm font-medium">Location description</label>
									<Textarea
										id="locationDescription"
										value={vendorForm.location.description || ''}
										placeholder="Landmarks, floor, nearby buildings, or parking instructions"
										onChange={(event) => updateVendorForm((current) => ({
											...current,
											location: { ...current.location, description: event.target.value },
										}))}
									/>
								</div>
							</div>
							<div className="overflow-hidden rounded-2xl border border-border bg-background">
								{mapEmbedUrl ? (
									<iframe title="Vendor location map" src={mapEmbedUrl} className="h-full min-h-72 w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
								) : (
									<div className="flex h-full min-h-72 items-center justify-center p-6 text-sm text-muted-foreground">
										Add coordinates or paste a Google Maps link to preview the location.
									</div>
								)}
							</div>
						</div>
						<div className="md:col-span-2 rounded-2xl border border-border bg-muted/20 p-4">
							<div className="mb-4">
								<h3 className="font-semibold">Working hours</h3>
								<p className="text-sm text-muted-foreground">All times are saved in {ADDIS_TIMEZONE}.</p>
							</div>
							<div className="space-y-3">
								{(vendorForm.workingHours || createDefaultWorkingHours()).map((hour) => (
									<div key={hour.dayOfWeek} className="grid gap-3 rounded-xl border border-border bg-background p-3 md:grid-cols-[1.1fr_auto_1fr_1fr] md:items-center">
										<div>
											<p className="font-medium">{DAY_LABELS[hour.dayOfWeek]}</p>
											<p className="text-xs text-muted-foreground">Addis Ababa time</p>
										</div>
										<label className="flex items-center gap-2 text-sm">
											<input
												type="checkbox"
												checked={hour.isEnabled}
												onChange={(event) => updateWorkingHour(hour.dayOfWeek, { isEnabled: event.target.checked })}
											/>
											Open
										</label>
										<Input type="time" value={hour.startTime} disabled={!hour.isEnabled} onChange={(event) => updateWorkingHour(hour.dayOfWeek, { startTime: event.target.value })} />
										<Input type="time" value={hour.endTime} disabled={!hour.isEnabled} onChange={(event) => updateWorkingHour(hour.dayOfWeek, { endTime: event.target.value })} />
									</div>
								))}
							</div>
						</div>
						<div className="md:col-span-2 rounded-2xl border border-border bg-muted/20 p-4">
							<div className="mb-4 flex items-center justify-between gap-3">
								<div>
									<h3 className="font-semibold">Blocked times</h3>
									<p className="text-sm text-muted-foreground">Block dates and hours when customers should not be able to book.</p>
								</div>
								<Button type="button" variant="outline" onClick={addBlackoutSlot}>Add blocked time</Button>
							</div>
							<div className="space-y-3">
								{(vendorForm.blackoutSlots || []).length === 0 ? (
									<div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
										No blocked times added yet.
									</div>
								) : (
									(vendorForm.blackoutSlots || []).map((slot, index) => (
										<div key={`${slot.date}-${index}`} className="grid gap-3 rounded-xl border border-border bg-background p-3 lg:grid-cols-[1fr_0.9fr_0.9fr_1.2fr_auto] lg:items-center">
											<Input type="date" value={slot.date} onChange={(event) => updateBlackoutSlot(index, { date: event.target.value })} />
											<Input type="time" value={slot.startTime} onChange={(event) => updateBlackoutSlot(index, { startTime: event.target.value })} />
											<Input type="time" value={slot.endTime} onChange={(event) => updateBlackoutSlot(index, { endTime: event.target.value })} />
											<Input value={slot.label} placeholder="Reason or note" onChange={(event) => updateBlackoutSlot(index, { label: event.target.value })} />
											<Button type="button" variant="outline" onClick={() => removeBlackoutSlot(index)}>Remove</Button>
										</div>
									))
								)}
							</div>
						</div>
						<div className="md:col-span-2">
							<label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
							<Textarea
								id="description"
								value={vendorForm.description || ''}
								onChange={(event) => updateVendorForm((current) => ({ ...current, description: event.target.value }))}
							/>
						</div>
						<div className="md:col-span-2 flex justify-end">
							<Button type="submit" loading={upsertVendorMutation.isPending} loadingText="Saving...">
								{isVendorMissing ? 'Create profile' : 'Save profile'}
							</Button>
						</div>
					</form>
				</article>
			) : null}

			{vendorQuery.data ? (
				<article className="rounded-[1.75rem] border border-border bg-card p-6">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="text-xl font-semibold">Services</h2>
							<p className="text-sm text-muted-foreground">Create and manage services available for booking.</p>
						</div>
					</div>

					<form
						className="mt-5 grid gap-3 md:grid-cols-2"
						onSubmit={(event) => {
							event.preventDefault();
							void upsertServiceMutation.mutateAsync();
						}}
					>
						<div>
							<label htmlFor="serviceName" className="mb-1 block text-sm font-medium">Service Name</label>
							<Input
								id="serviceName"
								value={serviceDraft.name}
								onChange={(event) => setServiceDraft((prev) => ({ ...prev, name: event.target.value }))}
								required
							/>
						</div>
						<div>
							<label htmlFor="servicePrice" className="mb-1 block text-sm font-medium">Price</label>
							<Input
								id="servicePrice"
								type="number"
								min={0}
								step="0.01"
								value={serviceDraft.priceAmount}
								onChange={(event) =>
									setServiceDraft((prev) => ({ ...prev, priceAmount: Number(event.target.value) }))
								}
								required
							/>
						</div>
						<div>
							<label htmlFor="serviceDuration" className="mb-1 block text-sm font-medium">Duration (minutes)</label>
							<Input
								id="serviceDuration"
								type="number"
								min={5}
								step="5"
								value={serviceDraft.durationMinutes}
								onChange={(event) =>
									setServiceDraft((prev) => ({ ...prev, durationMinutes: Number(event.target.value) }))
								}
								required
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm font-medium">Currency</label>
							<div className="h-10 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">ETB</div>
						</div>
						<div className="md:col-span-2">
							<label htmlFor="serviceDescription" className="mb-1 block text-sm font-medium">Description</label>
							<Textarea
								id="serviceDescription"
								value={serviceDraft.description || ''}
								onChange={(event) =>
									setServiceDraft((prev) => ({ ...prev, description: event.target.value }))
								}
							/>
						</div>
						<div className="md:col-span-2 flex items-center justify-between gap-3">
							<p className="text-sm text-muted-foreground">
								Preview: {currencyFormatter.format(serviceDraft.priceAmount || 0)}
							</p>
							<div className="flex gap-2">
								{serviceEditingId ? (
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setServiceEditingId(null);
											setServiceDraft({
												name: '',
												description: '',
												durationMinutes: 60,
												bufferBeforeMinutes: 0,
												bufferAfterMinutes: 0,
												priceAmount: 0,
												currency: 'ETB',
												depositType: 'none',
												depositValue: 0,
											});
										}}
									>
										Clear
									</Button>
								) : null}
								<Button type="submit" loading={upsertServiceMutation.isPending} loadingText="Saving...">
									{serviceEditingId ? 'Update service' : 'Create service'}
								</Button>
							</div>
						</div>
					</form>

					<div className="mt-6">
						{servicesQuery.isLoading ? <PageSkeleton rows={3} className="grid-cols-1" /> : null}
						{servicesQuery.isError ? (
							<ErrorState
								description={servicesQuery.error instanceof Error ? servicesQuery.error.message : 'Unable to load services.'}
							/>
						) : null}
						{servicesQuery.isSuccess && servicesQuery.data.items.length === 0 ? (
							<EmptyState title="No services yet" description="Create your first service to appear on your profile." />
						) : null}

						{servicesQuery.data && servicesQuery.data.items.length > 0 ? (
							<>
								<div className="space-y-3">
									{servicesQuery.data.items.map((service) => (
										<article key={service.id} className="rounded-2xl border border-border bg-background p-5">
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<p className="text-sm font-medium text-primary">Public listing</p>
													<h3 className="mt-1 font-semibold">{service.name}</h3>
													<p className="text-sm text-muted-foreground">{service.description || 'No description.'}</p>
												</div>
												<div className="text-right">
													<p className="font-semibold">{currencyFormatter.format(service.priceAmount)}</p>
													<p className="text-sm text-muted-foreground">{service.durationMinutes} min</p>
												</div>
											</div>
											<div className="mt-3 flex justify-end gap-2">
												<Button type="button" variant="outline" onClick={() => syncServiceDraftFromItem(service)}>
													Edit
												</Button>
												<Button
													type="button"
													variant="destructive"
													loading={deleteServiceMutation.isPending}
													loadingText="Removing..."
													onClick={() => {
														void deleteServiceMutation.mutateAsync(service.id);
													}}
												>
													Remove
												</Button>
											</div>
										</article>
									))}
								</div>

								<Pagination
									className="mt-6"
									page={servicesQuery.data.pagination.page}
									totalPages={servicesQuery.data.pagination.totalPages}
									onPageChange={setServicePage}
								/>
							</>
						) : null}
					</div>
				</article>
			) : null}

			<article className="rounded-[1.75rem] border border-border bg-card p-6">
				<h2 className="text-xl font-semibold">Booking Operations</h2>
				<p className="mt-1 text-sm text-muted-foreground">Update booking statuses as customers progress through appointments.</p>

				<div className="mt-5">
					{bookingsQuery.isLoading ? <PageSkeleton rows={4} className="grid-cols-1" /> : null}
					{bookingsQuery.isError ? (
						<ErrorState
							description={bookingsQuery.error instanceof Error ? bookingsQuery.error.message : 'Unable to load bookings.'}
						/>
					) : null}

					{bookingsQuery.isSuccess && bookingsQuery.data.items.length === 0 ? (
						<EmptyState title="No bookings to manage" description="Incoming bookings will appear here." />
					) : null}

					{bookingsQuery.data && bookingsQuery.data.items.length > 0 ? (
						<>
							<div className="space-y-3">
								{bookingsQuery.data.items.map((booking) => (
									<article key={booking.id} className="rounded-2xl border border-border bg-background p-5">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div>
												<p className="text-sm font-medium text-primary">{booking.serviceName || 'Booked service'}</p>
												<p className="font-semibold">{new Date(booking.startsAtUtc).toLocaleString()}</p>
												<p className="text-sm text-muted-foreground">
													{booking.vendorName || 'Your vendor profile'} • {currencyFormatter.format(booking.pricingSnapshot.servicePriceAmount)}
												</p>
											</div>
											<p className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">
												{bookingStatusLabelMap[booking.status]}
											</p>
										</div>

										{booking.customerNotes ? (
											<p className="mt-3 rounded-xl bg-muted/40 p-3 text-sm text-muted-foreground">
												{booking.customerNotes}
											</p>
										) : null}

										<div className="mt-3 flex flex-wrap gap-2">
											{getAllowedActions(booking).map((action) => (
												<Button
													key={action}
													type="button"
													variant={action === 'cancel' ? 'destructive' : 'outline'}
													loading={bookingActionMutation.isPending}
													loadingText="Updating..."
													onClick={() => {
														void bookingActionMutation.mutateAsync({ bookingId: booking.id, action });
													}}
												>
													{actionLabelMap[action]}
												</Button>
											))}
										</div>
									</article>
								))}
							</div>

							<Pagination
								className="mt-6"
								page={bookingsQuery.data.pagination.page}
								totalPages={bookingsQuery.data.pagination.totalPages}
								onPageChange={setBookingPage}
							/>
						</>
					) : null}
				</div>
			</article>
		</section>
	);
};

export default VendorDashboardPage;
