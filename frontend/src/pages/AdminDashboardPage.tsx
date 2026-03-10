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

	return (
		<section className="container mx-auto px-4 py-14">
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
					<div className="grid gap-4 md:grid-cols-3">
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total users</p>
							<p className="mt-2 text-3xl font-semibold">{overviewQuery.data.usersTotal}</p>
						</article>
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total vendors</p>
							<p className="mt-2 text-3xl font-semibold">{overviewQuery.data.vendorsTotal}</p>
						</article>
						<article className="rounded-xl border border-border bg-card p-5">
							<p className="text-sm text-muted-foreground">Total bookings</p>
							<p className="mt-2 text-3xl font-semibold">{overviewQuery.data.bookingsTotal}</p>
						</article>
					</div>
				) : null}
			</div>
		</section>
	);
};

export default AdminDashboardPage;
