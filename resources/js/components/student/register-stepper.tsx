import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RegisterStepper({ steps, current }: { steps: string[]; current: number }) {
    return (
        <nav aria-label="Registration progress" className="mb-8">
            <ol className="flex items-start">
                {steps.map((label, index) => {
                    const done = index < current;
                    const active = index === current;

                    return (
                        <li key={label} aria-current={active ? 'step' : undefined} className="relative flex flex-1 flex-col items-center gap-2 text-center">
                            {index > 0 && (
                                <span
                                    aria-hidden="true"
                                    className={cn('absolute top-4.5 right-1/2 h-0.5 w-full', index <= current ? 'bg-primary' : 'bg-gray-200')}
                                />
                            )}
                            <span
                                className={cn(
                                    'relative z-10 flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold',
                                    done && 'border-primary bg-primary text-white',
                                    active && 'border-primary bg-card text-primary ring-4 ring-primary-tint',
                                    !done && !active && 'border-gray-300 bg-card text-gray-500',
                                )}
                            >
                                {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                            </span>
                            <span className={cn('px-1 text-xs sm:text-sm', active ? 'font-semibold text-primary-deep' : 'text-muted-foreground')}>
                                {label}
                                <span className="sr-only">{done ? ' (completed)' : active ? ' (current step)' : ''}</span>
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
