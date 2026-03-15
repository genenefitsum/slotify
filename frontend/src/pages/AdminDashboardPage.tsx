import { useQuery } from '@tanstack/react-query';

import { adminApi } from '@/api/admin.api';
import { HttpError } from '@/api/http';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';

const AdminDashboardPage = () => {
	const overviewQuery = useQuery({
		queryKey: ['admin', 'overview'],
		queryFn: () => adminApi.getOverview(),
		retry: false,
	});

	const isUnavailable =
		overviewQuery.isError && overviewQuery.error instanceof HttpError && overviewQuery.error.status === 404;

	const overview = overviewQuery.data;
	const trendRows = overview?.trends || [];
	const latestTrend = trendRows[trendRows.length - 1] || null;

	return (
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<h1 className="text-3xl font-semibold">Admin Dashboard</h1>
			<p className="mt-2 text-muted-foreground">
				Monitor platform activity and growth metrics from a single admin overview.
			</p>

			<div className="mt-6">
				{overviewQuery.isLoading ? <PageSkeleton rows={3} className="grid-cols-1" /> : null}

				{isUnavailable ? (
					<EmptyState
						title="Overview endpoint unavailable"
						description="Admin overview is not exposed by the current backend runtime yet."
					/>
				) : null}

				{overviewQuery.isError && !isUnavailable ? (
					<ErrorState
						description={
							overviewQuery.error instanceof Error
								? overviewQuery.error.message
								: 'Unable to load admin overview.'
						}
						actionLabel="Retry"
						onAction={() => {
							void overviewQuery.refetch();
						}}
					/>
				) : null}

				{overviewQuery.isSuccess ? (
					<>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total users</p>
							<p className="mt-2 text-3xl font-semibold">{overview?.usersTotal}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Active: {overview?.usersByStatus?.active || 0} • Suspended: {overview?.usersByStatus?.suspended || 0}
							</p>
						</article>
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total vendors</p>
							<p className="mt-2 text-3xl font-semibold">{overview?.vendorsTotal}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Pending verification: {overview?.queues?.vendorsPendingVerification || 0}
							</p>
						</article>
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total bookings</p>
							<p className="mt-2 text-3xl font-semibold">{overview?.bookingsTotal}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Pending payment: {overview?.queues?.bookingsPendingPayment || 0} • Confirmed: {overview?.queues?.bookingsConfirmed || 0}
							</p>
						</article>
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Platform revenue</p>
							<p className="mt-2 text-3xl font-semibold">
								{(overview?.financials?.platformRevenueTotal || 0).toLocaleString()}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">Payouts: {(overview?.financials?.payoutsTotal || 0).toLocaleString()}</p>
						</article>
					</div>

					<div className="mt-4 grid gap-4 lg:grid-cols-2">
						<article className="rounded-xl border border-border bg-card p-5">
							<h2 className="text-lg font-semibold">Operational queue</h2>
							<div className="mt-3 grid gap-2 text-sm text-muted-foreground">
								<p>Vendors awaiting verification: <span className="font-semibold text-foreground">{overview?.queues?.vendorsPendingVerification || 0}</span></p>
								<p>Bookings pending payment: <span className="font-semibold text-foreground">{overview?.queues?.bookingsPendingPayment || 0}</span></p>
								<p>Bookings confirmed: <span className="font-semibold text-foreground">{overview?.queues?.bookingsConfirmed || 0}</span></p>
								<p>Published average rating: <span className="font-semibold text-foreground">{(overview?.quality?.averageRating || 0).toFixed(2)}</span></p>
							</div>
						</article>

						<article className="rounded-xl border border-border bg-card p-5">
							<h2 className="text-lg font-semibold">Status snapshot</h2>
							<div className="mt-3 space-y-2 text-sm text-muted-foreground">
								<p>
									Users: active {overview?.usersByStatus?.active || 0}, suspended {overview?.usersByStatus?.suspended || 0}, disabled {overview?.usersByStatus?.disabled || 0}
								</p>
								<p>
									Vendors: draft {overview?.vendorsByStatus?.draft || 0}, pending {overview?.vendorsByStatus?.pending_verification || 0}, active {overview?.vendorsByStatus?.active || 0}, suspended {overview?.vendorsByStatus?.suspended || 0}
								</p>
								<p>
									Bookings: pending payment {overview?.bookingsByStatus?.pending_payment || 0}, confirmed {overview?.bookingsByStatus?.confirmed || 0}, in service {overview?.bookingsByStatus?.in_service || 0}, completed {overview?.bookingsByStatus?.completed || 0}
								</p>
							</div>
						</article>
					</div>

					<article className="mt-4 rounded-xl border border-border bg-card p-5">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<h2 className="text-lg font-semibold">Daily trend (last {trendRows.length || 0} days)</h2>
							{latestTrend ? (
								<p className="text-sm text-muted-foreground">
									Latest: {latestTrend.date} • Bookings {latestTrend.bookings} • Completed {latestTrend.completedBookings} • Revenue {latestTrend.platformRevenue.toLocaleString()}
								</p>
							) : null}
						</div>

						<div className="mt-3 overflow-x-auto">
							<table className="w-full min-w-[640px] border-collapse text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-2 font-medium">Date</th>
										<th className="px-2 py-2 font-medium">Bookings</th>
										<th className="px-2 py-2 font-medium">Completed</th>
										<th className="px-2 py-2 font-medium">Platform Revenue</th>
									</tr>
								</thead>
								<tbody>
									{trendRows.map((row) => (
										<tr key={row.date} className="border-b border-border/60">
											<td className="px-2 py-2">{row.date}</td>
											<td className="px-2 py-2">{row.bookings}</td>
											<td className="px-2 py-2">{row.completedBookings}</td>
											<td className="px-2 py-2">{row.platformRevenue.toLocaleString()}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</article>
					</>
				) : null}
			</div>
		</section>
	);
};

export default AdminDashboardPage;
