import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';

import { bookingsApi } from '@/api/bookings.api';
import { HttpError } from '@/api/http';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import Pagination from '@/components/ui/pagination';
import PageSkeleton from '@/components/ui/page-skeleton';
import { useToast } from '@/components/ui/toast';
import type { BookingStatus } from '@/types/booking';

const PAGE_SIZE = 10;
const FILTER_STATUSES: Array<{ label: string; value: BookingStatus | 'all' }> = [
	{ label: 'All', value: 'all' },
	{ label: 'Pending payment', value: 'pending_payment' },
	{ label: 'Confirmed', value: 'confirmed' },
	{ label: 'In service', value: 'in_service' },
	{ label: 'Completed', value: 'completed' },
	{ label: 'Cancelled', value: 'cancelled' },
	{ label: 'No-show', value: 'no_show' },
];

const statusLabelMap: Record<BookingStatus, string> = {
	pending_payment: 'Pending payment',
	confirmed: 'Confirmed',
	in_service: 'In service',
	completed: 'Completed',
	cancelled: 'Cancelled',
	no_show: 'No-show',
};

const statusChipMap: Record<BookingStatus, string> = {
	pending_payment: 'border-amber-500/40 bg-amber-500/10 text-amber-700',
	confirmed: 'border-blue-500/40 bg-blue-500/10 text-blue-700',
	in_service: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-700',
	completed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700',
	cancelled: 'border-destructive/40 bg-destructive/10 text-destructive',
	no_show: 'border-slate-500/40 bg-slate-500/10 text-slate-700',
};

const formatDuration = (startsAtUtc: string, endsAtUtc: string) => {
	const durationMs = new Date(endsAtUtc).getTime() - new Date(startsAtUtc).getTime();
	const minutes = Math.max(Math.round(durationMs / 60000), 0);

	if (minutes >= 60 && minutes % 60 === 0) {
		const hours = minutes / 60;
		return `${hours} hr${hours === 1 ? '' : 's'}`;
	}

	if (minutes > 60) {
		const hours = Math.floor(minutes / 60);
		const remainder = minutes % 60;
		return `${hours} hr ${remainder} min`;
	}

	return `${minutes} min`;
};

