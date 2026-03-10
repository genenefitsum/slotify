import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
import type { CreateVendorPayload, UpdateVendorPayload } from '@/types/vendor';

const BOOKINGS_PAGE_SIZE = 8;
const SERVICES_PAGE_SIZE = 10;

const actionLabelMap: Record<BookingTransitionAction, string> = {
	confirm: 'Confirm',
	start: 'Start',
	complete: 'Complete',
	cancel: 'Cancel',
	'no-show': 'No-show',
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

	const [vendorForm, setVendorForm] = useState<CreateVendorPayload>({
		displayName: '',
		legalBusinessName: '',
		description: '',
		categories: [],
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		location: {
			countryCode: 'ET',
			city: '',
			addressLine1: '',
			addressLine2: '',
			coordinates: [0, 0],
		},
	});
	const [categoryInput, setCategoryInput] = useState('');
	const [serviceDraft, setServiceDraft] = useState<CreateServicePayload>({
		name: '',
		description: '',
		durationMinutes: 60,
		bufferBeforeMinutes: 0,
		bufferAfterMinutes: 0,
		priceAmount: 0,
		currency: 'USD',
		depositType: 'none',
		depositValue: 0,
	});
	const [serviceEditingId, setServiceEditingId] = useState<string | null>(null);

	const vendorQuery = useQuery({
		queryKey: ['vendor', 'me'],
		queryFn: () => vendorsApi.getMyVendor(),
		retry: false,
	});

	useEffect(() => {
		if (!vendorQuery.data) {
			return;
		}

		setVendorForm({
			displayName: vendorQuery.data.displayName,
			legalBusinessName: vendorQuery.data.legalBusinessName || '',
			description: vendorQuery.data.description || '',
			categories: vendorQuery.data.categories || [],
			timezone: vendorQuery.data.timezone,
			location: {
				countryCode: vendorQuery.data.location.countryCode,
				city: vendorQuery.data.location.city,
				addressLine1: vendorQuery.data.location.addressLine1 || '',
				addressLine2: vendorQuery.data.location.addressLine2 || '',
				coordinates: vendorQuery.data.location.coordinates.coordinates,
			},
		});
	}, [vendorQuery.data]);

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
				currency: 'USD',
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
				currency: serviceDraft.currency || 'USD',
				maximumFractionDigits: 2,
			}),
		[serviceDraft.currency]
	);

	const syncServiceDraftFromItem = (service: Service) => {
		setServiceEditingId(service.id);
		setServiceDraft({
			name: service.name,
			description: service.description,
			durationMinutes: service.durationMinutes,
			bufferBeforeMinutes: service.bufferBeforeMinutes,
			bufferAfterMinutes: service.bufferAfterMinutes,
			priceAmount: service.priceAmount,
			currency: service.currency,
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
				<article className="rounded-xl border border-border bg-card p-6">
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
								onChange={(event) => setVendorForm((prev) => ({ ...prev, displayName: event.target.value }))}
								required
							/>
						</div>
						<div>
							<label htmlFor="legalBusinessName" className="mb-1 block text-sm font-medium">Legal Business Name</label>
							<Input
								id="legalBusinessName"
								value={vendorForm.legalBusinessName || ''}
								onChange={(event) =>
									setVendorForm((prev) => ({ ...prev, legalBusinessName: event.target.value }))
								}
							/>
						</div>
						<div>
							<label htmlFor="timezone" className="mb-1 block text-sm font-medium">Timezone</label>
							<Input
								id="timezone"
								value={vendorForm.timezone}
								onChange={(event) => setVendorForm((prev) => ({ ...prev, timezone: event.target.value }))}
								required
							/>
						</div>
						<div>
							<label htmlFor="city" className="mb-1 block text-sm font-medium">City</label>
							<Input
								id="city"
								value={vendorForm.location.city}
								onChange={(event) =>
									setVendorForm((prev) => ({ ...prev, location: { ...prev.location, city: event.target.value } }))
								}
								required
							/>
						</div>
						<div>
							<label htmlFor="countryCode" className="mb-1 block text-sm font-medium">Country Code</label>
							<Input
								id="countryCode"
								value={vendorForm.location.countryCode}
								onChange={(event) =>
									setVendorForm((prev) => ({ ...prev, location: { ...prev.location, countryCode: event.target.value } }))
								}
								required
							/>
						</div>
						<div>
							<label htmlFor="categories" className="mb-1 block text-sm font-medium">Categories</label>
							<Input
								id="categories"
								value={categoryInput}
								placeholder="Comma separated e.g. Beauty, Nails"
								onChange={(event) => setCategoryInput(event.target.value)}
								onBlur={() => {
									const categories = categoryInput
										.split(',')
										.map((item) => item.trim())
										.filter(Boolean);

									setVendorForm((prev) => ({ ...prev, categories }));
								}}
							/>
							{(vendorForm.categories?.length ?? 0) > 0 ? (
								<p className="mt-1 text-xs text-muted-foreground">Saved: {vendorForm.categories?.join(', ')}</p>
							) : null}
						</div>
						<div className="md:col-span-2">
							<label htmlFor="description" className="mb-1 block text-sm font-medium">Description</label>
							<Textarea
								id="description"
								value={vendorForm.description || ''}
								onChange={(event) => setVendorForm((prev) => ({ ...prev, description: event.target.value }))}
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
				<article className="rounded-xl border border-border bg-card p-6">
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
							<label htmlFor="serviceCurrency" className="mb-1 block text-sm font-medium">Currency</label>
							<Input
								id="serviceCurrency"
								value={serviceDraft.currency}
								onChange={(event) => setServiceDraft((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
								required
							/>
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
												currency: 'USD',
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
										<article key={service.id} className="rounded-lg border border-border bg-background p-4">
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div>
													<h3 className="font-semibold">{service.name}</h3>
													<p className="text-sm text-muted-foreground">{service.description || 'No description.'}</p>
												</div>
												<p className="font-semibold">{currencyFormatter.format(service.priceAmount)}</p>
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

			<article className="rounded-xl border border-border bg-card p-6">
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
									<article key={booking.id} className="rounded-lg border border-border bg-background p-4">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div>
												<p className="text-sm text-muted-foreground">#{booking.bookingNumber}</p>
												<p className="font-semibold">{new Date(booking.startsAtUtc).toLocaleString()}</p>
											</div>
											<p className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide">
												{booking.status.replace('_', ' ')}
											</p>
										</div>

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
