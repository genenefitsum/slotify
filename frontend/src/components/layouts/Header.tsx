import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, X } from "lucide-react";


const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const mobileToggleRef = useRef<HTMLButtonElement | null>(null);

    const roleRoute =
        user?.role === 'admin'
            ? '/dashboard/admin'
            : user?.role === 'vendor_owner' || user?.role === 'vendor_staff'
                ? '/dashboard/vendor'
                : '/bookings';

    const mobileLinkClassName = ({ isActive }) =>
        `min-h-11 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all ${isActive
            ? 'border-border bg-secondary text-foreground shadow-sm'
            : 'border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-secondary/75 hover:text-foreground'
        }`;

    useEffect(() => {
        if (!mobileOpen) return;

        const handleOutsideTap = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target) return;

            const tappedInsideMenu = mobileMenuRef.current?.contains(target);
            const tappedToggle = mobileToggleRef.current?.contains(target);
            if (!tappedInsideMenu && !tappedToggle) {
                setMobileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideTap);
        document.addEventListener('touchstart', handleOutsideTap, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handleOutsideTap);
            document.removeEventListener('touchstart', handleOutsideTap);
        };
    }, [mobileOpen]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:glass">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                <Link to="/" className="group flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-primary-glow transition-transform duration-200 group-hover:-translate-y-0.5">
                        <CalendarDays className="size-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">Slotify</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <NavLink
                        to="/vendors"
                        className={({ isActive }) =>
                            `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all ${isActive ? 'text-foreground after:w-full' : 'text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full'}`
                        }
                    >
                        Browse Vendors
                    </NavLink>
                    <NavLink
                        to="/about"
                        className={({ isActive }) =>
                            `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all ${isActive ? 'text-foreground after:w-full' : 'text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full'}`
                        }
                    >
                        How It Works
                    </NavLink>
                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to={roleRoute}
                                className={({ isActive }) =>
                                    `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all ${isActive ? 'text-foreground after:w-full' : 'text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full'}`
                                }
                            >
                                Dashboard
                            </NavLink>
                            <Button size="sm" className="rounded-lg" onClick={logout}>
                                Log Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-all ${isActive ? 'text-foreground after:w-full' : 'text-muted-foreground after:w-0 hover:text-foreground hover:after:w-full'}`
                                }
                            >
                                Log In
                            </NavLink>
                            <Button asChild size="sm" className="rounded-lg">
                                <Link to="/register">
                                    Get Started
                                </Link>
                            </Button>
                        </>
                    )}
                </nav>

                <Button
                    ref={mobileToggleRef}
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 rounded-xl border transition-all md:hidden ${mobileOpen ? 'border-border bg-card shadow-sm' : 'border-transparent'}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile navigation"
                >
                    {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </Button>
            </div>

            {mobileOpen && (
                <div className="relative md:hidden">
                    <button
                        type="button"
                        className="fixed inset-0 top-14 z-40 bg-foreground/28"
                        aria-label="Close mobile navigation"
                        onClick={() => setMobileOpen(false)}
                    />

                    <div className="absolute inset-x-0 top-full z-50 px-3 pt-2">
                        <div ref={mobileMenuRef} className="motion-enter relative mx-auto max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_28px_45px_-30px_rgba(15,23,42,0.55)] ring-1 ring-foreground/5">
                            <div className="flex justify-center pb-1 pt-2">
                                <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
                            </div>
                            <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                Quick Navigation
                            </div>

                            <nav className="relative flex flex-col gap-1.5 p-2.5">
                        <NavLink
                            to="/vendors"
                            className={mobileLinkClassName}
                            onClick={() => setMobileOpen(false)}
                        >
                            Browse Vendors
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={mobileLinkClassName}
                            onClick={() => setMobileOpen(false)}
                        >
                            How It Works
                        </NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to={roleRoute}
                                    className={mobileLinkClassName}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                                <div className="my-1.5 border-t border-border/70" />
                                <Button
                                    size="sm"
                                    className="h-10 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                                    onClick={() => {
                                        logout();
                                        setMobileOpen(false);
                                    }}
                                >
                                    Log Out
                                </Button>
                            </>
                        ) : (
                            <>
                                <NavLink
                                    to="/login"
                                    className={mobileLinkClassName}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Log In
                                </NavLink>
                                <Button asChild size="sm" className="h-10 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;