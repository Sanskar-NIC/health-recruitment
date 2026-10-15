import { Check, Clock } from 'lucide-react';
import { SectionHeading } from '@/components/student/section-heading';
import { formatDate } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { ImportantDate, Recruitment } from '@/types/student';

export function ImportantDates({ dates, recruitment }: { dates: ImportantDate[]; recruitment: Recruitment | null }) {
    if (!recruitment || dates.length === 0) {
        return null;
    }

    const today = new Date().toISOString().slice(0, 10);

    return (
        <section aria-labelledby="dates-heading" className="border-y bg-card/60">
            <div className="mx-auto max-w-none sm:px-8 lg:px-16 xl:px-24 px-4 py-10">
                <SectionHeading
                    id="dates-heading"
                    title="Important Dates"
                    description={`${recruitment.postName} (${recruitment.advtNo})`}
                />
                <ol className="grid gap-0 lg:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
                    {dates.map((item, index) => {
                        const done = item.date <= today;
                        const last = index === dates.length - 1;

                        return (
                            <li key={item.label} className="relative flex gap-4 pb-6 lg:flex-col lg:items-center lg:gap-3 lg:pb-0 lg:text-center">
                                {!last && (
                                    <span
                                        aria-hidden="true"
                                        className={cn(
                                            'absolute top-9 left-[17px] h-[calc(100%-2.25rem)] w-0.5 lg:top-[17px] lg:left-1/2 lg:h-0.5 lg:w-full',
                                            done ? 'bg-primary' : 'bg-gray-300',
                                        )}
                                    />
                                )}
                                <span
                                    className={cn(
                                        'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full',
                                        done ? 'bg-primary text-white' : 'border-2 border-gray-300 bg-card text-gray-500',
                                    )}
                                >
                                    {done ? <Check className="size-5" aria-hidden="true" /> : <Clock className="size-4" aria-hidden="true" />}
                                    <span className="sr-only">{done ? 'Completed' : 'Upcoming'}</span>
                                </span>
                                <div className="lg:px-2">
                                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                                    <p className={cn('text-sm', done ? 'text-primary' : 'text-muted-foreground')}>
                                        {formatDate(item.date)}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
