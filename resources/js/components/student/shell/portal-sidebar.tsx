import { Link } from '@inertiajs/react';
import { BellRing, CircleUserRound, ClipboardList, House, LifeBuoy, MessageCircleQuestion, Stethoscope } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { ProfileRing } from '@/components/student/shell/profile-ring';
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
    {
        label: 'nav.group.support',
        items: [{ href: '/faq', label: 'nav.faq', icon: MessageCircleQuestion }],
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
    profile: ProfileSummary | null | undefined;
    onHelpdesk: () => void;
    /** Called after a link is chosen (closes the mobile drawer). */
    onNavigate?: () => void;
}

/** Sidebar body, shared by the desktop rail and the mobile drawer. */
export function PortalSidebarContent({ path, profile, onHelpdesk, onNavigate }: Props) {
    const { t } = usePortalPrefs();
    const isActive = (href: string) => path === href || (href !== '/student/dashboard' && path.startsWith(`${href}/`));
    const complete = profile?.status === 'completed';

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
                <button
                    type="button"
                    onClick={() => {
                        onNavigate?.();
                        onHelpdesk();
                    }}
                    className="mt-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <LifeBuoy className="size-[18px]" aria-hidden="true" />
                    {t('nav.helpdesk')}
                </button>
            </nav>

            {profile && (
                <Link
                    href="/student/profile"
                    onClick={onNavigate}
                    className="m-3 flex items-center gap-3 rounded-2xl border bg-primary-tint/60 p-3 transition-colors hover:bg-primary-tint focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <ProfileRing completed={profile.completed} total={profile.total} size={52} />
                    <span className="min-w-0 text-left">
                        <span className="block text-sm font-semibold text-primary-deep">{complete ? t('profile.complete') : t('profile.completion')}</span>
                        <span className="block text-xs text-muted-foreground">{t('profile.stepsDone', { done: profile.completed, total: profile.total })}</span>
                    </span>
                </Link>
            )}
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
