import { Link } from "react-router-dom";
import { ADDITIONAL_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ChevronRight, Link2 } from "lucide-react";

const AdditionalLinksSection = () => {
  return (
    <section className="bg-muted/20">
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="flex items-center justify-center gap-2 text-base">
          <Link2 className="size-4 text-primary" />
          Additional Links
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {ADDITIONAL_LINKS.map((item) => (
            <Button key={item.to} asChild variant="outline" size="sm" className="rounded-lg">
              <Link to={item.to}>
                {item.label}
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdditionalLinksSection;
