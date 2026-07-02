import { Link } from "react-router-dom";
import { HERO_STATS } from "@/lib/constants";
import heroIllustration from "@/assets/hero-illustration.png";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CircleCheckBig } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="border-b bg-muted/30 bg-gradient-hero">
      <div className="container mx-auto grid gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-24">
        <div className="motion-enter text-center lg:text-left">
          <Badge
            variant="secondary"
            className="mb-4 gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.12em]"
          >
            <span className="inline-block size-1.5 rounded-full bg-accent" />
            Ethiopia's Booking Platform
          </Badge>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight sm:text-4xl lg:mx-0 lg:text-5xl">
            Find The Right Professional <span className="text-primary">Without The Friction</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base lg:mx-0">
            Compare trusted providers, confirm availability, and book in a few clear steps.
            Built to feel calm, fast, and dependable.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button asChild size="lg" className="rounded-xl px-6">
              <Link to="/vendors">
                Browse Services
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
              <Link to="/register">Become a Vendor</Link>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 lg:justify-start">
            {HERO_STATS.map((stat) => (
              <div key={stat} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CircleCheckBig className="size-4 text-accent" />
                <span>{stat}</span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Most booked categories: Beauty, Fitness, Photography
          </p>
        </div>
        <div className="motion-enter motion-enter-delay-1 rounded-3xl border border-border/70 bg-card p-4 shadow-card">
          <div className="overflow-hidden rounded-2xl bg-muted/20">
            <img
              src={heroIllustration}
              alt="Book appointments easily with Slotify"
              className="animate-hero-float mx-auto w-full max-w-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
