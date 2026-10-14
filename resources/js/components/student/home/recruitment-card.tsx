import { Link } from '@inertiajs/react';
import { CalendarClock, CalendarX, Download, GraduationCap, IndianRupee, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/animate-ui/components/radix/tooltip';
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

const accent = {
    open: 'bg-success',
    closing_soon: 'bg-warning',
    upcoming: 'bg-primary',
    closed: 'bg-gray-300',
} as const;

export function RecruitmentCard({ item }: { item: Recruitment }) {
    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)] transition duration-200 motion-safe:hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_12px_28px_-8px_rgb(14_116_144/0.35)]">
            <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-1', accent[item.status])} />
            <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.advtNo}</span>
                <StatusBadge status={item.status} />
                {item.isNew && <NewBadge />}
            </div>
            <h3 className="mt-3 text-xl font-semibold leading-snug text-foreground">{item.postName}</h3>
            <p className="text-sm text-muted-foreground">{item.department}</p>

            <dl className="mt-5 grid gap-3 rounded-xl bg-muted/60 p-4">
                <InfoRow icon={Users} label="Vacancies">{item.vacancies} vacancies</InfoRow>
                <InfoRow icon={GraduationCap} label="Qualification">{item.qualification}</InfoRow>
                <InfoRow icon={CalendarClock} label="Age limit">{item.ageLimit}</InfoRow>
                <InfoRow icon={IndianRupee} label="Pay scale">{item.payScale}</InfoRow>
                <InfoRow
                    icon={CalendarX}
                    label="Last date"
                    className={cn(item.status === 'closing_soon' && 'font-medium text-destructive')}
                >
                    Last date: {formatDate(item.endDate)}
                </InfoRow>
            </dl>

            <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <Button asChild variant="outline" className="h-11 flex-1 rounded-xl border-primary/40 text-primary hover:bg-primary-tint hover:text-primary-hover">
                    <a href={item.pdfUrl}>
                        <Download className="size-4" aria-hidden="true" />
                        View Advertisement
                    </a>
                </Button>
                {item.status === 'upcoming' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span tabIndex={0} className="inline-flex flex-1 rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                                <Button disabled aria-label={`Apply Now for ${item.postName} (not open yet)`} className="h-11 w-full rounded-xl">
                                    Apply Now
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>Applications not open yet</TooltipContent>
                    </Tooltip>
                )}
                {(item.status === 'open' || item.status === 'closing_soon') && (
                    <Button asChild className="h-11 flex-1 rounded-xl hover:bg-primary-hover">
                        <Link href="/login">Apply Now</Link>
                    </Button>
                )}
            </div>
        </article>
    );
}
