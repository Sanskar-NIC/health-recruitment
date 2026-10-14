import { cn } from '@/lib/utils';

export function NewBadge({ className }: { className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded bg-destructive px-1.5 py-0.5 text-[10px] leading-none font-semibold tracking-wide text-white uppercase motion-safe:animate-pulse',
                className,
            )}
        >
            New
        </span>
    );
}
