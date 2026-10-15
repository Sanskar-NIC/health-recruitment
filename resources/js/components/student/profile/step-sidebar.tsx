import { Check, Lock } from 'lucide-react';
import { STEP_LABELS } from '@/lib/profile';
import { cn } from '@/lib/utils';

interface Props {
    current: number;
    completed: number[];
    /** Highest step index the student may open. */
    reachable: number;
    onSelect: (index: number) => void;
}

const icons = [1, 2, 3, 4, 5, 6];

export function StepSidebar({ current, completed, reachable, onSelect }: Props) {
    return (
        <aside aria-label="Form steps" className="rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-24">
            <p className="mb-3 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Form Steps</p>
            <ol className="grid gap-2">
                {STEP_LABELS.map((label, i) => {
                    const active = i === current;
                    const done = completed.includes(i + 1);
                    const locked = i > reachable;

                    return (
                        <li key={label}>
                            <button
                                type="button"
                                disabled={locked}
                                aria-current={active ? 'step' : undefined}
                                onClick={() => onSelect(i)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                    active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted',
                                    locked && 'cursor-not-allowed opacity-70 hover:bg-transparent',
                                )}
                            >
                                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm', active ? 'bg-white/20' : done ? 'bg-success/15 text-success' : 'bg-primary-tint text-primary')}>
                                    {done && !active ? <Check className="size-4" aria-hidden="true" /> : icons[i]}
                                </span>
                                <span className="flex-1">{label}</span>
                                {active && <span className="text-xs opacity-90">{i + 1}/{STEP_LABELS.length}</span>}
                                {locked && <Lock className="size-4" aria-label="Locked" />}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
