import { Link } from '@inertiajs/react';
import { ChevronDown, FileDown, FileText, Hash, SquarePen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { NewBadge } from '@/components/student/new-badge';
import { formatDmy } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { NotificationEntry, NotificationLinkKind } from '@/types/student';

const kindIcon: Record<NotificationLinkKind, LucideIcon> = {
    download: FileDown,
    apply: SquarePen,
    form: FileText,
};

export function NotificationItem({ entry, defaultOpen = false }: { entry: NotificationEntry; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    const closed = entry.status === 'closed';
    const panelId = `notification-${entry.id}`;

    return (
        <article className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)]">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full flex-col gap-4 bg-primary p-5 text-left text-white focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white md:flex-row md:items-center md:justify-between md:p-6"
            >
                <div className="min-w-0 space-y-2">
                    <h2 className="text-sm leading-snug font-medium uppercase sm:text-lg">
                        {entry.title} <span className="text-amber-300">({entry.highlight})</span>
                        {entry.isNew && <NewBadge className="ml-2 align-middle" />}
                    </h2>
                    <p className="flex items-center gap-1.5 text-xs font-medium uppercase sm:text-sm">
                        <Hash className="size-4 shrink-0 text-cyan-100" aria-hidden="true" />
                        Advertisement No: {entry.advtNo}
                    </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3">
                    <span
                        className={cn(
                            'rounded-lg px-3 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm font-semibold tracking-wide uppercase sm:text-base',
                            closed ? 'bg-white/20 text-white' : 'bg-white text-primary-deep',
                        )}
                    >
                        {closed ? 'Closed' : `Last date to apply: ${formatDmy(entry.lastDate)}`}
                    </span>
                    <ChevronDown className={cn('size-6 shrink-0 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                </div>
            </button>
            {open && (
                <ul id={panelId} className="divide-y px-5 py-3 md:px-6">
                    {entry.links.map((link) => {
                        const Icon = kindIcon[link.kind];
                        const linkClass = 'text-sm font-medium text-link hover:underline sm:text-base';

                        return (
                            <li key={link.id} className="flex flex-wrap items-center gap-3 py-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                                    <Icon className="size-4.5" aria-hidden="true" />
                                </span>
                                {link.url.startsWith('#') ? (
                                    <a href={link.url} className={linkClass}>{link.label}</a>
                                ) : (
                                    <Link href={link.url} className={linkClass}>{link.label}</Link>
                                )}
                                {link.meta && <span className="text-xs text-muted-foreground">{link.meta}</span>}
                                {link.isNew && <NewBadge />}
                            </li>
                        );
                    })}
                </ul>
            )}
        </article>
    );
}
