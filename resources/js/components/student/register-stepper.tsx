import { Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Vertical step list; sits beside the form on large screens and above it on small ones. */
export function RegisterStepper({ steps, current, className }: { steps: { label: string; icon: LucideIcon }[]; current: number; className?: string }) {
    return (
        <nav aria-label="Registration progress" className={cn('rounded-2xl border bg-card p-4 shadow-sm', className)}>
            <p className="mb-3 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Form Steps</p>
            <ol className="grid gap-2">
                {steps.map(({ label, icon: Icon }, index) => {
                    const done = index < current;
                    const active = index === current;

                    return (
                        <li
                            key={label}
                            aria-current={active ? 'step' : undefined}
                            className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                                active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                                    active ? 'bg-white/20' : done ? 'bg-success/15 text-success' : 'bg-primary-tint text-primary',
                                )}
                            >
                                {done ? <Check className="size-4" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
                            </span>
                            <span className="flex-1">
                                {label}
                                <span className="sr-only">{done ? ' (completed)' : active ? ' (current step)' : ''}</span>
                            </span>
                            {active && <span className="text-xs opacity-90">{index + 1}/{steps.length}</span>}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
