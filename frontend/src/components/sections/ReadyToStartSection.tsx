import { Link } from "react-router-dom";

const ReadyToStartSection = () => {
  return (
    <section className="border-b bg-gradient-hero">
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Get Started
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl">Ready to Get Started?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Join thousands of customers and vendors on Ethiopia's fastest-growing
          booking platform.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Create Free Account
          </Link>
          <Link
            to="/vendors"
            className="rounded-xl border border-border bg-card px-5 py-2 text-sm font-medium"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReadyToStartSection;
