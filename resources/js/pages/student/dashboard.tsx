import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BriefcaseMedical, CalendarClock, Check, ClipboardCheck, Download, TicketCheck, UserCog } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { ProfileRing } from '@/components/student/shell/profile-ring';
import { StatusBadge } from '@/components/student/status-badge';
import { Button } from '@/components/ui/button';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { formatDmy } from '@/lib/portal';
import { usePortalPrefs } from '@/lib/portal-prefs';
import type { TranslationKey } from '@/lib/portal-prefs';
import { cn } from '@/lib/utils';
import type { Recruitment } from '@/types/student';

interface DashboardApplication {
    id: number;
    applicationNo: string;
    advtNo: string | null;
    postName: string | null;
    status: 'submitted' | 'withdrawn' | 'rejected';
    submittedAt: string | null;
    closedAt: string | null;
}

interface Props {
    student: { registration_no: string; full_name: string; created_at: string };
    stats: { current: number; applied: number; admitCards: number };
    applications: DashboardApplication[];
    recruitments: Recruitment[];
}

function StatTile({ label, value, icon: Icon, href, tone }: { label: string; value: number; icon: LucideIcon; href: string; tone: string }) {
    return (
        <Link href={href} className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
            <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl', tone)}>
                <Icon className="size-6" aria-hidden="true" />
            </span>
            <span>
                <span className="block text-2xl leading-none font-bold tracking-tight text-primary-deep tabular-nums">{value}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{label}</span>
            </span>
            <ArrowRight className="ml-auto size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
        </Link>
    );
}

type StepState = 'done' | 'current' | 'upcoming' | 'stopped';

/** Stages an application moves through. Admit card and result are placeholders until those modules go live. */
function stagesFor(a: DashboardApplication): { key: TranslationKey; state: StepState; date?: string | null }[] {
    const stopped = a.status !== 'submitted';

    return [
        { key: 'step.submitted', state: 'done', date: a.submittedAt },
        stopped
            ? { key: a.status === 'rejected' ? 'step.rejected' : 'step.withdrawn', state: 'stopped', date: a.closedAt }
            : { key: 'step.review', state: 'current' },
        { key: 'step.admit', state: 'upcoming' },
        { key: 'step.result', state: 'upcoming' },
    ];
}

