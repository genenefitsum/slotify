import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { vendorsApi } from '@/api/vendors.api';
import VendorCard from '@/components/main/VendorCard';
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 6;
const POPULAR_CATEGORIES = ['Beauty', 'Fitness', 'Photography', 'Home Services', 'Tutoring', 'Events'];

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
		<section className="container mx-auto px-4 py-10 lg:py-14">
			<div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
				<div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
				<div className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Marketplace</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find your next trusted vendor</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Search by city and category, compare providers, and open full profiles to check services, pricing, and availability.
				</p>

				<div className="mt-5 flex flex-wrap gap-2">
					{POPULAR_CATEGORIES.map((item) => {
						const active = category.toLowerCase() === item.toLowerCase();
						return (
							<Button
								key={item}
								type="button"
								variant={active ? 'default' : 'outline'}
								size="sm"
								className="rounded-full"
								onClick={() => {
									const nextParams = new URLSearchParams(searchParams);
									nextParams.set('category', item);
									setSearchParams(nextParams);
								}}
							>
								{item}
							</Button>
						);
					})}
				</div>
			</div>

			<form
				className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:grid-cols-[1fr_1fr_auto_auto]"
				onSubmit={(event) => {
					event.preventDefault();
					handleFilterSubmit(new FormData(event.currentTarget));
				}}
			>
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						name="city"
						defaultValue={city}
						placeholder="City (for example Addis Ababa)"
						className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm"
					/>
				</div>
				<div className="relative">
					<SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						name="category"
						defaultValue={category}
						placeholder="Category (for example Beauty)"
						className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm"
					/>
				</div>
				<Button type="submit" className="h-10">
					Apply Filters
				</Button>
				<Button
					type="button"
					variant="ghost"
					className="h-10"
					onClick={() => setSearchParams(showAll ? { view: 'all' } : {})}
				>
					Clear
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
						<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
							<p className="text-muted-foreground">
								Showing <span className="font-semibold text-foreground">{data.items.length}</span> of <span className="font-semibold text-foreground">{data.pagination.total}</span> vendors
								{city ? <span> in <span className="font-semibold text-foreground">{city}</span></span> : null}
								{category ? <span> for <span className="font-semibold text-foreground">{category}</span></span> : null}
							</p>
							<div className="flex items-center gap-2">
								<p className="text-muted-foreground">Choose a profile to review services and availability.</p>
								{!showAll && data.pagination.total > data.items.length ? (
									<Button type="button" variant="outline" size="sm" onClick={() => setShowAll(true)}>
										View all
									</Button>
								) : null}
							</div>
						</div>

						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{data.items.map((vendor) => (
								<VendorCard
									key={vendor.id}
									id={vendor.id}
									name={vendor.displayName}
									image={vendor.images?.[0] || vendor.imageUrl || undefined}
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
