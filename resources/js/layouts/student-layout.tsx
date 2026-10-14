import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { MainNav } from '@/components/student/main-nav';
import { SiteFooter } from '@/components/student/site-footer';
import { SiteHeader } from '@/components/student/site-header';

export default function StudentLayout({ children }: { children: ReactNode }) {
    // Public pages are light-mode only.
    useEffect(() => {
        const root = document.documentElement;
        const wasDark = root.classList.contains('dark');

        root.classList.remove('dark');

        return () => {
            if (wasDark) {
                root.classList.add('dark');
            }
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <a href="#main-content" className="sr-only rounded bg-white px-3 py-2 font-medium text-primary focus:not-sr-only focus:absolute focus:z-50">Skip to main content</a>
            <SiteHeader />
            <MainNav />
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}
