import { TESTIMONIALS } from "@/lib/constants";

const TestimonialsSection = () => {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto px-4 py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Testimonials
        </p>
        <h2 className="mt-3 text-center text-3xl sm:text-4xl">What People Say</h2>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <blockquote
              key={`${testimonial.name}-${testimonial.role}`}
              className="rounded-2xl border border-border/70 bg-card p-6 text-center shadow-card"
            >
              <p className="text-base leading-7 text-foreground">"{testimonial.quote}"</p>
              <footer className="mt-6">
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
