import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';

import { vendorsApi } from '@/api/vendors.api';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 9;

const VendorsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const city = searchParams.get('city') || '';
	const category = searchParams.get('category') || '';
	const page = Math.max(Number(searchParams.get('page') || '1') || 1, 1);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['vendors', { city, category, page }],
		queryFn: () =>
			vendorsApi.list({
				city: city || undefined,
				category: category || undefined,
				page,
				limit: PAGE_SIZE,
			}),
		staleTime: 60_000,
	});

	const handleFilterSubmit = (formData: FormData) => {
		const nextCity = String(formData.get('city') || '').trim();
		const nextCategory = String(formData.get('category') || '').trim();

		const nextParams = new URLSearchParams();
		if (nextCity) {
			nextParams.set('city', nextCity);
		}
		if (nextCategory) {
			nextParams.set('category', nextCategory);
		}
		nextParams.set('page', '1');

		setSearchParams(nextParams);
	};

	const setPage = (nextPage: number) => {
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set('page', String(nextPage));
		setSearchParams(nextParams);
	};

	return (
		<section className="container mx-auto px-4 py-14">
			<h1 className="text-3xl font-semibold">Vendors</h1>
			<p className="mt-2 text-muted-foreground">
				Find top-rated providers and book services that fit your schedule.
			</p>

			<form
				className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-[1fr_1fr_auto]"
				onSubmit={(event) => {
					event.preventDefault();
					handleFilterSubmit(new FormData(event.currentTarget));
				}}
			>
				<input
					type="text"
					name="city"
					defaultValue={city}
					placeholder="City (e.g. Addis Ababa)"
					className="h-10 rounded-md border border-border bg-background px-3 text-sm"
				/>
				<input
					type="text"
					name="category"
					defaultValue={category}
					placeholder="Category (e.g. Beauty)"
					className="h-10 rounded-md border border-border bg-background px-3 text-sm"
				/>
				<Button type="submit" className="h-10">
					Apply Filters
				</Button>
			</form>

			<div className="mt-6">
				{isLoading ? <PageSkeleton rows={6} /> : null}

				{isError ? (
					<ErrorState
						description={error instanceof Error ? error.message : 'Unable to load vendors.'}
						actionLabel="Retry"
						onAction={() => {
							void refetch();
						}}
					/>
				) : null}

				{!isLoading && !isError && data && data.items.length === 0 ? (
					<EmptyState
						title="No vendors found"
						description="Try a different city or category to broaden your results."
						actionLabel="Clear filters"
						onAction={() => setSearchParams({ page: '1' })}
					/>
				) : null}

				{!isLoading && !isError && data && data.items.length > 0 ? (
					<>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{data.items.map((vendor) => (
								<article key={vendor.id} className="rounded-xl border border-border bg-card p-5">
									<p className="text-xs font-semibold uppercase tracking-wide text-primary">
										{vendor.categories[0] || 'General'}
									</p>
									<h2 className="mt-2 text-lg font-semibold">{vendor.displayName}</h2>
									<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
										{vendor.description || 'Professional services available for booking.'}
									</p>
									<div className="mt-4 flex items-center justify-between text-sm">
										<span className="text-muted-foreground">{vendor.location.city}</span>
										<span className="font-medium">
											{vendor.averageRating.toFixed(1)} ({vendor.reviewCount})
										</span>
									</div>
									<Button asChild variant="outline" className="mt-4 w-full">
										<Link to={`/vendor/${vendor.id}`}>View Profile</Link>
									</Button>
								</article>
							))}
						</div>

						<div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card p-4">
							<Button
								type="button"
								variant="outline"
								disabled={data.pagination.page <= 1}
								onClick={() => setPage(data.pagination.page - 1)}
							>
								Previous
							</Button>
							<p className="text-sm text-muted-foreground">
								Page {data.pagination.page} of {data.pagination.totalPages}
							</p>
							<Button
								type="button"
								variant="outline"
								disabled={data.pagination.page >= data.pagination.totalPages}
								onClick={() => setPage(data.pagination.page + 1)}
							>
								Next
							</Button>
						</div>
					</>
				) : null}
			</div>
		</section>
	);
};

export default VendorsPage;
