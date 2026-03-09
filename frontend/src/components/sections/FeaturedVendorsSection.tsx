import { Link } from "react-router-dom";
import { FEATURED_VENDORS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Star } from "lucide-react";

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

        <div className="mt-6 grid justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_VENDORS.map((vendor) => (
            <Card
              key={vendor.id}
              className="w-full max-w-[22rem] overflow-hidden rounded-[1rem] border-border/70 bg-card shadow-sm"
            >
              <img
                src={vendor.imageUrl}
                alt={vendor.name}
                className="h-44 w-full object-cover"
                loading="lazy"
              />

              <div className="space-y-2 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                    {vendor.category}
                  </p>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-foreground"
                  >
                    <Star className="mr-1 size-3 fill-amber-500 text-amber-500" />
                    {vendor.rating.toFixed(1)}
                    <span className="ml-1 font-normal text-muted-foreground">({vendor.reviews})</span>
                  </Badge>
                </div>

                <h3 className="text-[1.05rem] font-semibold leading-snug tracking-tight">{vendor.name}</h3>

                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {vendor.location}
                </p>

                <div className="border-t border-border pt-2.5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Starting from</p>
                      <p className="text-md font-semibold leading-none text-foreground">
                        {vendor.startingPrice} ETB
                      </p>
                    </div>

                    <Button asChild variant="outline" size="sm" className="h-9 rounded-full px-4 text-sm">
                      <Link to={`/vendor/${vendor.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedVendorsSection;
