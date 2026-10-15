import { Link, router, usePage } from '@inertiajs/react';
import { BriefcaseMedical, ChevronDown, Headset, TriangleAlert, LayoutDashboard, LogOut, UserCog } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { HelpdeskDialog } from '@/components/student/helpdesk-dialog';
import { ProfileIncompleteDialog } from '@/components/student/profile-incomplete-dialog';
import { SiteFooter } from '@/components/student/site-footer';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const links = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/profile', label: 'My Profile', icon: UserCog },
    { href: '/recruitments', label: 'Recruitments', icon: BriefcaseMedical },
];

/** Layout for pages that need a logged-in student (own header + nav). */
export default function StudentPortalLayout({ children }: { children: ReactNode }) {
    const page = usePage();
    const url = page.url;
    const student = (page.props as unknown as { auth: { student?: { full_name: string; registration_no: string } | null } }).auth?.student;
    const profile = (page.props as unknown as { studentProfile?: { status: string; completed: number; total: number; pending: string[] } | null }).studentProfile;
    const profileNotice = Boolean((page.props as unknown as { profileNotice?: boolean }).profileNotice);
    const [noticeOpen, setNoticeOpen] = useState(false);
    const [path, setPath] = useState('');
    const [leaving, setLeaving] = useState(false);
    const [helpOpen, setHelpOpen] = useState(false);

    useEffect(() => setPath(window.location.pathname), [url]);

    // The flag is flashed once at login, so it is true for a single response only.
    useEffect(() => {
        if (profileNotice && profile && profile.status !== 'completed') {
            setNoticeOpen(true);
        }
    }, [profileNotice, profile]);

    // Portal pages are light-mode only.
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

    const logout = () => {
        setLeaving(true);
        router.post('/logout', {}, { onFinish: () => setLeaving(false) });
    };

    return (
        <div className="flex min-h-screen flex-col bg-muted/30 text-foreground">
            <header className="sticky top-0 z-40 border-b bg-card shadow-sm">
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 sm:px-8 lg:px-16 xl:px-24">
                    <Link href="/student/dashboard" className="flex items-center gap-3 rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                        <BrandLogo className="size-12 shrink-0" />
                        <span className="hidden flex-col sm:flex">
                            <span className="text-lg leading-tight font-semibold text-primary">Health Recruitment Portal</span>
                            <span className="text-xs text-muted-foreground">Applicant Panel</span>
                        </span>
                    </Link>

                    <nav aria-label="Applicant navigation" className="hidden items-center gap-1 lg:flex">
                        {links.map(({ href, label, icon: Icon }) => {
                            const active = path === href;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                        active ? 'bg-primary-tint text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                    {label}
                                </Link>
                            );
                        })}
                        <button
                            type="button"
                            onClick={() => setHelpOpen(true)}
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <Headset className="size-4" aria-hidden="true" />
                            Helpdesk
                        </button>
                    </nav>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-11 gap-2 rounded-full px-3">
                                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                                    {student?.full_name?.charAt(0).toUpperCase()}
                                </span>
                                <span className="hidden max-w-40 truncate text-sm sm:inline">{student?.full_name}</span>
                                <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-60">
                            <DropdownMenuLabel>
                                <p className="truncate text-sm font-semibold">{student?.full_name}</p>
                                <p className="font-mono text-xs font-normal text-muted-foreground">{student?.registration_no}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {links.map(({ href, label, icon: Icon }) => (
                                <DropdownMenuItem key={href} asChild className="lg:hidden">
                                    <Link href={href}><Icon className="size-4" /> {label}</Link>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onSelect={() => setHelpOpen(true)} className="lg:hidden">
                                <Headset className="size-4" /> Helpdesk
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="lg:hidden" />
                            <DropdownMenuItem disabled={leaving} onSelect={logout} className="text-destructive focus:text-destructive">
                                <LogOut className="size-4" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
                {profile && profile.status !== 'completed' && path !== '/student/profile' && (
                    <div role="status" className="flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:px-8 lg:px-16 xl:px-24">
                        <TriangleAlert className="size-5 shrink-0" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p>
                                <strong>Your profile is incomplete</strong> — {profile.completed} of {profile.total} required steps done.
                                {profile.pending.length > 0 && <> Pending: {profile.pending.join(', ')}.</>}
                            </p>
                            <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-amber-200" role="progressbar" aria-valuemin={0} aria-valuemax={profile.total} aria-valuenow={profile.completed}>
                                <div className="h-full rounded-full bg-amber-600 transition-all" style={{ width: `${(profile.completed / profile.total) * 100}%` }} />
                            </div>
                        </div>
                        <Button asChild size="sm"><Link href="/student/profile">Complete Profile</Link></Button>
                    </div>
                )}
                {children}
            </main>
            <SiteFooter />
            <HelpdeskDialog open={helpOpen} onOpenChange={setHelpOpen} />
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
