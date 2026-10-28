import {
    BellRing,
    Building2,
    Headset,
    MessageCircleQuestion,
    UserSearch,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PortalNavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const portalNav: PortalNavItem[] = [
    { label: 'Home', href: '/', icon: Building2 },
    { label: 'Recruitments', href: '/recruitments', icon: UserSearch },
    { label: 'Notifications', href: '/notifications', icon: BellRing },
    { label: 'FAQ', href: '/faq', icon: MessageCircleQuestion },
    { label: 'Contact', href: '/contact', icon: Headset },
];

export function formatDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);

    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function formatDmy(iso: string): string {
    const [y, m, d] = iso.split('-');

    return `${d}-${m}-${y}`;
}

/** Fixed "today" for mock data so statuses and timelines stay consistent. */
export const MOCK_TODAY = '2026-10-14';

export function calculateAge(dob: string, today: Date = new Date()): number | null {
    const birth = new Date(`${dob}T00:00:00`);

    if (Number.isNaN(birth.getTime())) {
        return null;
    }

    let age = today.getFullYear() - birth.getFullYear();
    const hadBirthday =
        today.getMonth() > birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
            today.getDate() >= birth.getDate());

    if (!hadBirthday) {
        age -= 1;
    }

    return age;
}
