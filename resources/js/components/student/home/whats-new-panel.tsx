import { Link } from '@inertiajs/react';
import { Bell, FileCheck, FilePen, FileText, IdCard, Info, Pause, Play, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { NewBadge } from '@/components/student/new-badge';
import { Panel } from '@/components/student/panel';
import { formatDate } from '@/lib/portal';
import type { NotificationItem, NotificationType } from '@/types/student';

const typeIcon: Record<NotificationType, LucideIcon> = {
    advertisement: FileText,
    corrigendum: FilePen,
    admit_card: IdCard,
    result: Trophy,
    answer_key: FileCheck,
    notice: Info,
};

function Row({ item, hidden }: { item: NotificationItem; hidden?: boolean }) {
    const Icon = typeIcon[item.type];

    return (
        <li className="flex items-start gap-3 border-b px-5 py-3.5 transition-colors hover:bg-primary-tint/50">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                <Icon className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
                <a href={item.url} tabIndex={hidden ? -1 : undefined} className="text-sm font-medium text-link hover:underline">
                    {item.title}
                </a>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(item.date)}</p>
            </div>
            {item.isNew && <NewBadge className="mt-0.5" />}
        </li>
    );
}

export function WhatsNewPanel({ items }: { items: NotificationItem[] }) {
    const reduceMotion = useReducedMotion();
    const [paused, setPaused] = useState(false);
    // The marquee repeats the list for a seamless loop, so only use it when the list overflows the panel.
    const scrolls = !reduceMotion && items.length > 6;

    return (
        <Panel
            title="What's New"
            icon={Bell}
            className="flex flex-col"
            bodyClassName="flex flex-1 flex-col p-0"
            action={
                <div className="flex items-center gap-3">
                    {scrolls && (
                        <button
                            type="button"
                            onClick={() => setPaused((p) => !p)}
                            aria-label={paused ? 'Resume scrolling' : 'Pause scrolling'}
                            className="inline-flex size-8 items-center justify-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white"
                        >
                            {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
                        </button>
                    )}
                    <Link href="/notifications" className="text-sm font-medium text-white underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-white">
                        View All
                    </Link>
                </div>
            }
        >
            {items.length === 0 ? (
                <p className="flex h-40 items-center justify-center px-5 text-sm text-muted-foreground">No notifications yet.</p>
            ) : !scrolls ? (
                <div className="flex max-h-[32rem] flex-1 flex-col overflow-y-auto">
                    <ul>{items.map((item) => <Row key={item.id} item={item} />)}</ul>
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-8 text-center text-sm text-muted-foreground">
                        <Bell className="size-6 text-primary/40" aria-hidden="true" />
                        You&apos;re all caught up.
                    </div>
                </div>
            ) : (
                <div className="ticker h-[32rem] overflow-hidden" data-paused={paused}>
                    <ul className="animate-marquee-y">
                        {items.map((item) => <Row key={item.id} item={item} />)}
                        {items.map((item) => (
                            <span key={`dup-${item.id}`} aria-hidden="true" className="contents">
                                <Row item={item} hidden />
                            </span>
                        ))}
                    </ul>
                </div>
            )}
        </Panel>
    );
}
