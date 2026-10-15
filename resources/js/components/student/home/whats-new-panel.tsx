import { Link } from '@inertiajs/react';
import { Bell, FileCheck, FilePen, FileText, IdCard, Info, Pause, Play, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { NewBadge } from '@/components/student/new-badge';
import { Panel } from '@/components/student/panel';
import { ScrollArea } from '@/components/ui/scroll-area';
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

    return (
        <Panel
            title="What's New"
            icon={Bell}
            bodyClassName="p-0"
            action={
                <div className="flex items-center gap-3">
                    {!reduceMotion && (
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
            {reduceMotion ? (
                <ScrollArea className="h-[32rem]">
                    <ul>{items.map((item) => <Row key={item.id} item={item} />)}</ul>
                </ScrollArea>
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
