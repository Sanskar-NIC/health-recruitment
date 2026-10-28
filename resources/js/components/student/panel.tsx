import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PanelProps {
    title: string;
    icon: LucideIcon;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    bodyClassName?: string;
}

export function Panel({
    title,
    icon: Icon,
    action,
    children,
    className,
    bodyClassName,
}: PanelProps) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)]',
                className,
            )}
        >
            <header className="flex min-h-14 items-center gap-3 bg-brand-start px-5 py-3 text-white">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/15"><Icon className="size-4.5" aria-hidden="true" /></span>
                <h2 className="flex-1 text-base font-semibold">{title}</h2>
                {action}
            </header>
            <div className={cn('p-5', bodyClassName)}>{children}</div>
        </section>
    );
}