const CustomerBookingsPage = () => {
	const navigate = useNavigate();
	const [status, setStatus] = useState<BookingStatus | 'all'>('all');
	const [page, setPage] = useState(1);
	const queryClient = useQueryClient();
	const { push } = useToast();

	const bookingsQuery = useQuery({
		queryKey: ['bookings', { status, page }],
		queryFn: () =>
			bookingsApi.list({
				status: status === 'all' ? undefined : status,
				page,
				limit: PAGE_SIZE,
			}),
		staleTime: 20_000,
	});

	const cancelMutation = useMutation({
		mutationFn: ({ bookingId, reasonText }: { bookingId: string; reasonText?: string }) =>
			bookingsApi.cancel(bookingId, { reasonCode: 'user_request', reasonText }),
		onSuccess: () => {
			push('Booking cancelled successfully.', 'success');
			void queryClient.invalidateQueries({ queryKey: ['bookings'] });
		},
		onError: (error) => {
			const message = error instanceof HttpError ? error.message : 'Unable to cancel booking.';
			push(message, 'error');
		},
	});

	const hasItems = Boolean(bookingsQuery.data && bookingsQuery.data.items.length > 0);

	const currencyFormatter = useMemo(
		() =>
			new Intl.NumberFormat(undefined, {
				style: 'currency',
				currency: bookingsQuery.data?.items[0]?.pricingSnapshot.currency || 'USD',
				maximumFractionDigits: 2,
			}),
		[bookingsQuery.data]
	);

	const dateFormatter = useMemo(
		() =>
			new Intl.DateTimeFormat(undefined, {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			}),
		[]
	);

	return (
		<section className="container mx-auto px-4 py-14">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-semibold">My Bookings</h1>
					<p className="mt-2 text-muted-foreground">Track your appointments and manage upcoming bookings.</p>
				</div>

				<div>
					<label htmlFor="statusFilter" className="mb-1 block text-sm font-medium">
						Filter by status
					</label>
					<select
						id="statusFilter"
						className="h-10 rounded-md border border-border bg-background px-3 text-sm"
						value={status}
						onChange={(event) => {
							setStatus(event.target.value as BookingStatus | 'all');
							setPage(1);
						}}
					>
						{FILTER_STATUSES.map((item) => (
							<option key={item.value} value={item.value}>
								{item.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="mt-6">
				{bookingsQuery.isLoading ? <PageSkeleton rows={6} className="grid-cols-1" /> : null}

				{bookingsQuery.isError ? (
					<ErrorState
						description={
							bookingsQuery.error instanceof Error
								? bookingsQuery.error.message
								: 'Unable to load bookings.'
						}
						actionLabel="Retry"
						onAction={() => {
							void bookingsQuery.refetch();
						}}
					/>
				) : null}

				{!bookingsQuery.isLoading && !bookingsQuery.isError && !hasItems ? (
					<EmptyState
						title="No bookings yet"
						description="Once you book a service, your appointment history will appear here."
						actionLabel="Browse vendors"
						onAction={() => {
							navigate('/vendors');
						}}
					/>
				) : null}

				{hasItems ? (
					<div className="space-y-3">
						{bookingsQuery.data?.items.map((booking) => {
							const canCancel = booking.status === 'pending_payment' || booking.status === 'confirmed';
							const appointmentDate = dateFormatter.format(new Date(booking.startsAtUtc));
							const duration = formatDuration(booking.startsAtUtc, booking.endsAtUtc);

							return (
								<article key={booking.id} className="rounded-xl border border-border bg-card p-5">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p className="text-sm font-medium text-primary">{booking.serviceName || 'Scheduled service'}</p>
											<h2 className="mt-1 text-lg font-semibold">{appointmentDate}</h2>
											<p className="text-sm text-muted-foreground">
												with {booking.vendorName || 'your selected vendor'} • {duration}
											</p>
										</div>
										<span
											className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusChipMap[booking.status]}`}
										>
											{statusLabelMap[booking.status]}
										</span>
									</div>

									<div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
										<p>
											<span className="font-medium text-foreground">Starts:</span>{' '}
											{new Date(booking.startsAtUtc).toLocaleTimeString([], {
												hour: 'numeric',
												minute: '2-digit',
											})}
										</p>
										<p>
											<span className="font-medium text-foreground">Ends:</span>{' '}
											{new Date(booking.endsAtUtc).toLocaleTimeString([], {
												hour: 'numeric',
												minute: '2-digit',
											})}
										</p>
										<p>
											<span className="font-medium text-foreground">Price:</span>{' '}
											{currencyFormatter.format(booking.pricingSnapshot.servicePriceAmount)}
										</p>
									</div>

									<div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-sm">
										<p className="text-muted-foreground">
											{booking.vendorName ? `Booked with ${booking.vendorName}` : 'Vendor details available on profile'}
										</p>
										<Button asChild type="button" variant="ghost" className="px-0 text-primary hover:bg-transparent hover:text-gray-500">
											<Link to={`/vendor/${booking.vendorId}`}>View vendor profile</Link>
										</Button>
									</div>

									{booking.customerNotes ? (
										<p className="mt-2 rounded-md bg-muted p-2 text-sm text-muted-foreground">
											{booking.customerNotes}
										</p>
									) : null}

									{canCancel ? (
										<div className="mt-3 flex justify-end">
											<Button
												type="button"
												variant="outline"
												loading={cancelMutation.isPending}
												loadingText="Cancelling..."
												onClick={() => {
													void cancelMutation.mutateAsync({
														bookingId: booking.id,
														reasonText: 'Cancelled by customer from bookings page',
													});
												}}
											>
												Cancel booking
											</Button>
										</div>
									) : null}
								</article>
							);
						})}

						<Pagination
							page={bookingsQuery.data?.pagination.page || 1}
							totalPages={bookingsQuery.data?.pagination.totalPages || 1}
							onPageChange={setPage}
							className="mt-6"
						/>
					</div>
				) : null}
			</div>
		</section>
	);
};

export default CustomerBookingsPage;
