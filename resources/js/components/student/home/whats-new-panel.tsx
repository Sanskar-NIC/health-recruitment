import { Link } from '@inertiajs/react';
import { ArrowUpRight, BellOff, FileCheck, FilePen, FileText, IdCard, Info, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { NewBadge } from '@/components/student/new-badge';
import { formatDate } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { NotificationItem, NotificationType } from '@/types/student';

const types: Record<NotificationType, { label: string; icon: LucideIcon; tone: string }> = {
    advertisement: { label: 'Advertisement', icon: FileText, tone: 'bg-primary-tint text-primary' },
    corrigendum: { label: 'Corrigendum', icon: FilePen, tone: 'bg-warning/15 text-warning' },
    admit_card: { label: 'Admit card', icon: IdCard, tone: 'bg-success/15 text-success' },
    result: { label: 'Result', icon: Trophy, tone: 'bg-success/15 text-success' },
    answer_key: { label: 'Answer key', icon: FileCheck, tone: 'bg-link/15 text-link' },
    notice: { label: 'Notice', icon: Info, tone: 'bg-muted text-muted-foreground' },
};

const VISIBLE = 6;

function UpdateCard({ item }: { item: NotificationItem }) {
    const { label, icon: Icon, tone } = types[item.type];

    return (
        <li>
            <a
                href={item.url}
                className="group flex h-full gap-4 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
                <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tone)}>
                    <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-muted-foreground">{label}</span>
                        <span aria-hidden="true" className="text-border">•</span>
                        <time dateTime={item.date} className="text-muted-foreground">{formatDate(item.date)}</time>
                        {item.isNew && <NewBadge className="ml-auto" />}
                    </span>
                    <span className="mt-1.5 line-clamp-2 text-sm leading-snug font-medium text-foreground group-hover:text-primary">{item.title}</span>
                </span>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </a>
        </li>
    );
}

/** Latest notifications as filterable cards. */
export function WhatsNewPanel({ items }: { items: NotificationItem[] }) {
    const [filter, setFilter] = useState<NotificationType | 'all'>('all');

    const available = useMemo(() => [...new Set(items.map((i) => i.type))], [items]);
    const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
    const shown = filtered.slice(0, VISIBLE);
    const newCount = items.filter((i) => i.isNew).length;

    return (
        <section aria-labelledby="whats-new-heading">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <div className="mb-3 h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
                    <h2 id="whats-new-heading" className="flex items-center gap-3 text-2xl font-bold tracking-tight text-primary-deep">
                        Latest updates
                        {newCount > 0 && <span className="rounded-full bg-destructive px-2.5 py-0.5 text-xs font-semibold text-white">{newCount} new</span>}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">Advertisements, notices and announcements from the department</p>
                </div>
                <Link href="/notifications" className="inline-flex items-center gap-1 text-sm font-semibold text-link hover:underline">
                    View all updates <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
            </div>

            {available.length > 1 && (
                <div role="group" aria-label="Filter updates" className="mt-5 flex flex-wrap gap-2">
                    {(['all', ...available] as const).map((key) => (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={filter === key}
                            onClick={() => setFilter(key)}
                            className={cn(
                                'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                filter === key ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            )}
                        >
                            {key === 'all' ? 'All' : types[key].label}
                        </button>
                    ))}
                </div>
            )}

            {shown.length === 0 ? (
                <div className="mt-5 flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card px-6 py-12 text-center text-sm text-muted-foreground">
                    <BellOff className="size-6 text-primary/50" aria-hidden="true" />
                    No updates yet.
                </div>
            ) : (
                <ul className="mt-5 grid gap-3 md:grid-cols-2">
                    {shown.map((item) => <UpdateCard key={item.id} item={item} />)}
                </ul>
            )}
        </section>
    );
}
