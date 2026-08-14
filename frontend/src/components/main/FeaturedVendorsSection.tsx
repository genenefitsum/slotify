import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { vendorsApi } from '@/api/vendors.api';
import VendorCard from "@/components/main/VendorCard";
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';
import { ArrowRight } from "lucide-react";

const FeaturedVendorsSection = () => {
  const featuredVendorsQuery = useQuery({
    queryKey: ['vendors', 'featured-home'],
    queryFn: () => vendorsApi.list({ page: 1, limit: 6 }),
    staleTime: 60_000,
  });

  const featuredVendors = useMemo(
    () =>
      [...(featuredVendorsQuery.data?.items || [])]
        .sort((left, right) => {
          if (right.averageRating !== left.averageRating) {
            return right.averageRating - left.averageRating;
          }

          return right.reviewCount - left.reviewCount;
        })
        .slice(0, 6),
    [featuredVendorsQuery.data?.items]
  );

  return (
    <section className="border-b border-rule bg-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-ink/20 bg-canvas px-3 py-1">
              <span className="size-1.5 rounded-full bg-acid" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
                Top Rated
              </span>
            </div>
            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Featured Vendors
            </h2>
          </div>

          <Link
            to="/vendors?view=all"
            className="group flex w-fit items-center gap-2 bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-canvas clip-tag-r transition-colors hover:bg-acid hover:text-acid-foreground"
          >
            View all vendors
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10">
          {featuredVendorsQuery.isLoading ? <PageSkeleton rows={3} /> : null}

          {featuredVendorsQuery.isError ? (
            <ErrorState
              description={
                featuredVendorsQuery.error instanceof Error
                  ? featuredVendorsQuery.error.message
                  : 'Unable to load featured vendors.'
              }
            />
          ) : null}

          {!featuredVendorsQuery.isLoading && !featuredVendorsQuery.isError && featuredVendors.length === 0 ? (
            <EmptyState
              title="No featured vendors yet"
              description="Seed vendors or create new profiles to populate the homepage."
            />
          ) : null}

          {featuredVendors.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {featuredVendors.map((vendor) => (
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
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;
