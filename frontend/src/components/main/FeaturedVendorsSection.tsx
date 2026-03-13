import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from "react-router-dom";
import { vendorsApi } from '@/api/vendors.api';
import { Button } from "@/components/ui/button";
import VendorCard from "@/components/main/VendorCard";
import EmptyState from '@/components/ui/empty-state';
import ErrorState from '@/components/ui/error-state';
import PageSkeleton from '@/components/ui/page-skeleton';

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
    <section className="border-b bg-muted/20">
      <div className="container mx-auto max-w-6xl px-4 py-10 lg:py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-green-600 font-semibold uppercase tracking-[0.2em]">
              Top Rated
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl">Featured Vendors</h2>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full px-4">
            <Link to="/vendors?view=all">View more</Link>
          </Button>
        </div>

        <div className="mt-6">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {featuredVendors.map((vendor) => (
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
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;
