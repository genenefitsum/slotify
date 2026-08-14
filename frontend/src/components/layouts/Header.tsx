import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, NavLink } from "react-router-dom";
import { CalendarCheck, Menu, X } from "lucide-react";

const NAV_ITEMS = [
    { label: "Browse Vendors", to: "/vendors" },
    { label: "How It Works", to: "/about" },
];

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
        <header className="sticky top-0 z-50 border-b border-rule bg-canvas/85 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-10 px-6">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center bg-ink clip-tag-r">
                        <CalendarCheck className="size-4 text-canvas" />
                    </span>
                    <span className="font-display text-lg font-black tracking-tight text-ink">slotify</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-8 md:flex">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.to}
                            className={({ isActive }) =>
                                `font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    {isAuthenticated && (
                        <NavLink
                            to={roleRoute}
                            className={({ isActive }) =>
                                `font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'}`
                            }
                        >
                            Dashboard
                        </NavLink>
                    )}
                </nav>

                {/* Desktop auth */}
                <div className="ml-auto hidden items-center md:flex">
                    {isAuthenticated ? (
                        <button
                            onClick={logout}
                            className="bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-canvas clip-tag-r cursor-pointer"
                        >
                            Log out
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-ink px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-canvas clip-tag-l"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                className="-ml-3 bg-acid px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-acid-foreground clip-tag-r"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile toggle */}
                <button
                    ref={mobileToggleRef}
                    className={`ml-auto flex h-8 w-8 items-center justify-center border transition-all md:hidden ${mobileOpen ? 'border-ink bg-ink text-canvas' : 'border-transparent text-ink'}`}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle mobile navigation"
                >
                    {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="relative md:hidden">
                    <button
                        type="button"
                        className="fixed inset-0 top-16 z-40 bg-ink/30"
                        aria-label="Close mobile navigation"
                        onClick={() => setMobileOpen(false)}
                    />

                    <div className="absolute inset-x-0 top-full z-50 px-3 pt-2">
                        <div ref={mobileMenuRef} className="motion-enter relative mx-auto max-w-md overflow-hidden border border-rule bg-canvas shadow-[6px_6px_0_0_var(--ink)]">
                            <div className="flex justify-center pb-1 pt-2">
                                <span className="h-1 w-10 bg-ink/20" />
                            </div>
                            <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                                Quick Navigation
                            </div>

                            <nav className="relative flex flex-col gap-1.5 p-2.5">
                                {NAV_ITEMS.map((item) => (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `min-h-11 border px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${isActive
                                                ? 'border-ink bg-ink text-canvas'
                                                : 'border-transparent text-ink/60 hover:border-rule hover:text-ink'
                                            }`
                                        }
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                                {isAuthenticated ? (
                                    <>
                                        <NavLink
                                            to={roleRoute}
                                            className={({ isActive }) =>
                                                `min-h-11 border px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${isActive
                                                    ? 'border-ink bg-ink text-canvas'
                                                    : 'border-transparent text-ink/60 hover:border-rule hover:text-ink'
                                                }`
                                            }
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Dashboard
                                        </NavLink>
                                        <div className="my-1.5 border-t border-rule" />
                                        <button
                                            className="h-10 bg-ink font-mono text-[11px] uppercase tracking-[0.14em] text-canvas clip-tag-r"
                                            onClick={() => {
                                                logout();
                                                setMobileOpen(false);
                                            }}
                                        >
                                            Log Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            to="/login"
                                            className={({ isActive }) =>
                                                `min-h-11 border px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-all ${isActive
                                                    ? 'border-ink bg-ink text-canvas'
                                                    : 'border-transparent text-ink/60 hover:border-rule hover:text-ink'
                                                }`
                                            }
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Log In
                                        </NavLink>
                                        <Link
                                            to="/register"
                                            className="flex h-10 items-center justify-center bg-acid font-mono text-[11px] uppercase tracking-[0.14em] text-acid-foreground clip-tag-r"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Get Started
                                        </Link>
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