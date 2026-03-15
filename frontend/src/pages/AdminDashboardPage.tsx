import { useQuery } from '@tanstack/react-query';
import {
	Activity,
	ArrowUpRight,
	BadgeDollarSign,
	BriefcaseBusiness,
	CalendarClock,
	RefreshCw,
	ShieldCheck,
	Star,
	Users,
} from 'lucide-react';

import { adminApi } from '@/api/admin.api';
import { HttpError } from '@/api/http';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';

const compactNumberFormatter = new Intl.NumberFormat(undefined, {
	notation: 'compact',
	maximumFractionDigits: 1,
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
	month: 'short',
	day: 'numeric',
	hour: 'numeric',
	minute: '2-digit',
});

const statusToneMap: Record<string, string> = {
	active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
	pending_verification: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
	suspended: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
	confirmed: 'border-blue-500/30 bg-blue-500/10 text-blue-700',
	pending_payment: 'border-amber-500/30 bg-amber-500/10 text-amber-700',
	in_service: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-700',
	completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
	cancelled: 'border-rose-500/30 bg-rose-500/10 text-rose-700',
	no_show: 'border-slate-500/30 bg-slate-500/10 text-slate-700',
};

const formatStatusLabel = (value: string) =>
	value
		.split('_')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');

const MetricCard = ({
	title,
	value,
	description,
	accentClass,
	icon: Icon,
}: {
	title: string;
	value: string | number;
	description: string;
	accentClass: string;
	icon: typeof Users;
}) => (
	<article className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
		<div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${accentClass}`} />
		<div className="flex items-start justify-between gap-4">
			<div>
				<p className="text-sm text-muted-foreground">{title}</p>
				<p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
			</div>
			<div className="rounded-2xl border border-border bg-background/80 p-3 text-muted-foreground">
				<Icon className="h-5 w-5" />
			</div>
		</div>
	</article>
);

const TinyTrendBars = ({ values, colorClass }: { values: number[]; colorClass: string }) => {
	const max = Math.max(...values, 1);

	return (
		<div className="flex h-28 items-end gap-2">
			{values.map((value, index) => (
				<div key={`${index}-${value}`} className="flex flex-1 items-end">
					<div
						className={`w-full rounded-t-xl ${colorClass}`}
						style={{ height: `${Math.max((value / max) * 100, value > 0 ? 10 : 4)}%` }}
					/>
				</div>
			))}
		</div>
	);
};

const AdminDashboardPage = () => {
	const overviewQuery = useQuery({
		queryKey: ['admin', 'overview'],
		queryFn: () => adminApi.getOverview({ days: 14 }),
		retry: false,
		staleTime: 30_000,
	});

	const pendingVendorsQuery = useQuery({
		queryKey: ['admin', 'vendors', 'pending-dashboard'],
		queryFn: () => adminApi.listVendors({ status: 'pending_verification', limit: 4, page: 1 }),
		staleTime: 30_000,
	});

	const recentBookingsQuery = useQuery({
		queryKey: ['admin', 'bookings', 'recent-dashboard'],
		queryFn: () => adminApi.listBookings({ limit: 6, page: 1 }),
		staleTime: 20_000,
	});

	const commissionPlansQuery = useQuery({
		queryKey: ['admin', 'commissions', 'dashboard'],
		queryFn: () => adminApi.listCommissionPlans({ limit: 3, page: 1 }),
		staleTime: 60_000,
	});

	const isUnavailable =
		overviewQuery.isError && overviewQuery.error instanceof HttpError && overviewQuery.error.status === 404;

	const overview = overviewQuery.data;
	const trendRows = overview?.trends || [];
	const latestTrend = trendRows[trendRows.length - 1] || null;
	const pendingVendors = pendingVendorsQuery.data?.items || [];
	const recentBookings = recentBookingsQuery.data?.items || [];
	const commissionPlans = commissionPlansQuery.data?.items || [];
	const bookingTrendValues = trendRows.map((row) => row.bookings);
	const revenueTrendValues = trendRows.map((row) => row.platformRevenue);
	const isLoadingPrimary = overviewQuery.isLoading;

	const refreshAll = () => {
		void Promise.all([
			overviewQuery.refetch(),
			pendingVendorsQuery.refetch(),
			recentBookingsQuery.refetch(),
			commissionPlansQuery.refetch(),
		]);
	};

	return (
		<section className="container mx-auto px-4 py-8 lg:py-12">
			<div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-card sm:p-8 lg:p-10">
				<div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

				<div className="relative flex flex-wrap items-start justify-between gap-6">
					<div className="max-w-3xl">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin Control Tower</p>
						<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
							Track marketplace health, queues, and revenue from one surface
						</h1>
						<p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
							This overview now pulls live operational data from the admin API, including vendor verification backlog,
							recent booking flow, commission settings, and daily platform movement.
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
							<p className="font-medium text-foreground">Last visible trend point</p>
							<p className="mt-1">{latestTrend ? latestTrend.date : 'No trend data yet'}</p>
						</div>
						<Button type="button" variant="outline" className="rounded-full" onClick={refreshAll}>
							<RefreshCw className="h-4 w-4" />
							Refresh data
						</Button>
					</div>
				</div>
			</div>

			<div className="mt-6">
				{isLoadingPrimary ? <PageSkeleton rows={4} className="grid-cols-1 xl:grid-cols-2" /> : null}

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
						<MetricCard
							title="Platform accounts"
							value={compactNumberFormatter.format(overview?.usersTotal || 0)}
							description={`Active ${overview?.usersByStatus?.active || 0} • Suspended ${overview?.usersByStatus?.suspended || 0}`}
							accentClass="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500"
							icon={Users}
						/>
						<MetricCard
							title="Vendor network"
							value={compactNumberFormatter.format(overview?.vendorsTotal || 0)}
							description={`Pending review ${overview?.queues?.vendorsPendingVerification || 0} • Active ${overview?.vendorsByStatus?.active || 0}`}
							accentClass="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500"
							icon={BriefcaseBusiness}
						/>
						<MetricCard
							title="Booking volume"
							value={compactNumberFormatter.format(overview?.bookingsTotal || 0)}
							description={`Pending payment ${overview?.queues?.bookingsPendingPayment || 0} • Confirmed ${overview?.queues?.bookingsConfirmed || 0}`}
							accentClass="bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
							icon={CalendarClock}
						/>
						<MetricCard
							title="Platform revenue"
							value={compactNumberFormatter.format(overview?.financials?.platformRevenueTotal || 0)}
							description={`Payouts ${compactNumberFormatter.format(overview?.financials?.payoutsTotal || 0)} • Avg rating ${(overview?.quality?.averageRating || 0).toFixed(2)}`}
							accentClass="bg-gradient-to-r from-emerald-500 via-lime-500 to-teal-500"
							icon={BadgeDollarSign}
						/>
					</div>

					<div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
						<article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Momentum</p>
									<h2 className="mt-1 text-xl font-semibold">Two-week trend pulse</h2>
								</div>
								<div className="rounded-2xl border border-border bg-background/80 p-3 text-muted-foreground">
									<Activity className="h-5 w-5" />
								</div>
							</div>

							<div className="mt-6 grid gap-5 lg:grid-cols-2">
								<div>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>Bookings by day</span>
										<span>{latestTrend ? latestTrend.bookings : 0} latest</span>
									</div>
									<div className="mt-3 rounded-2xl bg-muted/40 p-4">
										<TinyTrendBars values={bookingTrendValues} colorClass="bg-gradient-to-t from-primary to-primary/50" />
									</div>
								</div>

								<div>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>Platform revenue by day</span>
										<span>{latestTrend ? compactNumberFormatter.format(latestTrend.platformRevenue) : 0} latest</span>
									</div>
									<div className="mt-3 rounded-2xl bg-muted/40 p-4">
										<TinyTrendBars values={revenueTrendValues} colorClass="bg-gradient-to-t from-emerald-500 to-emerald-300" />
									</div>
								</div>
							</div>
						</article>

						<article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Live queues</p>
									<h2 className="mt-1 text-xl font-semibold">What needs attention now</h2>
								</div>
								<div className="rounded-2xl border border-border bg-background/80 p-3 text-muted-foreground">
									<ShieldCheck className="h-5 w-5" />
								</div>
							</div>

							<div className="mt-4 space-y-3 text-sm">
								<div className="rounded-2xl bg-muted/40 px-4 py-3">
									<p className="text-muted-foreground">Users</p>
									<p className="mt-1 font-medium text-foreground">
										Active {overview?.usersByStatus?.active || 0} • Suspended {overview?.usersByStatus?.suspended || 0} • Disabled {overview?.usersByStatus?.disabled || 0}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/40 px-4 py-3">
									<p className="text-muted-foreground">Vendors</p>
									<p className="mt-1 font-medium text-foreground">
										Draft {overview?.vendorsByStatus?.draft || 0} • Pending {overview?.vendorsByStatus?.pending_verification || 0} • Active {overview?.vendorsByStatus?.active || 0}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/40 px-4 py-3">
									<p className="text-muted-foreground">Bookings</p>
									<p className="mt-1 font-medium text-foreground">
										Pending payment {overview?.bookingsByStatus?.pending_payment || 0} • Confirmed {overview?.bookingsByStatus?.confirmed || 0} • In service {overview?.bookingsByStatus?.in_service || 0}
									</p>
								</div>
								<div className="rounded-2xl bg-muted/40 px-4 py-3">
									<p className="text-muted-foreground">Quality</p>
									<p className="mt-1 font-medium text-foreground">
										Published average rating {(overview?.quality?.averageRating || 0).toFixed(2)}
									</p>
								</div>
							</div>
						</article>
					</div>

					<div className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
						<article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Vendor verification queue</p>
									<h2 className="mt-1 text-xl font-semibold">Pending vendors</h2>
								</div>
								<span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
									{pendingVendorsQuery.data?.pagination.total || 0} awaiting review
								</span>
							</div>

							<div className="mt-4 space-y-3">
								{pendingVendorsQuery.isLoading ? (
									<PageSkeleton rows={2} className="grid-cols-1" />
								) : pendingVendors.length > 0 ? (
									pendingVendors.map((vendor) => (
										<div key={vendor.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3">
											<div>
												<p className="font-medium text-foreground">{vendor.displayName}</p>
												<p className="mt-1 text-sm text-muted-foreground">
													{vendor.city || 'Unknown city'} • {vendor.categories.join(', ') || 'No category'}
												</p>
												<p className="mt-1 text-xs text-muted-foreground">
													Owner: {vendor.owner?.fullName || vendor.owner?.email || 'Unknown'}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneMap[vendor.status] || 'border-border bg-muted/50 text-foreground'}`}>
													{formatStatusLabel(vendor.status)}
												</span>
												<ArrowUpRight className="h-4 w-4 text-muted-foreground" />
											</div>
										</div>
									))
								) : (
									<EmptyState title="No vendors waiting" description="The verification queue is currently clear." />
								)}
							</div>
						</article>

						<article className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-sm font-medium text-muted-foreground">Commission controls</p>
									<h2 className="mt-1 text-xl font-semibold">Active fee structure</h2>
								</div>
								<div className="rounded-2xl border border-border bg-background/80 p-3 text-muted-foreground">
									<BadgeDollarSign className="h-5 w-5" />
								</div>
							</div>

							<div className="mt-4 space-y-3">
								{commissionPlansQuery.isLoading ? (
									<PageSkeleton rows={2} className="grid-cols-1" />
								) : commissionPlans.length > 0 ? (
									commissionPlans.map((plan) => (
										<div key={plan.id} className="rounded-2xl border border-border bg-background/70 px-4 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="font-medium text-foreground">{plan.name}</p>
													<p className="mt-1 text-sm text-muted-foreground">
														{plan.type === 'percentage' ? `${plan.value}%` : `${plan.value} ${plan.currency}`} • Code {plan.code}
													</p>
												</div>
												<div className="flex flex-wrap gap-2">
													{plan.isDefault ? (
														<span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
															Default
														</span>
													) : null}
													{!plan.activeTo ? (
														<span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700">
															Active
														</span>
													) : null}
												</div>
											</div>
										</div>
									))
								) : (
									<EmptyState title="No commission plans" description="Create a commission plan to manage platform fee rules." />
								)}
							</div>
						</article>
					</div>

					<article className="mt-4 rounded-[1.75rem] border border-border bg-card p-5 shadow-sm">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Recent booking movement</p>
								<h2 className="mt-1 text-xl font-semibold">Latest appointments across the platform</h2>
							</div>
							<div className="rounded-2xl border border-border bg-background/80 p-3 text-muted-foreground">
								<Star className="h-5 w-5" />
							</div>
						</div>

						<div className="mt-4 overflow-x-auto">
							<table className="w-full min-w-[760px] border-collapse text-sm">
								<thead>
									<tr className="border-b border-border text-left text-muted-foreground">
										<th className="px-2 py-3 font-medium">Booking</th>
										<th className="px-2 py-3 font-medium">Customer</th>
										<th className="px-2 py-3 font-medium">Vendor</th>
										<th className="px-2 py-3 font-medium">Time</th>
										<th className="px-2 py-3 font-medium">Value</th>
										<th className="px-2 py-3 font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{recentBookingsQuery.isLoading ? (
										<tr>
											<td colSpan={6} className="px-2 py-4">
												<PageSkeleton rows={2} className="grid-cols-1" />
											</td>
										</tr>
									) : recentBookings.length > 0 ? (
										recentBookings.map((booking) => (
											<tr key={booking.id} className="border-b border-border/60 align-top">
												<td className="px-2 py-3">
													<p className="font-medium text-foreground">{booking.bookingNumber}</p>
													<p className="mt-1 text-xs text-muted-foreground">{booking.serviceName || 'Service unavailable'}</p>
												</td>
												<td className="px-2 py-3">
													<p className="font-medium text-foreground">{booking.customerName || 'Unknown customer'}</p>
													<p className="mt-1 text-xs text-muted-foreground">{booking.customerEmail || 'No email'}</p>
												</td>
												<td className="px-2 py-3">
													<p className="font-medium text-foreground">{booking.vendorName || 'Unknown vendor'}</p>
												</td>
												<td className="px-2 py-3 text-muted-foreground">
													{dateTimeFormatter.format(new Date(booking.startsAtUtc))}
												</td>
												<td className="px-2 py-3 font-medium text-foreground">
													{booking.pricingSnapshot.servicePriceAmount.toLocaleString()} {booking.pricingSnapshot.currency}
												</td>
												<td className="px-2 py-3">
													<span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusToneMap[booking.status] || 'border-border bg-muted/50 text-foreground'}`}>
														{formatStatusLabel(booking.status)}
													</span>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan={6} className="px-2 py-6">
												<EmptyState title="No bookings found" description="Recent bookings will appear here as activity comes in." />
											</td>
										</tr>
									)}
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
