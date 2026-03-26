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
	pending_payment: 'border-amber-600/35 bg-amber-100 text-amber-900',
	confirmed: 'border-blue-600/35 bg-blue-100 text-blue-900',
	in_service: 'border-indigo-600/35 bg-indigo-100 text-indigo-900',
	completed: 'border-emerald-600/35 bg-emerald-100 text-emerald-900',
	cancelled: 'border-destructive/40 bg-destructive/15 text-destructive',
	no_show: 'border-slate-600/35 bg-slate-100 text-slate-900',
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

			<div className="section-shell p-5 sm:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="text-3xl font-semibold">My Bookings</h1>
					<p className="mt-2 text-muted-foreground">Track your appointments and manage upcoming bookings.</p>
				</div>

				<div className="surface-soft p-3">
					<p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						Filter by status
					</p>
					<div className="flex gap-2 overflow-x-auto pb-1">
						{FILTER_STATUSES.map((item) => (
							<Button
								key={item.value}
								type="button"
								size="sm"
								className="shrink-0"
								variant={status === item.value ? 'default' : 'outline'}
								onClick={() => {
									setStatus(item.value);
									setPage(1);
								}}
							>
								{item.label}
							</Button>
						))}
					</div>
				</div>
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
								<article key={booking.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<p className="text-sm font-medium text-primary">{booking.serviceName || 'Scheduled service'}</p>
											<h2 className="mt-1 text-lg font-semibold">{appointmentDate}</h2>
											<p className="text-sm text-muted-foreground">
												with {booking.vendorName || 'your selected vendor'} • {duration}
											</p>
										</div>
										<span
											className={`status-chip ${statusChipMap[booking.status]}`}
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
												hour12: true,
											})}
										</p>
										<p>
											<span className="font-medium text-foreground">Ends:</span>{' '}
											{new Date(booking.endsAtUtc).toLocaleTimeString([], {
												hour: 'numeric',
												minute: '2-digit',
												hour12: true,
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
										<Button asChild type="button" variant="ghost" className="px-0 text-primary hover:bg-transparent hover:text-primary/80">
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
