import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import { RecruitmentActions } from '@/components/admin/recruitment/actions';
import { RecruitmentReview, fmtDate } from '@/components/admin/recruitment/review';
import { STATUS_LABEL, STATUS_TONE, hydrate } from '@/components/admin/recruitment/types';
import type { Options, RecruitmentEventItem, RecruitmentRecord } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Props {
    recruitment: RecruitmentRecord;
    events: RecruitmentEventItem[];
    options: Options;
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

function describe(e: RecruitmentEventItem) {
    const m = e.meta ?? {};

    if (e.type === 'extended') return `${fmtDate(m.from as string)} → ${fmtDate(m.to as string)}`;
    if (e.type === 'edited') return `Changed: ${((m.fields as string[]) ?? []).join(', ')}`;
    if (e.type === 'scheduled') return `Goes live ${fmtDate(m.publish_at as string)}`;
    if (m.duplicated_from) return `Duplicated from ${m.duplicated_from as string}`;

    return null;
}

export default function RecruitmentShow({ recruitment, events, options }: Props) {
    const form = hydrate(recruitment, options);
    const cancelled = recruitment.status === 'cancelled';

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-6">
            <Head title={`${recruitment.basic.advt_no} – Admin`} />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <Link href="/admin/recruitments" className="mb-1 inline-flex items-center gap-1 text-sm text-link hover:underline"><ArrowLeft className="size-4" /> All recruitments</Link>
                    <h1 className="text-2xl font-semibold text-primary-deep">{recruitment.basic.title}</h1>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        {recruitment.basic.advt_no}
                        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_TONE[recruitment.status])}>{STATUS_LABEL[recruitment.status]}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {!cancelled && <Button asChild variant="outline"><Link href={`/admin/recruitments/${recruitment.id}/edit`}><Pencil /> Edit</Link></Button>}
                    <RecruitmentActions
                        showView={false}
                        r={{ id: recruitment.id, advt_no: recruitment.basic.advt_no, status: recruitment.status, app_end: recruitment.dates.app_end || null, is_draft: recruitment.status === 'draft', is_cancelled: cancelled }}
                    />
                </div>
            </div>

            {recruitment.status_reason && (
                <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900"><strong>Reason on record:</strong> {recruitment.status_reason}</p>
            )}

            <RecruitmentReview form={form} options={options} advertisementUrl={recruitment.advertisement_url} syllabusUrl={recruitment.syllabus_url} />

            <section className="rounded-lg border bg-card p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-semibold text-primary-deep"><History className="size-4" aria-hidden="true" /> History</h2>
                <ol className="grid gap-3">
                    {events.map((e) => (
                        <li key={e.id} className="border-l-2 border-primary/40 pl-3 text-sm">
                            <p className="font-medium">{EVENT_LABEL[e.type]}</p>
                            {describe(e) && <p>{describe(e)}</p>}
                            {e.reason && <p className="text-muted-foreground">Reason: {e.reason}</p>}
                            <p className="text-xs text-muted-foreground">{e.by ?? 'System'} · {new Date(e.at).toLocaleString()}</p>
                        </li>
                    ))}
                </ol>
            </section>
        </div>
    );
}

RecruitmentShow.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
