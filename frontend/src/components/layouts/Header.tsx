import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays, Menu, X } from "lucide-react";


const Header = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    const roleRoute =
        user?.role === 'admin'
            ? '/dashboard/admin'
            : user?.role === 'vendor_owner' || user?.role === 'vendor_staff'
                ? '/dashboard/vendor'
                : '/bookings';

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
                <div className="border-t border-border/50 bg-card/95 md:hidden">
                    <nav className="flex flex-col gap-2 p-3">
                        <NavLink
                            to="/vendors"
                            className={({ isActive }) =>
                                `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
                            }
                            onClick={() => setMobileOpen(false)}
                        >
                            Browse Vendors
                        </NavLink>
                        <NavLink
                            to="/about"
                            className={({ isActive }) =>
                                `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
                            }
                            onClick={() => setMobileOpen(false)}
                        >
                            How It Works
                        </NavLink>
                        {isAuthenticated ? (
                            <>
                                <NavLink
                                    to={roleRoute}
                                    className={({ isActive }) =>
                                        `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
                                    }
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Dashboard
                                </NavLink>
                                <Button
                                    size="sm"
                                    className="mt-1 rounded-lg"
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
                                    className={({ isActive }) =>
                                        `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`
                                    }
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Log In
                                </NavLink>
                                <Button asChild size="sm" className="mt-1 rounded-lg">
                                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                                        Get Started
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;