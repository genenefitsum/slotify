import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";

const ReadyToStartSection = () => {
  return (
    <section className="border-b border-rule bg-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="relative overflow-hidden border border-ink bg-ink p-10 text-center shadow-[8px_8px_0_0_var(--acid)] sm:p-16">
          {/* Subtle glow accent */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-acid/20 blur-[100px]" />

          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-acid" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                Join Slotify Today
              </span>
            </div>

            <h2 className="font-display text-3xl font-black uppercase tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to Get Started?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Join thousands of customers and vendors on Ethiopia's fastest-growing booking platform.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="group flex items-center gap-2 bg-acid px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-ink clip-tag-l transition-transform hover:-translate-y-0.5"
              >
                Create Free Account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/vendors"
                className="flex items-center gap-2 border border-white/40 bg-white/5 px-7 py-4 font-display text-sm font-bold uppercase tracking-wide text-white clip-tag-r transition-all hover:bg-white hover:text-ink"
              >
                <Compass className="size-4" />
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyToStartSection;
