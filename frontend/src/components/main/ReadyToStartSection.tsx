import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

const ReadyToStartSection = () => {
  return (
    <section className="border-b bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-14 lg:py-16">
        <div className="rounded-3xl bg-primary px-6 py-14 text-center shadow-lg sm:px-10">
          <h2 className="text-3xl text-primary-foreground sm:text-4xl">Ready to Get Started?</h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-foreground/75">
            Join thousands of customers and vendors on Ethiopia's fastest-growing booking platform.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            <Button asChild size="sm" className="h-10 rounded-lg bg-white px-5 text-primary hover:bg-white/90">
            <Link to="/register">
              Create Free Account
            </Link>
          </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 rounded-lg border-primary-foreground/25 bg-primary px-5 text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/vendors">
                <Compass className="size-4" />
                Browse Services
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadyToStartSection;
