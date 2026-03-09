import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, X } from "lucide-react";


const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <CalendarDays className="size-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold text-foreground">Slotify</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        to="/vendors"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Browse Vendors
                    </Link>
                    <Link
                        to="/about"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        How It Works
                    </Link>
                    <Link
                        to="/login"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Log In
                    </Link>
                    <Button asChild size="sm" className="rounded-lg">
                        <Link to="/register">
                            Get Started
                        </Link>
                    </Button>
                </nav>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg md:hidden"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile navigation"
                >
                    {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </Button>
            </div>

            {mobileOpen && (
                <div className="border-t border-border/50 bg-card md:hidden">
                    <nav className="flex flex-col gap-2 p-3">
                        <Link
                            to="/vendors"
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            Browse Vendors
                        </Link>
                        <Link
                            to="/about"
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            How It Works
                        </Link>
                        <Link
                            to="/login"
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            Log In
                        </Link>
                        <Button asChild size="sm" className="mt-1 rounded-lg">
                            <Link to="/register" onClick={() => setMobileOpen(false)}>
                                Get Started
                            </Link>
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;