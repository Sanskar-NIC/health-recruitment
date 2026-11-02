import { Check, Download, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { ApplicationSummary } from '@/types/student';

const steps = [
    { stage: 'applied', label: 'Applied' },
    { stage: 'shortlisted', label: 'Shortlisted for written exam' },
    { stage: 'admit_card', label: 'Admit card' },
    { stage: 'result', label: 'Result' },
] as const;

/** Where the application stands after submission: shortlisting, admit card and result. */
export function ExamStatus({ application: a, compact }: { application: ApplicationSummary; compact?: boolean }) {
    const current = steps.findIndex((s) => s.stage === a.stage);

    // Once the result is out, a candidate who was not selected has nothing further to track.
    if (compact) {
        return (
            <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Stage: </span>
                <span className="font-medium">{a.result ? (a.result.selected ? 'Selected' : 'Result published') : steps[current].label}</span>
            </p>
        );
    }

    return (
        <section aria-label="Application progress" className="grid gap-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <ol className="grid gap-3 sm:grid-cols-4">
                {steps.map((s, i) => {
                    const done = i <= current;

                    return (
                        <li key={s.stage} className="flex items-center gap-2.5 text-sm">
                            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold', done ? 'border-success bg-success text-white' : 'text-muted-foreground')}>
                                {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                            </span>
                            <span className={cn(done ? 'font-medium' : 'text-muted-foreground')}>{s.label}</span>
                        </li>
                    );
                })}
            </ol>

            {a.stage === 'applied' && <p className="text-sm text-muted-foreground">Your application is with the department for scrutiny. If you are called for the written exam, it will show here.</p>}
            {a.stage === 'shortlisted' && <p className="text-sm">You have been shortlisted for the written exam. Your admit card will appear here once it is released.</p>}

            {a.admitCard && a.stage !== 'result' && (
                <div className="grid gap-4 rounded-xl border border-primary/20 bg-primary-tint/40 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <dl className="grid gap-1.5 text-sm">
                        <div className="flex gap-2"><dt className="w-32 text-muted-foreground">Roll No.</dt><dd className="font-mono font-semibold">{a.admitCard.rollNo}</dd></div>
                        {a.admitCard.examDate && <div className="flex gap-2"><dt className="w-32 text-muted-foreground">Exam date</dt><dd className="font-medium">{formatDate(a.admitCard.examDate)}</dd></div>}
                        {a.admitCard.reportingTime && <div className="flex gap-2"><dt className="w-32 text-muted-foreground">Reporting time</dt><dd className="font-medium">{a.admitCard.reportingTime}</dd></div>}
                        {a.admitCard.startTime && <div className="flex gap-2"><dt className="w-32 text-muted-foreground">Exam time</dt><dd className="font-medium">{a.admitCard.startTime} – {a.admitCard.endTime}</dd></div>}
                        {a.admitCard.centre && <div className="flex gap-2"><dt className="w-32 shrink-0 text-muted-foreground">Exam centre</dt><dd className="font-medium">{a.admitCard.centre.name}, {a.admitCard.centre.address}, {a.admitCard.centre.city}</dd></div>}
                    </dl>
                    <Button asChild><a href={a.admitCard.url}><Download className="size-4" aria-hidden="true" /> Download admit card</a></Button>
                </div>
            )}

            {a.result && (
                <div className={cn('flex items-start gap-3 rounded-xl border p-4', a.result.selected ? 'border-success/30 bg-success/5' : 'bg-muted/30')}>
                    <Trophy className={cn('mt-0.5 size-6 shrink-0', a.result.selected ? 'text-success' : 'text-muted-foreground')} aria-hidden="true" />
                    {a.result.selected ? (
                        <div>
                            <p className="text-lg font-semibold text-primary-deep">Congratulations, you are selected.</p>
                            {a.result.marksObtained !== null && a.result.marksTotal !== null && (
                                <p className="mt-1 text-sm">Marks: <span className="font-semibold">{a.result.marksObtained}</span> out of {a.result.marksTotal}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">Result published on {formatDate(a.result.publishedAt.slice(0, 10))}. The department will contact you about the next steps.</p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-semibold">Your name is not on the final selected list.</p>
                            <p className="mt-1 text-xs text-muted-foreground">Result published on {formatDate(a.result.publishedAt.slice(0, 10))}. Thank you for taking part.</p>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
