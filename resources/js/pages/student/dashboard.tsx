import { Head, Link } from '@inertiajs/react';
import { BriefcaseMedical, CalendarClock, CheckCircle2, ClipboardCheck, FileText, IdCard, TicketCheck, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { StatusBadge } from '@/components/student/status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDmy } from '@/lib/portal';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { cn } from '@/lib/utils';
import type { Recruitment } from '@/types/student';

interface Props {
    student: { registration_no: string; full_name: string; created_at: string };
    stats: { current: number; applied: number; admitCards: number };
    recruitments: Recruitment[];
    studentProfile: { status: 'draft' | 'completed'; completed: number; total: number };
}

function StatCard({ title, value, hint, icon: Icon, href, tone }: { title: string; value: ReactNode; hint: string; icon: LucideIcon; href: string; tone: string }) {
    return (
        <Link href={href} className="group rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-primary-deep">{value}</p>
                </div>
                <span className={cn('flex size-12 items-center justify-center rounded-xl', tone)}>
                    <Icon className="size-6" aria-hidden="true" />
                </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground group-hover:text-primary">{hint}</p>
        </Link>
    );
}

export default function Dashboard({ student, stats, recruitments }: Omit<Props, 'studentProfile'>) {
    return (
        <div className="grid gap-6 px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title="Applicant Dashboard" />

            <div className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-6 shadow-sm md:flex-row md:items-center">
                <div>
                    <Badge variant="outline" className="border-primary bg-primary-tint font-mono font-semibold text-primary">
                        {student.registration_no}
                    </Badge>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-deep">Welcome, {student.full_name}</h1>
                    <p className="text-sm text-muted-foreground">Registered on {formatDmy(student.created_at.slice(0, 10))}</p>
                </div>
                <Button asChild>
                    <Link href="/student/profile"><UserCog className="mr-2 size-4" /> My Profile</Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Current Recruitments" value={stats.current} hint="View open advertisements" icon={BriefcaseMedical} href="/recruitments" tone="bg-primary-tint text-primary" />
                <StatCard title="Applied Recruitments" value={stats.applied} hint="Track your applications" icon={ClipboardCheck} href="/student/applications" tone="bg-emerald-100 text-emerald-700" />
                <StatCard title="Admit Cards" value={stats.admitCards} hint="Download when released" icon={TicketCheck} href="/admit-card" tone="bg-amber-100 text-amber-700" />
                <StatCard title="Application Status" value={stats.applied > 0 ? 'In progress' : 'No applications'} hint="Updates appear here after you apply" icon={CheckCircle2} href="/recruitments" tone="bg-sky-100 text-sky-700" />
            </div>

            <Panel title="Current Recruitments" icon={FileText} action={<Button asChild variant="secondary" size="sm"><Link href="/recruitments">View all</Link></Button>}>
                {recruitments.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No recruitments are open right now.</p>
                ) : (
                    <ul className="divide-y">
                        {recruitments.slice(0, 5).map((r) => (
                            <li key={r.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <IdCard className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                                    <div>
                                        <p className="font-medium">{r.postName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {r.advtNo} · {r.vacancies} posts · <CalendarClock className="inline size-3.5" aria-hidden="true" /> Last date {r.endDate}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusBadge status={r.status} />
                                    <Button asChild size="sm" variant="outline"><Link href={`/recruitments/${r.id}`}>View</Link></Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
