import { Link } from "react-router-dom";
import heroPro from "@/assets/hero-pro.png";
import { ArrowRight } from "lucide-react";

const STATS = [
  { value: "1,200+", label: "Verified vendors" },
  { value: "38k", label: "Slots booked" },
  { value: "4.9", label: "Average rating" },
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-rule bg-canvas">
      {/* Acid glow */}
      <div className="pointer-events-none absolute -left-24 top-1/3 hidden h-[420px] w-[420px] rounded-full bg-acid/25 blur-[120px] lg:block" />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-8 px-6 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
        {/* Left column — copy */}
        <div className="relative z-10 pb-16">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 border border-ink/20 bg-canvas px-3 py-1.5">
            <span className="size-1.5 animate-pulse rounded-full bg-acid" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
              Ethiopia's booking platform
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-[clamp(3rem,8.5vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.045em] text-ink">
            Book the
            <br />
            right pro
            <br />
            <span className="relative inline-block">
              <span className="absolute inset-x-[-6px] bottom-[0.12em] top-[0.28em] -z-10 -skew-y-1 bg-acid" />
              in 3 taps
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink/70">
            Real availability, verified vendors, no back-and-forth DMs. Compare, confirm and
            show up — that's the whole thing.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex flex-wrap items-center">
            <Link
              to="/vendors"
              className="group flex items-center gap-2 bg-ink px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-canvas clip-tag-l"
            >
              Browse services
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/register"
              className="-ml-3.5 bg-acid px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-acid-foreground clip-tag-r"
            >
              Become a vendor
            </Link>
          </div>

          {/* Subtle link */}
          <Link
            to="/about"
            className="mt-6 inline-block font-mono text-xs text-ink/60 underline underline-offset-4 transition-colors hover:text-ink"
          >
            see how booking works →
          </Link>

          {/* Stats */}
          <dl className="mt-14 grid max-w-lg grid-cols-3 border-t border-ink/15 pt-6">
            {STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="font-display text-3xl font-black tracking-tight text-ink">{value}</dt>
                <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right column — hero image + floating cards */}
        <div className="relative flex items-end justify-center lg:justify-end">
          {/* Decorative vertical line */}
          <div className="absolute bottom-0 right-6 top-10 hidden w-px bg-ink/10 lg:block" />

          {/* Floating card: Next opening */}
          <div className="absolute right-4 top-16 z-20 hidden border border-ink bg-canvas px-4 py-3 shadow-[6px_6px_0_0_var(--ink)] lg:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
              Next opening
            </p>
            <p className="font-display text-xl font-black tracking-tight text-ink">Today · 14:30</p>
          </div>

          {/* Floating card: Confirmed */}
          <div className="absolute bottom-24 left-0 z-20 hidden items-center gap-3 border border-ink bg-acid px-4 py-3 shadow-[6px_6px_0_0_var(--ink)] lg:flex">
            <span className="font-display text-sm font-black uppercase tracking-wide text-acid-foreground">
              Confirmed
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-acid-foreground/70">
              in 12 seconds
            </span>
          </div>

          {/* Hero image */}
          <img
            src={heroPro}
            alt="Hairstylist confirming an appointment on her phone"
            width={1104}
            height={1408}
            className="relative z-10 max-h-[620px] w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
