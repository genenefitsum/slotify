import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { CalendarClock, CheckCircle2, Search } from "lucide-react";

const STEP_ICONS = [Search, CalendarClock, CheckCircle2];

const HowItWorksSection = () => {
  return (
    <section className="border-b border-rule bg-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 border border-ink/20 bg-canvas px-3 py-1">
            <span className="size-1.5 rounded-full bg-acid" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
              Simple Process
            </span>
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink/70">
            Booking a professional has never been easier. Just three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Search;

            return (
              <article
                key={step.id}
                className="group relative border border-ink bg-canvas p-8 shadow-[4px_4px_0_0_var(--ink)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-12 items-center justify-center bg-ink text-canvas clip-tag-r">
                    <Icon className="size-5" />
                  </span>
                  <span className="bg-acid px-2.5 py-1 font-mono text-xs font-bold text-acid-foreground">
                    0{step.id}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-2xl font-black uppercase tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
