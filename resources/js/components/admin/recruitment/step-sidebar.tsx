import { Check } from 'lucide-react';
import { STEPS } from '@/components/admin/recruitment/types';
import { cn } from '@/lib/utils';

interface Props {
    current: number;
    /** Steps the admin has already opened. */
    visited: ReadonlySet<number>;
    /** Steps that contain validation errors. */
    errorSteps: ReadonlySet<number>;
    onSelect: (index: number) => void;
}

/** Vertical step helper, same look as the applicant profile form. */
export function RecruitmentStepSidebar({ current, visited, errorSteps, onSelect }: Props) {
    return (
        <aside aria-label="Recruitment steps" className="rounded-2xl border bg-card p-4 shadow-sm lg:sticky lg:top-20">
            <p className="mb-3 px-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Recruitment Steps</p>
            <ol className="grid gap-2">
                {STEPS.map((label, i) => {
                    const active = i === current;
                    const hasError = errorSteps.has(i);
                    const done = visited.has(i) && !hasError && i !== current;

                    return (
                        <li key={label}>
                            <button
                                type="button"
                                aria-current={active ? 'step' : undefined}
                                onClick={() => onSelect(i)}
                                className={cn(
                                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                    active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted',
                                    hasError && !active && 'text-destructive',
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-9 shrink-0 items-center justify-center rounded-full text-sm',
                                        active ? 'bg-white/20' : hasError ? 'bg-destructive/15 text-destructive' : done ? 'bg-success/15 text-success' : 'bg-primary-tint text-primary',
                                    )}
                                >
                                    {hasError && !active ? '!' : done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                                </span>
                                <span className="flex-1">{label}</span>
                                {active && <span className="text-xs opacity-90">{i + 1}/{STEPS.length}</span>}
                            </button>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
