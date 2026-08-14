import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	Activity,
	ArrowUpRight,
	BadgeDollarSign,
	BriefcaseBusiness,
	CalendarClock,
	RefreshCw,
	Search,
	ShieldCheck,
	Star,
	Users,
} from 'lucide-react';

import { adminApi } from '@/api/admin.api';
import { HttpError } from '@/api/http';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import PageSkeleton from '@/components/ui/page-skeleton';
import { useToast } from '@/components/ui/toast';

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

type AdminSection = 'overview' | 'vendors' | 'users';
type VendorAction = 'approve' | 'reject' | 'suspend' | 'reactivate';
type UserAction = 'suspend' | 'reactivate';

const sectionLabelMap: Record<AdminSection, string> = {
	overview: 'Overview',
	vendors: 'Vendors Queue',
	users: 'Users Queue',
};

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
	const { push } = useToast();
	const queryClient = useQueryClient();
	const [activeSection, setActiveSection] = useState<AdminSection>('overview');

	const [vendorPage, setVendorPage] = useState(1);
	const [vendorStatus, setVendorStatus] = useState<string>('pending_verification');
	const [vendorSearchInput, setVendorSearchInput] = useState('');
	const [vendorSearch, setVendorSearch] = useState('');

	const [userPage, setUserPage] = useState(1);
	const [userStatus, setUserStatus] = useState<string>('all');
	const [userRole, setUserRole] = useState<string>('all');
	const [userSearchInput, setUserSearchInput] = useState('');
	const [userSearch, setUserSearch] = useState('');

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

	const vendorsQueueQuery = useQuery({
		queryKey: ['admin', 'vendors', 'queue', { vendorPage, vendorStatus, vendorSearch }],
		queryFn: () =>
			adminApi.listVendors({
				page: vendorPage,
				limit: 10,
				status: vendorStatus === 'all' ? undefined : vendorStatus,
				search: vendorSearch || undefined,
			}),
		staleTime: 20_000,
	});

	const usersQueueQuery = useQuery({
		queryKey: ['admin', 'users', 'queue', { userPage, userStatus, userRole, userSearch }],
		queryFn: () =>
			adminApi.listUsers({
				page: userPage,
				limit: 10,
				status: userStatus === 'all' ? undefined : userStatus,
				role: userRole === 'all' ? undefined : userRole,
				search: userSearch || undefined,
			}),
		staleTime: 20_000,
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

	const vendorActionMutation = useMutation({
		mutationFn: async ({ vendorId, action }: { vendorId: string; action: VendorAction }) => {
			if (action === 'approve') {
				return adminApi.approveVendor(vendorId);
			}

			if (action === 'reject') {
				return adminApi.rejectVendor(vendorId);
			}

			if (action === 'suspend') {
				return adminApi.suspendVendor(vendorId);
			}

			return adminApi.reactivateVendor(vendorId);
		},
		onSuccess: (_, variables) => {
			push(`Vendor ${formatStatusLabel(variables.action)}d successfully.`, 'success');
			void queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
			void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
		},
		onError: (error) => {
			push(error instanceof Error ? error.message : 'Unable to update vendor status.', 'error');
		},
	});

	const userActionMutation = useMutation({
		mutationFn: async ({ userId, action }: { userId: string; action: UserAction }) => {
			if (action === 'suspend') {
				return adminApi.suspendUser(userId);
			}

			return adminApi.reactivateUser(userId);
		},
		onSuccess: (_, variables) => {
			push(`User ${formatStatusLabel(variables.action)}d successfully.`, 'success');
			void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
			void queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
		},
		onError: (error) => {
			push(error instanceof Error ? error.message : 'Unable to update user status.', 'error');
		},
	});

	const vendorMutationKey = vendorActionMutation.variables
		? `${vendorActionMutation.variables.vendorId}:${vendorActionMutation.variables.action}`
		: '';
	const userMutationKey = userActionMutation.variables
		? `${userActionMutation.variables.userId}:${userActionMutation.variables.action}`
		: '';

	const vendorActionsByStatus = useMemo(
		() => ({
			pending_verification: [
				{ action: 'approve' as const, label: 'Approve', variant: 'default' as const },
				{ action: 'reject' as const, label: 'Reject', variant: 'outline' as const },
			],
			active: [{ action: 'suspend' as const, label: 'Suspend', variant: 'outline' as const }],
			suspended: [{ action: 'reactivate' as const, label: 'Reactivate', variant: 'default' as const }],
			draft: [
				{ action: 'approve' as const, label: 'Activate', variant: 'default' as const },
				{ action: 'suspend' as const, label: 'Suspend', variant: 'outline' as const },
			],
		}),
		[]
	);

	const refreshAll = () => {
		void Promise.all([
			overviewQuery.refetch(),
			pendingVendorsQuery.refetch(),
			recentBookingsQuery.refetch(),
			commissionPlansQuery.refetch(),
		]);
	};

	const runVendorAction = (vendorId: string, vendorName: string, action: VendorAction) => {
		const confirmed = window.confirm(`Are you sure you want to ${action} ${vendorName}?`);
		if (!confirmed) {
			return;
		}

		void vendorActionMutation.mutateAsync({ vendorId, action });
	};

	const runUserAction = (userId: string, displayName: string, action: UserAction) => {
		const confirmed = window.confirm(`Are you sure you want to ${action} ${displayName}?`);
		if (!confirmed) {
			return;
		}

		void userActionMutation.mutateAsync({ userId, action });
	};

	const renderOverviewSection = () => (
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
				<article className="section-shell p-5">
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

				<article className="section-shell p-5">
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
				<article className="section-shell p-5">
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
										<span className={`status-chip ${statusToneMap[vendor.status] || 'border-border bg-muted/50 text-foreground'}`}>
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

				<article className="section-shell p-5">
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

			<article className="section-shell mt-4 p-5">
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
											<span className={`status-chip ${statusToneMap[booking.status] || 'border-border bg-muted/50 text-foreground'}`}>
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
	);

	const renderVendorsQueueSection = () => {
		const vendorItems = vendorsQueueQuery.data?.items || [];
		const pagination = vendorsQueueQuery.data?.pagination;

		return (
			<article className="section-shell p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-sm font-medium text-muted-foreground">Queue operations</p>
						<h2 className="mt-1 text-xl font-semibold">Vendor moderation queue</h2>
					</div>
					<Button type="button" variant="outline" onClick={() => void vendorsQueueQuery.refetch()}>
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>
				</div>

				<form
					className="mt-4 grid gap-3 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-[1fr_auto_auto]"
					onSubmit={(event) => {
						event.preventDefault();
						setVendorSearch(vendorSearchInput.trim());
						setVendorPage(1);
					}}
				>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by display or legal name"
							className="pl-9"
							value={vendorSearchInput}
							onChange={(event) => setVendorSearchInput(event.target.value)}
						/>
					</div>
					<select
						className="h-11 rounded-xl border border-border bg-background px-3 text-sm shadow-sm"
						value={vendorStatus}
						onChange={(event) => {
							setVendorStatus(event.target.value);
							setVendorPage(1);
						}}
					>
						<option value="pending_verification">Pending verification</option>
						<option value="active">Active</option>
						<option value="suspended">Suspended</option>
						<option value="draft">Draft</option>
						<option value="all">All statuses</option>
					</select>
					<div className="flex w-full items-center gap-2 md:w-auto">
						<Button type="submit" className="flex-1 md:flex-none">Apply</Button>
						<Button
							type="button"
							variant="ghost"
							className="flex-1 md:flex-none"
							onClick={() => {
								setVendorSearchInput('');
								setVendorSearch('');
								setVendorStatus('pending_verification');
								setVendorPage(1);
							}}
						>
							Reset
						</Button>
					</div>
				</form>
				<p className="mt-2 text-xs text-muted-foreground">On smaller screens, swipe the table horizontally to view all columns.</p>

				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[860px] border-collapse text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="px-2 py-3 font-medium">Vendor</th>
								<th className="px-2 py-3 font-medium">Owner</th>
								<th className="px-2 py-3 font-medium">Location</th>
								<th className="px-2 py-3 font-medium">Status</th>
								<th className="px-2 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{vendorsQueueQuery.isLoading ? (
								<tr>
									<td colSpan={5} className="px-2 py-4">
										<PageSkeleton rows={3} className="grid-cols-1" />
									</td>
								</tr>
							) : vendorsQueueQuery.isError ? (
								<tr>
									<td colSpan={5} className="px-2 py-6">
										<ErrorState
											description={vendorsQueueQuery.error instanceof Error ? vendorsQueueQuery.error.message : 'Unable to load vendors queue.'}
											actionLabel="Retry"
											onAction={() => {
												void vendorsQueueQuery.refetch();
											}}
										/>
									</td>
								</tr>
							) : vendorItems.length > 0 ? (
								vendorItems.map((vendor) => (
									<tr key={vendor.id} className="border-b border-border/60 align-top">
										<td className="px-2 py-3">
											<p className="font-medium text-foreground">{vendor.displayName}</p>
											<p className="mt-1 text-xs text-muted-foreground">{vendor.legalBusinessName || 'No legal business name'}</p>
											<p className="mt-1 text-xs text-muted-foreground">Categories: {vendor.categories.join(', ') || 'None'}</p>
										</td>
										<td className="px-2 py-3">
											<p className="font-medium text-foreground">{vendor.owner?.fullName || 'Unknown owner'}</p>
											<p className="mt-1 text-xs text-muted-foreground">{vendor.owner?.email || 'No email'}</p>
										</td>
										<td className="px-2 py-3 text-muted-foreground">
											{vendor.city || 'Unknown city'} {vendor.countryCode ? `(${vendor.countryCode})` : ''}
										</td>
										<td className="px-2 py-3">
											<span className={`status-chip ${statusToneMap[vendor.status] || 'border-border bg-muted/50 text-foreground'}`}>
												{formatStatusLabel(vendor.status)}
											</span>
										</td>
										<td className="px-2 py-3">
											<div className="flex flex-wrap gap-2">
												{(vendorActionsByStatus[vendor.status as keyof typeof vendorActionsByStatus] || []).map((item) => {
													const key = `${vendor.id}:${item.action}`;
													return (
														<Button
															key={item.action}
															type="button"
															variant={item.variant}
															size="sm"
															loading={vendorActionMutation.isPending && vendorMutationKey === key}
															loadingText={`${item.label}...`}
															onClick={() => runVendorAction(vendor.id, vendor.displayName, item.action)}
														>
															{item.label}
														</Button>
													);
												})}
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={5} className="px-2 py-6">
										<EmptyState title="No vendors in queue" description="Try broadening filters or switch status." />
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{pagination ? (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={setVendorPage}
						className="mt-4"
					/>
				) : null}
			</article>
		);
	};

	const renderUsersQueueSection = () => {
		const userItems = usersQueueQuery.data?.items || [];
		const pagination = usersQueueQuery.data?.pagination;

		return (
			<article className="section-shell p-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-sm font-medium text-muted-foreground">Queue operations</p>
						<h2 className="mt-1 text-xl font-semibold">User management queue</h2>
					</div>
					<Button type="button" variant="outline" onClick={() => void usersQueueQuery.refetch()}>
						<RefreshCw className="h-4 w-4" />
						Refresh
					</Button>
				</div>

				<form
					className="mt-4 grid gap-3 rounded-2xl border border-border bg-background/70 p-4 md:grid-cols-[1fr_auto_auto_auto]"
					onSubmit={(event) => {
						event.preventDefault();
						setUserSearch(userSearchInput.trim());
						setUserPage(1);
					}}
				>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by name or email"
							className="pl-9"
							value={userSearchInput}
							onChange={(event) => setUserSearchInput(event.target.value)}
						/>
					</div>
					<select
						className="h-11 rounded-xl border border-border bg-background px-3 text-sm shadow-sm"
						value={userRole}
						onChange={(event) => {
							setUserRole(event.target.value);
							setUserPage(1);
						}}
					>
						<option value="all">All roles</option>
						<option value="customer">Customer</option>
						<option value="vendor_owner">Vendor owner</option>
						<option value="vendor_staff">Vendor staff</option>
						<option value="admin">Admin</option>
					</select>
					<select
						className="h-11 rounded-xl border border-border bg-background px-3 text-sm shadow-sm"
						value={userStatus}
						onChange={(event) => {
							setUserStatus(event.target.value);
							setUserPage(1);
						}}
					>
						<option value="all">All statuses</option>
						<option value="active">Active</option>
						<option value="suspended">Suspended</option>
						<option value="disabled">Disabled</option>
					</select>
					<div className="flex w-full items-center gap-2 md:w-auto">
						<Button type="submit" className="flex-1 md:flex-none">Apply</Button>
						<Button
							type="button"
							variant="ghost"
							className="flex-1 md:flex-none"
							onClick={() => {
								setUserSearchInput('');
								setUserSearch('');
								setUserRole('all');
								setUserStatus('all');
								setUserPage(1);
							}}
						>
							Reset
						</Button>
					</div>
				</form>
				<p className="mt-2 text-xs text-muted-foreground">On smaller screens, swipe the table horizontally to view all columns.</p>

				<div className="mt-4 overflow-x-auto">
					<table className="w-full min-w-[860px] border-collapse text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="px-2 py-3 font-medium">User</th>
								<th className="px-2 py-3 font-medium">Role</th>
								<th className="px-2 py-3 font-medium">Status</th>
								<th className="px-2 py-3 font-medium">Provider</th>
								<th className="px-2 py-3 font-medium">Last login</th>
								<th className="px-2 py-3 font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{usersQueueQuery.isLoading ? (
								<tr>
									<td colSpan={6} className="px-2 py-4">
										<PageSkeleton rows={3} className="grid-cols-1" />
									</td>
								</tr>
							) : usersQueueQuery.isError ? (
								<tr>
									<td colSpan={6} className="px-2 py-6">
										<ErrorState
											description={usersQueueQuery.error instanceof Error ? usersQueueQuery.error.message : 'Unable to load users queue.'}
											actionLabel="Retry"
											onAction={() => {
												void usersQueueQuery.refetch();
											}}
										/>
									</td>
								</tr>
							) : userItems.length > 0 ? (
								userItems.map((user) => {
									const displayName = user.fullName || user.email;
									const isProtectedAdmin = user.role === 'admin';
									const canSuspend = user.status === 'active' && !isProtectedAdmin;
									const canReactivate = user.status === 'suspended' && !isProtectedAdmin;

									return (
										<tr key={user.id} className="border-b border-border/60 align-top">
											<td className="px-2 py-3">
												<p className="font-medium text-foreground">{displayName}</p>
												<p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
											</td>
											<td className="px-2 py-3 text-muted-foreground">{formatStatusLabel(user.role)}</td>
											<td className="px-2 py-3">
												<span className={`status-chip ${statusToneMap[user.status] || 'border-border bg-muted/50 text-foreground'}`}>
													{formatStatusLabel(user.status)}
												</span>
											</td>
											<td className="px-2 py-3 text-muted-foreground">{formatStatusLabel(user.provider)}</td>
											<td className="px-2 py-3 text-muted-foreground">
												{user.lastLoginAt ? dateTimeFormatter.format(new Date(user.lastLoginAt)) : 'Never logged in'}
											</td>
											<td className="px-2 py-3">
												<div className="flex flex-wrap gap-2">
													{canSuspend ? (
														<Button
															type="button"
															variant="outline"
															size="sm"
															loading={userActionMutation.isPending && userMutationKey === `${user.id}:suspend`}
															loadingText="Suspending..."
															onClick={() => runUserAction(user.id, displayName, 'suspend')}
														>
															Suspend
														</Button>
													) : null}
													{canReactivate ? (
														<Button
															type="button"
															size="sm"
															loading={userActionMutation.isPending && userMutationKey === `${user.id}:reactivate`}
															loadingText="Reactivating..."
															onClick={() => runUserAction(user.id, displayName, 'reactivate')}
														>
															Reactivate
														</Button>
													) : null}
													{isProtectedAdmin ? (
														<span className="status-chip border-border bg-muted/50 text-muted-foreground">
															Protected
														</span>
													) : null}
												</div>
											</td>
										</tr>
									);
								})
							) : (
								<tr>
									<td colSpan={6} className="px-2 py-6">
										<EmptyState title="No users found" description="Try different filters or search terms." />
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				{pagination ? (
					<Pagination
						page={pagination.page}
						totalPages={pagination.totalPages}
						onPageChange={setUserPage}
						className="mt-4"
					/>
				) : null}
			</article>
		);
	};

	return (
		<section className="container mx-auto px-4 py-8 lg:py-12">
			<BackButton className="mb-4" fallbackTo="/" />

			<div className="section-shell p-6 sm:p-8 lg:p-10">
				<div className="flex flex-wrap items-start justify-between gap-6">
					<div className="max-w-3xl">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Admin Control Tower</p>
						<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
							{activeSection === 'overview' ? 'Track marketplace health, queues, and revenue' : 'Manage queue operations with moderation actions'}
						</h1>
						<p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
							Use sectioned admin views to switch between oversight and action queues. All lists and controls are powered by live admin APIs.
						</p>
						<div className="mt-5 flex flex-wrap gap-2">
							{(['overview', 'vendors', 'users'] as AdminSection[]).map((section) => (
								<Button
									key={section}
									type="button"
									variant={activeSection === section ? 'default' : 'outline'}
									size="sm"
									className="rounded-full"
									onClick={() => setActiveSection(section)}
								>
									{sectionLabelMap[section]}
								</Button>
							))}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-3">
						<div className="rounded-2xl border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
							<p className="font-medium text-foreground">Active section</p>
							<p className="mt-1">{sectionLabelMap[activeSection]}</p>
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

				{overviewQuery.isSuccess
					? activeSection === 'overview'
						? renderOverviewSection()
						: null
					: null}
				{activeSection === 'vendors' ? renderVendorsQueueSection() : null}
				{activeSection === 'users' ? renderUsersQueueSection() : null}
			</div>
		</section>
	);
};

export default AdminDashboardPage;
