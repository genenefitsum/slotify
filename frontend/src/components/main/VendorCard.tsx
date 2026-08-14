import { Link } from "react-router-dom";
import { MapPin, Star, ArrowUpRight } from "lucide-react";

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
    <div className="group flex flex-col border border-ink bg-canvas shadow-[4px_4px_0_0_var(--ink)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)]">
      {/* Image / Banner */}
      <div className="relative aspect-[4/3] overflow-hidden border-b border-ink bg-ink/5">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-end bg-muted/40 p-5">
            <div>
              <p className="mt-2 font-display text-xl font-black text-ink">{name}</p>
            </div>
          </div>
        )}

        {/* Category floating tag */}
        <div className="absolute left-3 top-3">
          <span className="bg-acid px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-acid-foreground">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-ink">
              {name}
            </h3>
            <div className="flex items-center gap-1 border border-ink bg-canvas px-2 py-0.5 font-mono text-xs font-bold text-ink">
              <Star className="size-3 fill-ink text-ink" />
              <span>{rating.toFixed(1)}</span>
              <span className="text-[10px] text-ink/50">({reviews})</span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 font-mono text-xs text-ink/70">
            <MapPin className="size-3.5 text-ink/60" />
            <span>{location}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-ink/15 pt-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/50">
              {typeof price === "number" && price > 0 ? "Starting at" : "Rates"}
            </span>
            <p className="font-display text-base font-black tracking-tight text-ink">
              {typeof price === "number" && price > 0 ? `${price.toLocaleString()} ETB` : "View slots"}
            </p>
          </div>

          <Link
            to={`/vendor/${id}`}
            className="flex items-center gap-1 bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-canvas clip-tag-r transition-colors hover:bg-acid hover:text-acid-foreground"
          >
            View
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
