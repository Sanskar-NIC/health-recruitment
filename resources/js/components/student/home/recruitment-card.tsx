import { Link } from '@inertiajs/react';
import { CalendarClock, CalendarX, Download, GraduationCap, IndianRupee, MapPin, UserCheck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NewBadge } from '@/components/student/new-badge';
import { StatusBadge } from '@/components/student/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/portal';
import { cn } from '@/lib/utils';
import type { Recruitment } from '@/types/student';

function InfoRow({ icon: Icon, label, children, className }: { icon: LucideIcon; label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary"><Icon className="size-3.5" aria-hidden="true" /></span>
            <dt className="sr-only">{label}</dt>
            <dd className={className}>{children}</dd>
        </div>
    );
}

/** Interview-only engagements show when and where to report instead of an application deadline. */
function InterviewInfo({ item }: { item: Recruitment }) {
    const iv = item.interview;

    if (!iv) {
        return null;
    }

    // The schedule may only exist in the advertisement text, so show that instead of "to be announced".
    if (!iv.date && !iv.venue && item.summary) {
        return (
            <InfoRow icon={UserCheck} label="Interview details">
                <span className="line-clamp-4 whitespace-pre-line">{item.summary}</span>
            </InfoRow>
        );
    }

    return (
        <>
            <InfoRow icon={UserCheck} label="Interview">
                Interview: {iv.date ? formatDate(iv.date) : 'To be announced'}{iv.dateTo && iv.dateTo !== iv.date ? ` to ${formatDate(iv.dateTo)}` : ''}{iv.time ? `, ${formatTime(iv.time)}` : ''}
            </InfoRow>
            {iv.venue && <InfoRow icon={MapPin} label="Venue">Venue: {iv.venue}</InfoRow>}
        </>
    );
}

function formatTime(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);

    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

function ModeBadge({ item }: { item: Recruitment }) {
    if (item.selectionMode !== 'interview') {
        return null;
    }

    return <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">{item.applyMode === 'walk_in' ? 'Walk-in interview' : 'Interview'}</span>;
}

export function RecruitmentCard({ item }: { item: Recruitment }) {
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)] transition duration-200 motion-safe:hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_28px_-8px_rgb(14_116_144/0.35)]">
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.advtNo}</span>
                <StatusBadge status={item.status} />
                <ModeBadge item={item} />
                {item.isNew && <NewBadge />}
            </div>
            <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground">{item.postName}</h3>
            <p className="text-sm text-muted-foreground">{item.department}</p>

            <dl className="mt-5 grid gap-3 rounded-xl bg-muted/60 p-4">
                <InfoRow icon={Users} label="Vacancies">{item.vacancies} vacancies</InfoRow>
                <InfoRow icon={GraduationCap} label="Qualification">{item.qualification}</InfoRow>
                <InfoRow icon={CalendarClock} label="Age limit">{item.ageLimit}</InfoRow>
                <InfoRow icon={IndianRupee} label="Monthly salary">{item.payScale}</InfoRow>
                {item.interview ? <InterviewInfo item={item} /> : null}
                {item.applyMode !== 'walk_in' && (
                    <InfoRow
                        icon={CalendarX}
                        label="Last date"
                        className={cn(item.status === 'closing_soon' && 'font-medium text-destructive')}
                    >
                        Last date: {formatDate(item.endDate)}
                    </InfoRow>
                )}
            </dl>

            <Actions item={item} className="mt-auto pt-5" />
        </article>
    );
}

/** Compact horizontal variant used by the list view. */
export function RecruitmentRow({ item }: { item: Recruitment }) {
    return (
        <article className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)] transition duration-200 hover:border-primary/40 hover:shadow-[0_8px_20px_-8px_rgb(14_116_144/0.35)] lg:flex-row lg:items-center">
            <div className="min-w-0 lg:w-72 lg:shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.advtNo}</span>
                    <StatusBadge status={item.status} />
                    <ModeBadge item={item} />
                    {item.isNew && <NewBadge />}
                </div>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground">{item.postName}</h3>
                <p className="text-sm text-muted-foreground">{item.department}</p>
            </div>

            <dl className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                <InfoRow icon={Users} label="Vacancies">{item.vacancies} vacancies</InfoRow>
                <InfoRow icon={CalendarClock} label="Age limit">{item.ageLimit}</InfoRow>
                <InfoRow icon={GraduationCap} label="Qualification">{item.qualification}</InfoRow>
                <InfoRow icon={IndianRupee} label="Monthly salary">{item.payScale}</InfoRow>
                {item.interview ? <InterviewInfo item={item} /> : null}
                {item.applyMode !== 'walk_in' && (
                    <InfoRow icon={CalendarX} label="Last date" className={cn(item.status === 'closing_soon' && 'font-medium text-destructive')}>
                        Last date: {formatDate(item.endDate)}
                    </InfoRow>
                )}
            </dl>

            <Actions item={item} className="lg:w-80 lg:shrink-0" />
        </article>
    );
}

function Actions({ item, className }: { item: Recruitment; className?: string }) {
    const open = item.status === 'open' || item.status === 'closing_soon';

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {item.applyMode === 'walk_in' && open && (
                <p className="basis-full rounded-xl bg-violet-50 px-3 py-2.5 text-center text-sm font-medium text-violet-800">No application needed. Report in person.</p>
            )}
            <Button asChild variant="outline" className="h-11 flex-1 rounded-xl border-primary/40 text-primary hover:bg-primary-tint hover:text-primary-hover">
                <a href={item.pdfUrl}>
                    <Download className="size-4" aria-hidden="true" />
                    Advertisement
                </a>
            </Button>
            {item.applyMode !== 'walk_in' && (
                <Button asChild className="h-11 flex-1 rounded-xl hover:bg-primary-hover">
                    <Link href={`/recruitments/${item.id}`}>{open ? 'View & Apply' : 'View Details'}</Link>
                </Button>
            )}
            {item.applyMode === 'walk_in' && (
                <Button asChild variant="secondary" className="h-11 flex-1 rounded-xl">
                    <Link href={`/recruitments/${item.id}`}>View Details</Link>
                </Button>
            )}
        </div>
    );
}
