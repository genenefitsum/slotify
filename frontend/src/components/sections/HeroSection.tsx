import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="border-b bg-muted/30">
      <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Ethiopia's #1 Booking Platform
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Book Trusted Professionals in Minutes
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Discover, compare, and book service providers across Ethiopia. Simple,
            fast, and reliable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/vendors">
              <button className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">
                Browse Services
              </button>
            </Link>
            <Link to="/register">
              <button className="rounded-xl border border-border px-4 py-2 text-sm">
                Become a Vendor
              </button>
            </Link>
          </div>
        </div>
        <div>
          <img
            src="https://id-preview--2fb67168-5423-40d8-a912-860d004d1e82.lovable.app/assets/hero-illustration-BdLBlmp3.png"
            alt="Book appointments easily with Slotify"
            className="mx-auto w-full max-w-xl rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
