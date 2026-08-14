import { TESTIMONIALS } from "@/lib/constants";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="border-b border-rule bg-canvas py-16 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 border border-ink/20 bg-canvas px-3 py-1">
            <span className="size-1.5 rounded-full bg-acid" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
              Testimonials
            </span>
          </div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-ink sm:text-4xl lg:text-5xl">
            What People Say
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-ink/70">
            Real feedback from customers and service providers on Slotify.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={`${testimonial.name}-${testimonial.role}`}
              className="flex flex-col justify-between border border-ink bg-canvas p-8 shadow-[4px_4px_0_0_var(--ink)] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)]"
            >
              <div>
                <div className="flex items-center gap-1 text-ink">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`${testimonial.name}-${index}`} className="size-4 fill-ink" />
                  ))}
                </div>
                <p className="mt-5 font-sans text-base leading-relaxed text-ink/80">
                  "{testimonial.quote}"
                </p>
              </div>

              <div className="mt-6 border-t border-ink/15 pt-4">
                <p className="font-display text-base font-black uppercase tracking-tight text-ink">
                  {testimonial.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