function Tracker({ application }: { application: DashboardApplication }) {
    const { t } = usePortalPrefs();
    const stages = stagesFor(application);

    return (
        <li className="rounded-2xl border bg-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="font-semibold break-words text-primary-deep">{application.postName}</p>
                    <p className="text-xs break-all text-muted-foreground">
                        {application.advtNo} · <span className="font-mono">{application.applicationNo}</span>
                    </p>
                </div>
                {application.status === 'submitted' && (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                        <a href={`/student/applications/${application.id}/download`}><Download className="size-4" aria-hidden="true" /> PDF</a>
                    </Button>
                )}
            </div>

            <ol className="mt-5 grid grid-cols-4 gap-2">
                {stages.map((stage, i) => (
                    <li key={stage.key} className="relative flex flex-col items-center text-center">
                        {i > 0 && (
                            <span
                                aria-hidden="true"
                                className={cn('absolute top-[15px] right-1/2 h-0.5 w-full', stage.state === 'upcoming' ? 'bg-border' : stage.state === 'stopped' ? 'bg-destructive' : 'bg-primary')}
                            />
                        )}
                        <span
                            className={cn(
                                'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                                stage.state === 'done' && 'border-primary bg-primary text-primary-foreground',
                                stage.state === 'current' && 'border-primary bg-card text-primary ring-4 ring-primary/20',
                                stage.state === 'stopped' && 'border-destructive bg-destructive text-destructive-foreground',
                                stage.state === 'upcoming' && 'border-border bg-card text-muted-foreground',
                            )}
                        >
                            {stage.state === 'done' ? <Check className="size-4" aria-hidden="true" /> : stage.state === 'stopped' ? '!' : i + 1}
                        </span>
                        <span className={cn('mt-2 text-xs leading-tight font-medium', stage.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground')}>{t(stage.key)}</span>
                        {stage.date && <span className="mt-0.5 text-[11px] text-muted-foreground">{formatDmy(stage.date)}</span>}
                    </li>
                ))}
            </ol>
        </li>
    );
}

export default function Dashboard({ student, stats, applications, recruitments }: Props) {
    const { t } = usePortalPrefs();
    const profile = (usePage().props as unknown as { studentProfile?: { status: string; completed: number; total: number } | null }).studentProfile;
    const complete = profile?.status === 'completed';

    return (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <Head title="Applicant Dashboard" />

            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-start to-brand-end p-6 text-white shadow-sm sm:p-8">
                <div aria-hidden="true" className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-white/10" />
                <div aria-hidden="true" className="pointer-events-none absolute -right-4 -bottom-24 size-56 rounded-full bg-white/5" />
                <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-xl">
                        <p className="font-mono text-xs tracking-wider opacity-80">{student.registration_no}</p>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t('dash.welcome')}, {student.full_name}</h1>
                        <p className="mt-1 text-sm opacity-90">{t('dash.subtitle')}</p>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur">
                            <ProfileRing completed={profile.completed} total={profile.total} size={72} onPrimary />
                            <div>
                                <p className="font-semibold">{complete ? t('dash.readyTitle') : t('dash.profileTitle')}</p>
                                <p className="mt-0.5 max-w-60 text-xs opacity-90">{complete ? t('dash.readyBody') : t('dash.profileBody')}</p>
                                {!complete && (
                                    <Button asChild size="sm" className="mt-3 rounded-full bg-white text-[#164e63] hover:bg-white/90">
                                        <Link href="/student/profile"><UserCog className="size-4" aria-hidden="true" /> {t('profile.continue')}</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatTile label={t('dash.stat.open')} value={stats.current} icon={BriefcaseMedical} href="/recruitments" tone="bg-primary-tint text-primary" />
                <StatTile label={t('dash.stat.applied')} value={stats.applied} icon={ClipboardCheck} href="/student/applications" tone="bg-success/15 text-success" />
                <StatTile label={t('dash.stat.admit')} value={stats.admitCards} icon={TicketCheck} href="/admit-card" tone="bg-warning/15 text-warning" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <section className="min-w-0 lg:col-span-3" aria-labelledby="tracker-title">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 id="tracker-title" className="text-lg font-semibold text-primary-deep">{t('dash.tracker')}</h2>
                        {applications.length > 0 && (
                            <Link href="/student/applications" className="text-sm font-medium text-link hover:underline">{t('dash.viewAll')}</Link>
                        )}
                    </div>
                    {applications.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
                            <span className="flex size-12 items-center justify-center rounded-full bg-primary-tint text-primary"><ClipboardCheck className="size-6" aria-hidden="true" /></span>
                            <p className="text-sm text-muted-foreground">{t('dash.tracker.empty')}</p>
                            <Button asChild className="rounded-full"><Link href="/recruitments">{t('dash.tracker.browse')}</Link></Button>
                        </div>
                    ) : (
                        <ul className="grid gap-4">
                            {applications.map((a) => <Tracker key={a.id} application={a} />)}
                        </ul>
                    )}
                </section>

                <section className="min-w-0 lg:col-span-2" aria-labelledby="open-title">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 id="open-title" className="text-lg font-semibold text-primary-deep">{t('dash.open')}</h2>
                        <Link href="/recruitments" className="text-sm font-medium text-link hover:underline">{t('dash.viewAll')}</Link>
                    </div>
                    {recruitments.length === 0 ? (
                        <p className="rounded-2xl border border-dashed bg-card px-6 py-10 text-center text-sm text-muted-foreground">No recruitments are open right now.</p>
                    ) : (
                        <ul className="grid gap-3">
                            {recruitments.slice(0, 5).map((r) => (
                                <li key={r.id}>
                                    <Link href={`/recruitments/${r.id}`} className="group block rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="min-w-0 font-medium break-words text-foreground group-hover:text-primary">{r.postName}</p>
                                            <StatusBadge status={r.status} />
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{r.advtNo} · {r.vacancies} {t('dash.posts')}</p>
                                        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-deep">
                                            <CalendarClock className="size-3.5" aria-hidden="true" /> {t('dash.lastDate')}: {r.endDate}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}

Dashboard.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
