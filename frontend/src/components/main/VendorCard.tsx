import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type VendorCardProps = {
  id: string | number;
  name: string;
  image?: string;
  category: string;
  rating: number;
  reviews: number;
  price?: number;
  location: string;
};

const VendorCard = ({
  id,
  name,
  image,
  category,
  rating,
  reviews,
  price,
  location,
}: VendorCardProps) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="aspect-[4/3] overflow-hidden bg-secondary">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-gradient-to-br from-emerald-100 via-lime-50 to-white p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {category}
              </p>
              <p className="mt-2 max-w-[14rem] text-xl font-semibold text-foreground">{name}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-accent">
              {category}
            </span>
            <h3 className="mt-0.5 text-lg font-semibold leading-snug">{name}</h3>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-amber-300/40 bg-amber-100/70 px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            <span className="text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews})</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-sm">{location}</span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <div>
            <span className="text-xs text-muted-foreground">
              {typeof price === "number" && price > 0 ? "Starting from" : "Availability"}
            </span>
            <p className="text-lg font-bold tracking-tight">
              {typeof price === "number" && price > 0 ? `${price.toLocaleString()} ETB` : "View services"}
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="rounded-xl transition-colors hover:bg-primary hover:text-primary-foreground">
            <Link to={`/vendor/${id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
