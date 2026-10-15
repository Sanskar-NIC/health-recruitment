import { Link, usePage } from '@inertiajs/react';
import { Bell, BriefcaseMedical, CircleHelp, CircleUserRound, FileQuestion, Headset, House, KeyRound, LayoutDashboard, LogIn, Mail, Trophy, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface Crumb {
    label: string;
    href: string;
    icon: LucideIcon;
}

const pages: Record<string, Crumb[]> = {
    '/register': [{ label: 'Register', href: '/register', icon: UserPlus }],
    '/login': [{ label: 'Login', href: '/login', icon: LogIn }],
    '/forgot-password': [
        { label: 'Login', href: '/login', icon: LogIn },
        { label: 'Forgot Password', href: '/forgot-password', icon: KeyRound },
    ],
    '/recruitments': [{ label: 'Recruitments', href: '/recruitments', icon: BriefcaseMedical }],
    '/notifications': [{ label: 'Notifications', href: '/notifications', icon: Bell }],
    '/results': [{ label: 'Results', href: '/results', icon: Trophy }],
    '/admit-card': [{ label: 'Admit Card', href: '/admit-card', icon: FileQuestion }],
    '/answer-keys': [{ label: 'Answer Keys', href: '/answer-keys', icon: KeyRound }],
    '/faq': [{ label: 'FAQ', href: '/faq', icon: CircleHelp }],
    '/contact': [{ label: 'Contact', href: '/contact', icon: Mail }],
    '/student/dashboard': [],
    '/student/profile': [{ label: 'My Profile', href: '/student/profile', icon: CircleUserRound }],
    '/student/helpdesk': [{ label: 'Helpdesk', href: '/student/helpdesk', icon: Headset }],
};

/** Trail for the current page. Logged-in students start from their dashboard, visitors from Home. */
export function PageBreadcrumbs({ portal = false }: { portal?: boolean }) {
    const path = usePage().url.split('?')[0].replace(/\/+$/, '') || '/';
    const rest = pages[path];

    if (!rest) {
        return null;
    }

    const root: Crumb = portal ? { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard } : { label: 'Home', href: '/', icon: House };
    const trail = portal && path === '/student/dashboard' ? [root] : [root, ...rest];

    // The portal dashboard and the public home page are roots, so there is nothing to navigate.
    if (trail.length === 1 && !portal) {
        return null;
    }

    return (
        <div className="border-b bg-card/60 px-4 py-2.5 sm:px-8 lg:px-16 xl:px-24">
            <Breadcrumb aria-label="Breadcrumb">
                <BreadcrumbList>
                    {trail.map(({ label, href, icon: Icon }, i) => {
                        const last = i === trail.length - 1;

                        return (
                            <Fragment key={href}>
                                <BreadcrumbItem>
                                    {last ? (
                                        <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                                            <Icon className="size-4" aria-hidden="true" />
                                            {label}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={href} className="flex items-center gap-1.5">
                                                <Icon className="size-4" aria-hidden="true" />
                                                {label}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!last && <BreadcrumbSeparator />}
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
