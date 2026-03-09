import { Link } from "react-router-dom";
import { HERO_STATS } from "@/lib/constants";
import heroIllustration from "@/assets/hero-illustration.png";

const HeroSection = () => {
  return (
    <section className="border-b bg-muted/30 bg-gradient-hero">
      <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="text-center lg:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Ethiopia's #1 Booking Platform
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:mx-0">
            Book Trusted Professionals in Minutes
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Discover, compare, and book service providers across Ethiopia. Simple,
            fast, and reliable.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to="/vendors"
              className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Browse Services
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium"
            >
              Become a Vendor
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            {HERO_STATS.map((stat) => (
              <div
                key={stat}
                className="rounded-xl border border-border/70 bg-card px-4 py-2 text-sm font-medium shadow-sm"
              >
                {stat}
              </div>
            ))}
          </div>
        </div>
        <div>
          <img
            src={heroIllustration}
            alt="Book appointments easily with Slotify"
            className="animate-hero-float mx-auto w-full max-w-xl rounded-2xl border border-border/60 bg-background p-2 shadow-card"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
