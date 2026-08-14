import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-rule bg-canvas text-ink">
      <div className="mx-auto max-w-[1400px] px-6 py-14 lg:py-20">
        <div className="grid gap-10 md:grid-cols-5">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center bg-ink clip-tag-r">
                <CalendarCheck className="size-4 text-canvas" />
              </span>
              <span className="font-display text-lg font-black tracking-tight text-ink">slotify</span>
            </Link>
            <p className="mt-4 font-sans text-sm leading-relaxed text-ink/70">
              Book trusted professionals in minutes across Ethiopia.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="border-b border-rule pb-2 font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-ink">
              Platform
            </p>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-ink/65">
              <Link to="/vendors" className="transition-colors hover:text-ink">
                Browse Services
              </Link>
              <Link to="/register" className="transition-colors hover:text-ink">
                Become a Vendor
              </Link>
              <Link to="/about" className="transition-colors hover:text-ink">
                How It Works
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="border-b border-rule pb-2 font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-ink">
              Company
            </p>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-ink/65">
              <Link to="/about" className="transition-colors hover:text-ink">
                About
              </Link>
              <a href="mailto:slotifyethiopia@outlook.com?subject=Slotify%20Support" className="transition-colors hover:text-ink">
                slotifyethiopia@outlook.com
              </a>
              <a href="tel:+251987184647" className="transition-colors hover:text-ink">
                +251 987 184 647
              </a>
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="border-b border-rule pb-2 font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-ink">
              Account
            </p>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-ink/65">
              <Link to="/login" className="transition-colors hover:text-ink">
                Log In
              </Link>
              <Link to="/register" className="transition-colors hover:text-ink">
                Create Account
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="border-b border-rule pb-2 font-mono text-[11px] uppercase tracking-[0.16em] font-bold text-ink">
              Legal
            </p>
            <div className="mt-4 flex flex-col gap-2.5 font-mono text-xs text-ink/65">
              <Link to="/privacy" className="transition-colors hover:text-ink">
                Privacy Policy
              </Link>
              <Link to="/terms" className="transition-colors hover:text-ink">
                Terms of Service
              </Link>
              <Link to="/cookies" className="transition-colors hover:text-ink">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-rule pt-8 sm:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/40">
            © 2026 Slotify. All rights reserved.
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/40">
            Ethiopia's Booking Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
