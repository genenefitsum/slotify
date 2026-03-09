import { Link } from "react-router-dom";
import { FEATURED_VENDORS } from "@/lib/constants";

const FeaturedVendorsSection = () => {
  return (
    <section className="border-b bg-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Top Rated
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl">Featured Vendors</h2>
          <Link
            to="/vendors"
            className="mt-4 inline-block text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            View all
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_VENDORS.map((vendor) => (
            <article
              key={vendor.id}
              className="overflow-hidden rounded-2xl border border-border/70 bg-card text-center shadow-card"
            >
              <img
                src={vendor.imageUrl}
                alt={vendor.name}
                className="h-44 w-full object-cover"
                loading="lazy"
              />

              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {vendor.category}
                </p>
                <h3 className="mt-2 text-xl">{vendor.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {vendor.rating.toFixed(1)} ({vendor.reviews})
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{vendor.location}</p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  Starting from {vendor.startingPrice} ETB
                </p>

                <Link
                  to={`/vendor/${vendor.id}`}
                  className="mt-5 inline-block rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"
                >
                  View Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;
