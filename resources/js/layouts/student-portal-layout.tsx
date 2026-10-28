import { Link, usePage } from '@inertiajs/react';
import { TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/animate-ui/components/radix/sheet';
import { ProfileIncompleteDialog } from '@/components/student/profile-incomplete-dialog';
import { PortalSidebar, PortalSidebarContent } from '@/components/student/shell/portal-sidebar';
import type { ProfileSummary } from '@/components/student/shell/portal-sidebar';
import { PortalTopbar } from '@/components/student/shell/portal-topbar';
import { Button } from '@/components/ui/button';
import { PortalPrefsProvider, usePortalPrefs } from '@/lib/portal-prefs';

type PortalProps = {
    auth?: { student?: { full_name: string; registration_no: string } | null };
    studentProfile?: ProfileSummary | null;
    profileNotice?: boolean;
};

function Shell({ children }: { children: ReactNode }) {
    const page = usePage();
    const { t } = usePortalPrefs();
    const { auth, studentProfile: profile, profileNotice } = page.props as unknown as PortalProps;
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [path, setPath] = useState('');

    useEffect(() => setPath(window.location.pathname), [page.url]);

    // The flag is flashed once at login, so it is true for a single response only.
    useEffect(() => {
        if (profileNotice && profile && profile.status !== 'completed') {
            setNoticeOpen(true);
        }
    }, [profileNotice, profile]);

    const sidebarProps = { path };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <a href="#main-content" className="sr-only rounded bg-card px-3 py-2 font-medium text-primary focus:not-sr-only focus:absolute focus:z-50">{t('shell.skip')}</a>

            <PortalSidebar {...sidebarProps} />

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetContent side="left" className="w-72 bg-sidebar p-0">
                    <SheetTitle className="sr-only">Menu</SheetTitle>
                    <SheetDescription className="sr-only">Applicant navigation</SheetDescription>
                    <PortalSidebarContent {...sidebarProps} onNavigate={() => setMenuOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
                <PortalTopbar student={auth?.student} onOpenMenu={() => setMenuOpen(true)} />

                <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
                    {profile && profile.status !== 'completed' && path !== '/student/profile' && (
                        <div role="status" className="mx-4 mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground sm:mx-6 lg:mx-8">
                            <TriangleAlert className="size-5 shrink-0 text-warning" aria-hidden="true" />
                            <p className="min-w-0 flex-1">
                                <strong>Your profile is incomplete</strong> — {profile.completed} of {profile.total} required steps done.
                                {profile.pending.length > 0 && <> Pending: {profile.pending.join(', ')}.</>}
                            </p>
                            <Button asChild size="sm"><Link href="/student/profile">{t('profile.continue')}</Link></Button>
                        </div>
                    )}
                    {children}
                </main>

                <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
                    © {new Date().getFullYear()} Health &amp; Family Welfare Department, Government of Tripura
                </footer>
            </div>

            {profile && (
                <ProfileIncompleteDialog
                    open={noticeOpen}
                    onOpenChange={setNoticeOpen}
                    completed={profile.completed}
                    total={profile.total}
                    showProfileLink={path !== '/student/profile'}
                />
            )}
        </div>
    );
}

/** Layout for pages that need a logged-in student: sidebar app shell. */
export default function StudentPortalLayout({ children }: { children: ReactNode }) {
    return (
        <PortalPrefsProvider>
            <Shell>{children}</Shell>
        </PortalPrefsProvider>
    );
}
