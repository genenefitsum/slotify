import { TESTIMONIALS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-14 lg:py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Testimonials
        </p>
        <h2 className="mt-2 text-center text-3xl sm:text-4xl">What People Say</h2>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <Card
              key={`${testimonial.name}-${testimonial.role}`}
              className="rounded-xl border-border/70 p-4 shadow-sm"
            >
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={`${testimonial.name}-${index}`} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">"{testimonial.quote}"</p>
              <footer className="mt-4">
                <p className="text-base font-semibold text-foreground">{testimonial.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{testimonial.role}</p>
              </footer>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
