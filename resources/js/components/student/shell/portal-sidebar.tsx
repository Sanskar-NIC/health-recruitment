import { Link, router } from '@inertiajs/react';
import { BellRing, CircleUserRound, ClipboardList, House, LogOut, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { usePortalPrefs } from '@/lib/portal-prefs';
import type { TranslationKey } from '@/lib/portal-prefs';
import { cn } from '@/lib/utils';

interface NavItem {
    href: string;
    label: TranslationKey;
    icon: LucideIcon;
}

const groups: { label: TranslationKey; items: NavItem[] }[] = [
    {
        label: 'nav.group.overview',
        items: [{ href: '/student/dashboard', label: 'nav.dashboard', icon: House }],
    },
    {
        label: 'nav.group.recruitment',
        items: [
            { href: '/recruitments', label: 'nav.recruitments', icon: Stethoscope },
            { href: '/student/applications', label: 'nav.applications', icon: ClipboardList },
        ],
    },
    {
        label: 'nav.group.account',
        items: [
            { href: '/student/profile', label: 'nav.profile', icon: CircleUserRound },
            { href: '/notifications', label: 'nav.notifications', icon: BellRing },
        ],
    },
];

export interface ProfileSummary {
    status: string;
    completed: number;
    total: number;
    pending: string[];
}

interface Props {
    path: string;
    /** Called after a link is chosen (closes the mobile drawer). */
    onNavigate?: () => void;
}

/** Sidebar body, shared by the desktop rail and the mobile drawer. */
export function PortalSidebarContent({ path, onNavigate }: Props) {
    const { t } = usePortalPrefs();
    const isActive = (href: string) => path === href || (href !== '/student/dashboard' && path.startsWith(`${href}/`));
    const [leaving, setLeaving] = useState(false);

    const logout = () => {
        setLeaving(true);
        router.post('/logout', {}, { onFinish: () => setLeaving(false) });
    };

    return (
        <div className="flex h-full flex-col">
            <Link href="/student/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-5 py-5 focus-visible:outline-none">
                <BrandLogo className="size-11 shrink-0" />
                <span className="flex flex-col leading-tight">
                    <span className="text-[15px] font-bold text-primary-deep">Health Recruitment</span>
                    <span className="text-xs text-muted-foreground">Applicant Portal</span>
                </span>
            </Link>

            <nav aria-label="Applicant navigation" className="flex-1 overflow-y-auto px-3 pb-4">
                {groups.map((group) => (
                    <div key={group.label} className="mt-4 first:mt-1">
                        <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">{t(group.label)}</p>
                        <ul className="grid gap-0.5">
                            {group.items.map(({ href, label, icon: Icon }) => {
                                const active = isActive(href);

                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            onClick={onNavigate}
                                            aria-current={active ? 'page' : undefined}
                                            className={cn(
                                                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                                active ? 'bg-primary-tint text-primary-deep' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            {active && <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-primary" aria-hidden="true" />}
                                            <Icon className={cn('size-[18px]', active && 'text-primary')} aria-hidden="true" />
                                            {t(label)}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="border-t p-3">
                <button
                    type="button"
                    onClick={logout}
                    disabled={leaving}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-60"
                >
                    <LogOut className="size-[18px]" aria-hidden="true" />
                    {t('auth.logout')}
                </button>
            </div>
        </div>
    );
}

/** Fixed left rail for large screens. */
export function PortalSidebar(props: Omit<Props, 'onNavigate'>) {
    return (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar lg:block">
            <PortalSidebarContent {...props} />
        </aside>
    );
}
