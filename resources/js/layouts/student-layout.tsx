import type { ReactNode } from 'react';
import { PageBreadcrumbs } from '@/components/student/page-breadcrumbs';
import { PublicHeader } from '@/components/student/public-header';
import { SiteFooter } from '@/components/student/site-footer';
import { PortalPrefsProvider, usePortalPrefs } from '@/lib/portal-prefs';

function Frame({ children }: { children: ReactNode }) {
    const { t } = usePortalPrefs();

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <a href="#main-content" className="sr-only rounded bg-card px-3 py-2 font-medium text-primary focus:not-sr-only focus:absolute focus:z-50">{t('shell.skip')}</a>
            <PublicHeader />
            <PageBreadcrumbs />
            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {children}
            </main>
            <SiteFooter />
        </div>
    );
}

/** Public (signed-out) pages. */
export default function StudentLayout({ children }: { children: ReactNode }) {
    return (
        <PortalPrefsProvider>
            <Frame>{children}</Frame>
        </PortalPrefsProvider>
    );
}
