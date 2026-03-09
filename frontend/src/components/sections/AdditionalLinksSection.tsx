import { Link } from "react-router-dom";
import { ADDITIONAL_LINKS } from "@/lib/constants";

const AdditionalLinksSection = () => {
  return (
    <section className="bg-muted/20">
      <div className="container mx-auto px-4 py-10 text-center">
        <h2 className="text-lg">Additional Links</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {ADDITIONAL_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdditionalLinksSection;
