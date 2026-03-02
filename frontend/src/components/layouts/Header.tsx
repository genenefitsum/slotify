import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                        <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold text-foreground">Slotify</span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    <Link to="/vendors" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Browse Vendors
                    </Link>
                    <Link to="/about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        How It Works
                    </Link>
                    <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Log In
                    </Link>
                    <Link to="/register">
                        <Button size="sm" className="rounded-xl">
                            Get Started
                        </Button>
                    </Link>
                </nav>

                <button
                    className="rounded-lg p-2 transition-colors hover:bg-secondary md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile navigation"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="border-t border-border/50 bg-card md:hidden">
                    <nav className="flex flex-col gap-3 p-4">
                        <Link
                            to="/vendors"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            Browse Vendors
                        </Link>
                        <Link
                            to="/about"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            How It Works
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            Log In
                        </Link>
                        <Link to="/register" onClick={() => setMobileOpen(false)}>
                            <Button className="w-full rounded-xl">Get Started</Button>
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;