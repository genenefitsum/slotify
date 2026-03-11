import { Link } from "react-router-dom";
import { FEATURED_VENDORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import VendorCard from "@/components/main/VendorCard";

const FeaturedVendorsSection = () => {
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
            <Link to="/vendors">View all</Link>
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {FEATURED_VENDORS.map((vendor) => (
            <VendorCard
              key={vendor.id}
              id={vendor.id}
              name={vendor.name}
              image={vendor.imageUrl}
              category={vendor.category}
              rating={vendor.rating}
              reviews={vendor.reviews}
              price={vendor.startingPrice}
              location={vendor.location}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;
