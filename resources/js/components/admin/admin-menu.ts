import {
    BarChart3,
    FileText,
    Globe,
    Headset,
    KeyRound,
    LayoutDashboard,
    Layers,
    Megaphone,
    Send,
    Trophy,
    UserRound,
    Inbox,
    Ticket,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminMenuItem {
    title: string;
    href: string;
    icon: LucideIcon;
    children?: { title: string; href: string }[];
}

export interface AdminMenuGroup {
    label: string;
    items: AdminMenuItem[];
}

// Payments is intentionally not part of the structure yet.
export const adminMenu: AdminMenuGroup[] = [
    {
        label: 'Overview',
        items: [{ title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }],
    },
    {
        label: 'Recruitment',
        items: [
            {
                title: 'Recruitments',
                href: '/admin/recruitments',
                icon: Megaphone,
                children: [
                    { title: 'All Recruitments', href: '/admin/recruitments' },
                    { title: 'Create New', href: '/admin/recruitments/create' },
                ],
            },
            { title: 'Applications', href: '/admin/applications', icon: Inbox },
            {
                title: 'Exams & Admit Cards',
                href: '/admin/exams',
                icon: Ticket,
                children: [
                    { title: 'Exam Schedule', href: '/admin/exams/schedule' },
                    { title: 'Centres & Allocation', href: '/admin/exams/centres' },
                    { title: 'Admit Cards', href: '/admin/exams/admit-cards' },
                ],
            },
            { title: 'Answer Keys & Objections', href: '/admin/answer-keys', icon: KeyRound },
            { title: 'Results & Selection', href: '/admin/results', icon: Trophy },
            { title: 'Website Content', href: '/admin/website-content', icon: Globe },
            { title: 'Communication', href: '/admin/communication', icon: Send },
            { title: 'Grievances', href: '/admin/grievances', icon: Headset },
            { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
        ],
    },
    {
        label: 'Configuration',
        items: [
            {
                title: 'Masters',
                href: '/admin/masters',
                icon: Layers,
                children: [
                    { title: 'Posts', href: '/admin/masters/posts' },
                    { title: 'Exam Centres', href: '/admin/masters/exam-centres' },
                    { title: 'Councils', href: '/admin/masters/councils' },
                ],
            },
        ],
    },
    {
        label: 'Account',
        items: [
            { title: 'My Profile', href: '/admin/profile', icon: UserRound },
            { title: 'Activity Log', href: '/admin/activity-log', icon: FileText },
        ],
    },
];

export interface AdminCrumb {
    title: string;
    href?: string;
}

/** Breadcrumb trail for a path: [parent group (no link)] > page. Empty when unknown. */
export function findAdminTrail(path: string): AdminCrumb[] {
    for (const group of adminMenu) {
        for (const item of group.items) {
            const child = item.children?.find((c) => c.href === path);

            if (child) {
                return [{ title: item.title }, { title: child.title }];
            }

            if (!item.children && item.href === path) {
                return [{ title: item.title }];
            }
        }
    }

    // Detail pages such as /admin/recruitments/5 or /admin/recruitments/5/edit.
    const parent = adminMenu.flatMap((g) => g.items).find((i) => i.children && path.startsWith(`${i.href}/`));

    return parent ? [{ title: parent.title, href: parent.href }, { title: path.endsWith('/edit') ? 'Edit' : 'Details' }] : [];
}
