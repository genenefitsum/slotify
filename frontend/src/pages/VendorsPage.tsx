import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { vendorsApi } from '@/api/vendors.api';
import VendorCard from '@/components/main/VendorCard';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 6;

const VendorsPage = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const city = searchParams.get('city') || '';
	const category = searchParams.get('category') || '';
	const showAll = searchParams.get('view') === 'all';

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: ['vendors', { city, category, showAll }],
		queryFn: () =>
			vendorsApi.list({
				city: city || undefined,
				category: category || undefined,
				limit: PAGE_SIZE,
				all: showAll,
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
		if (showAll) {
			nextParams.set('view', 'all');
		}

		setSearchParams(nextParams);
	};

	const setShowAll = (nextValue: boolean) => {
		const nextParams = new URLSearchParams(searchParams);
		if (nextValue) {
			nextParams.set('view', 'all');
		} else {
			nextParams.delete('view');
		}
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
						onAction={() => setSearchParams(showAll ? { view: 'all' } : {})}
					/>
				) : null}

				{!isLoading && !isError && data && data.items.length > 0 ? (
					<>
						<div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
							<p className="text-muted-foreground">
								Showing <span className="font-semibold text-foreground">{data.items.length}</span> of <span className="font-semibold text-foreground">{data.pagination.total}</span> vendors
								{city ? <span> in <span className="font-semibold text-foreground">{city}</span></span> : null}
								{category ? <span> for <span className="font-semibold text-foreground">{category}</span></span> : null}
							</p>
							<p className="text-muted-foreground">Choose a profile to review services and availability.</p>
						</div>

						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.items.map((vendor) => (
								<VendorCard
									key={vendor.id}
									id={vendor.id}
									name={vendor.displayName}
									image={vendor.imageUrl || undefined}
									category={vendor.categories[0] || 'General'}
									rating={vendor.averageRating}
									reviews={vendor.reviewCount}
									price={vendor.startingPrice || undefined}
									location={vendor.location.city}
								/>
							))}
						</div>

						{!showAll && data.pagination.total > data.items.length ? (
							<div className="mt-6 flex justify-center rounded-xl border border-border bg-card p-4">
								<Button type="button" variant="outline" onClick={() => setShowAll(true)}>
									View more
								</Button>
							</div>
						) : null}
					</>
				) : null}
			</div>
		</section>
	);
};

export default VendorsPage;
