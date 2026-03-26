import { HOW_IT_WORKS_STEPS } from "@/lib/constants";
import { CalendarClock, CheckCircle2, Search } from "lucide-react";

const STEP_ICONS = [Search, CalendarClock, CheckCircle2];

const HowItWorksSection = () => {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Simple Process
        </p>
        <h2 className="mt-2 text-center text-2xl sm:text-3xl">How It Works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground sm:text-base">
          Booking a professional has never been easier. Just three simple steps.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-7">
          {HOW_IT_WORKS_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Search;

            return (
              <article
                key={step.id}
                className={index === HOW_IT_WORKS_STEPS.length - 1 ? "section-shell col-span-2 mx-auto w-full max-w-xs p-5 text-center md:col-span-1 md:max-w-none" : "section-shell p-5 text-center"}
              >
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-primary-glow">
                  <Icon className="size-[18px]" />
                </div>
                <h3 className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-sm font-semibold text-accent">0{step.id}</span>
                  <span className="text-2xl leading-none">{step.title}</span>
                </h3>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
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
