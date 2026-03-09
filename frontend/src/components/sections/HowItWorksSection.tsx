import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

const HowItWorksSection = () => {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Simple Process
        </p>
        <h2 className="mt-3 text-center text-3xl sm:text-4xl">How It Works</h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Booking a professional has never been easier. Just three simple steps.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map((step) => (
            <article
              key={step.id}
              className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card"
            >
              <p className="text-2xl font-bold text-primary">0{step.id}</p>
              <h3 className="mt-3 text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
