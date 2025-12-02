import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from './button';
import { isAuthenticated, logout, getCurrentUser } from '@/lib/api';
import { home, login, register } from '@/routes';
import { cn } from '@/lib/utils';

interface HeaderProps {
    showAdminLink?: boolean;
}

export function Header({ showAdminLink = false }: HeaderProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = isAuthenticated();
            setIsLoggedIn(authenticated);

            if (authenticated) {
                try {
                    const user = await getCurrentUser();
                    setIsAdmin(user.role === 'admin');
                } catch (err) {
                    console.error('Failed to get user:', err);
                }
            }
        };

        checkAuth();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuOpen && !(e.target as Element).closest('.mobile-menu-container')) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [menuOpen]);

    return (
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                {/* Logo */}
                <Link href={home.url()} className="flex flex-col transition-transform hover:scale-105">
                    <span className="text-xl font-bold tracking-tight text-primary">
                        AutoPliusMinus
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Find your perfect car
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-3 md:flex">
                    <Link href={home.url()}>
                        <Button size="sm" variant="ghost" className="transition-all hover:scale-105">
                            <HomeIcon className="mr-1 h-4 w-4" />
                            Home
                        </Button>
                    </Link>
                    <Link href="/listings">
                        <Button size="sm" variant="ghost" className="transition-all hover:scale-105">
                            <CarIcon className="mr-1 h-4 w-4" />
                            Listings
                        </Button>
                    </Link>
                    {isLoggedIn ? (
                        <>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button size="sm" variant="default" className="transition-all hover:scale-105">
                                        <ShieldIcon className="mr-1 h-4 w-4" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                            <Link href="/dashboard">
                                <Button size="sm" variant="ghost" className="transition-all hover:scale-105">
                                    <DashboardIcon className="mr-1 h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button size="sm" variant="ghost" className="transition-all hover:scale-105">
                                    <UserIcon className="mr-1 h-4 w-4" />
                                    Profile
                                </Button>
                            </Link>
                            <Button size="sm" variant="outline" onClick={logout} className="transition-all hover:scale-105">
                                <LogoutIcon className="mr-1 h-4 w-4" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href={login.url()}>
                                <Button size="sm" variant="ghost" className="transition-all hover:scale-105">
                                    <LoginIcon className="mr-1 h-4 w-4" />
                                    Log in
                                </Button>
                            </Link>
                            <Link href={register.url()}>
                                <Button size="sm" variant="default" className="transition-all hover:scale-105">
                                    <UserPlusIcon className="mr-1 h-4 w-4" />
                                    Register
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile Hamburger Button */}
                <div className="mobile-menu-container md:hidden">
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="rounded-md p-2 text-foreground transition-colors hover:bg-accent"
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <CloseIcon className="h-6 w-6" />
                        ) : (
                            <MenuIcon className="h-6 w-6" />
                        )}
                    </button>

                    {/* Mobile Menu Dropdown */}
                    <div
                        className={cn(
                            'absolute left-0 right-0 top-full border-b border-border bg-background shadow-lg transition-all duration-300',
                            menuOpen
                                ? 'opacity-100 translate-y-0 visible'
                                : 'opacity-0 -translate-y-2 invisible'
                        )}
                    >
                        <nav className="flex flex-col p-4 space-y-2">
                            <Link
                                href={home.url()}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                onClick={() => setMenuOpen(false)}
                            >
                                <HomeIcon className="h-4 w-4" />
                                Home
                            </Link>
                            <Link
                                href="/listings"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                onClick={() => setMenuOpen(false)}
                            >
                                <CarIcon className="h-4 w-4" />
                                Listings
                            </Link>
                            {isLoggedIn ? (
                                <>
                                    {isAdmin && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                            onClick={() => setMenuOpen(false)}
                                        >
                                            <ShieldIcon className="h-4 w-4" />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <DashboardIcon className="h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            logout();
                                        }}
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                                    >
                                        <LogoutIcon className="h-4 w-4" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={login.url()}
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <LoginIcon className="h-4 w-4" />
                                        Log in
                                    </Link>
                                    <Link
                                        href={register.url()}
                                        className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <UserPlusIcon className="h-4 w-4" />
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    );
}

// SVG Icons as components
function HomeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function CarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h8m-8 5h8m-4-9l-3 3H5a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-4l-3-3z" />
        </svg>
    );
}

function DashboardIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    );
}

function UserPlusIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
    );
}

function LoginIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
    );
}

function LogoutIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}

function MenuIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function CloseIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}

export {
    HomeIcon,
    CarIcon,
    DashboardIcon,
    UserIcon,
    UserPlusIcon,
    LoginIcon,
    LogoutIcon,
    ShieldIcon,
    MenuIcon,
    CloseIcon,
};

