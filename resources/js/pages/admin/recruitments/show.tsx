import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Briefcase, CalendarDays, FileText, History, Inbox, Info, Pencil, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { RecruitmentActions } from '@/components/admin/recruitment/actions';
import { AttachmentsSection, BasicSection, DatesSection, DocumentsSection, EligibilitySection, FeeSection, PostsSection, fmtDate, totalVacancies } from '@/components/admin/recruitment/review';
import { STATUS_LABEL, STATUS_TONE, hydrate } from '@/components/admin/recruitment/types';
import type { Options, RecruitmentEventItem, RecruitmentRecord } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Props {
    recruitment: RecruitmentRecord;
    events: RecruitmentEventItem[];
    options: Options;
    applicationsCount: number;
}

const EVENT_LABEL: Record<RecruitmentEventItem['type'], string> = {
    created: 'Created',
    edited: 'Edited',
    published: 'Published',
    scheduled: 'Scheduled for publishing',
    extended: 'Last date extended',
    closed: 'Closed early',
    cancelled: 'Cancelled',
};

const TABS = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'posts', label: 'Posts & vacancies', icon: Briefcase },
    { id: 'criteria', label: 'Eligibility & fee', icon: ShieldCheck },
    { id: 'history', label: 'History', icon: History },
] as const;
type TabId = (typeof TABS)[number]['id'];

function describe(e: RecruitmentEventItem) {
    const m = e.meta ?? {};

    if (e.type === 'extended') return `${fmtDate(m.from as string)} → ${fmtDate(m.to as string)}`;
    if (e.type === 'edited') return `Changed: ${((m.fields as string[]) ?? []).join(', ')}`;
    if (e.type === 'scheduled') return `Goes live ${fmtDate(m.publish_at as string)}`;
    if (m.duplicated_from) return `Duplicated from ${m.duplicated_from as string}`;

    return null;
}

function Stat({ icon: Icon, label, value, hint, href }: { icon: typeof Users; label: string; value: ReactNode; hint?: string; href?: string }) {
    const body = (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden="true" /></span>
            <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{label}</span>
                <span className="block text-xl leading-tight font-semibold text-primary-deep">{value}</span>
                {hint && <span className="block truncate text-xs text-muted-foreground">{hint}</span>}
            </span>
        </>
    );
    const cls = 'flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm';

    return href ? <Link href={href} className={cn(cls, 'transition hover:border-primary hover:bg-primary/5')}>{body}</Link> : <div className={cls}>{body}</div>;
}

export default function RecruitmentShow({ recruitment, events, options, applicationsCount }: Props) {
    const form = hydrate(recruitment, options);
    const cancelled = recruitment.status === 'cancelled';
    const [tab, setTab] = useState<TabId>('overview');
    const interview = form.basic.selection_mode === 'interview';
    const lastDate = interview && form.basic.apply_mode === 'walk_in' ? form.interview.date : form.dates.app_end;

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title={`${recruitment.basic.advt_no} – Admin`} />

            <Link href="/admin/recruitments" className="flex w-fit items-center gap-1 text-sm text-link hover:underline"><ArrowLeft className="size-4" aria-hidden="true" /> All recruitments</Link>

            <header className="flex flex-col gap-4 rounded-xl border bg-card p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium">{recruitment.basic.advt_no}</span>
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_TONE[recruitment.status])}>{STATUS_LABEL[recruitment.status]}</span>
                        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{interview ? 'Interview' : 'Written exam'}</span>
                    </div>
                    <h1 className="mt-2 text-xl leading-snug font-semibold text-primary-deep sm:text-2xl">{recruitment.basic.title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{recruitment.basic.directorate} · Notified {fmtDate(recruitment.basic.notification_date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    {!cancelled && <Button asChild variant="outline"><Link href={`/admin/recruitments/${recruitment.id}/edit`}><Pencil /> Edit</Link></Button>}
                    <RecruitmentActions
                        showView={false}
                        r={{ id: recruitment.id, advt_no: recruitment.basic.advt_no, status: recruitment.status, app_end: recruitment.dates.app_end || null, is_draft: recruitment.status === 'draft', is_cancelled: cancelled }}
                    />
                </div>
            </header>

            {recruitment.status_reason && (
                <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Reason on record:</strong> {recruitment.status_reason}</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={Users} label="Total vacancies" value={totalVacancies(form)} />
                <Stat icon={Briefcase} label="Post types" value={form.posts.length} hint={form.posts.map((p) => p.name).join(', ')} />
                <Stat icon={Inbox} label="Applications" value={applicationsCount} hint="View all applications" href={`/admin/applications?recruitment=${recruitment.id}`} />
                <Stat icon={CalendarDays} label={interview && form.basic.apply_mode === 'walk_in' ? 'Interview date' : 'Last date to apply'} value={fmtDate(lastDate)} />
            </div>

            <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border bg-card p-1 shadow-sm">
                {TABS.map((t) => (
                    <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                        className={cn('flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                            tab === t.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted')}>
                        <t.icon className="size-4" aria-hidden="true" /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className="grid items-start gap-5 xl:grid-cols-[1fr_26rem]">
                    <BasicSection form={form} />
                    <div className="grid gap-5">
                        <DatesSection form={form} />
                        <AttachmentsSection advertisementUrl={recruitment.advertisement_url} syllabusUrl={recruitment.syllabus_url} />
                    </div>
                </div>
            )}

            {tab === 'posts' && <PostsSection form={form} options={options} />}

            {tab === 'criteria' && (
                <div className="grid items-start gap-5 xl:grid-cols-2">
                    <EligibilitySection form={form} />
                    <div className="grid gap-5">
                        <FeeSection form={form} options={options} />
                        <DocumentsSection form={form} options={options} />
                    </div>
                </div>
            )}

            {tab === 'history' && (
                <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <h2 className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5 text-sm font-semibold text-primary-deep"><FileText className="size-4" aria-hidden="true" /> Activity history</h2>
                    <ol className="grid gap-4 p-4">
                        {events.map((e) => (
                            <li key={e.id} className="relative border-l-2 border-primary/40 pl-4 text-sm">
                                <span className="absolute top-1 -left-[5px] size-2 rounded-full bg-primary" aria-hidden="true" />
                                <p className="font-semibold">{EVENT_LABEL[e.type]}</p>
                                {describe(e) && <p>{describe(e)}</p>}
                                {e.reason && <p className="text-muted-foreground">Reason: {e.reason}</p>}
                                <p className="text-xs text-muted-foreground">{e.by ?? 'System'} · {new Date(e.at).toLocaleString()}</p>
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </div>
    );
}

RecruitmentShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
