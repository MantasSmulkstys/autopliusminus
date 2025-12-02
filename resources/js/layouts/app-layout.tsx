import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({ children, breadcrumbs }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="border-b border-border bg-muted/30 px-4 py-2">
                    <div className="mx-auto max-w-7xl">
                        <ol className="flex items-center space-x-2 text-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <li key={index} className="flex items-center">
                                    {index > 0 && (
                                        <span className="mx-2 text-muted-foreground">/</span>
                                    )}
                                    {crumb.href ? (
                                        <Link
                                            href={crumb.href}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {crumb.title}
                                        </Link>
                                    ) : (
                                        <span className="text-foreground">{crumb.title}</span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </nav>
            )}
            {children}
        </div>
    );
}

