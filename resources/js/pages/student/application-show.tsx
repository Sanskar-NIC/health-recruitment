import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, CheckCircle2, Printer, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel } from '@/components/student/panel';
import { Button } from '@/components/ui/button';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { formatDate } from '@/lib/portal';
import type { ApplicationSummary, ImportantDate } from '@/types/student';

interface Props {
    application: ApplicationSummary & {
        snapshot: { name: string; dob: string; gender: string; category: string; pwbd: string; mobile: string; email: string } | null;
        dates: ImportantDate[];
    };
}

const feeLabel = { not_required: 'No fee', pending: 'Pending', paid: 'Paid' };

export default function ApplicationShow({ application: a }: Props) {
    const s = a.snapshot;

    const withdraw = () => {
        if (window.confirm(`Withdraw your application for ${a.postName}?`)) {
            router.post(`/student/applications/${a.id}/withdraw`);
        }
    };

    return (
        <div className="grid gap-6 px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title={`Application ${a.applicationNo}`} />

            <div className="flex flex-col gap-4 rounded-2xl border border-success/30 bg-success/5 p-6 sm:flex-row sm:items-center sm:justify-between print:border-0">
                <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 size-8 shrink-0 text-success" aria-hidden="true" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary-deep">Application submitted</h1>
                        <p className="text-sm text-muted-foreground">Keep your application number for all future reference.</p>
                        <p className="mt-1 font-mono text-lg font-semibold">{a.applicationNo}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 print:hidden">
                    <Button variant="outline" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" /> Print</Button>
                    {a.canWithdraw && <Button variant="ghost" className="text-destructive" onClick={withdraw}>Withdraw</Button>}
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-2">
                <Panel title="Application" icon={UserRound}>
                    <dl className="grid gap-2 text-sm">
                        {([
                            ['Advertisement', `${a.title} (${a.advtNo})`],
                            ['Post applied for', a.postName],
                            ['Applied on', a.submittedAt ? formatDate(a.submittedAt.slice(0, 10)) : '–'],
                            ['Category', a.category],
                            ['Application fee', a.feeAmount > 0 ? `₹${a.feeAmount} (${feeLabel[a.feeStatus]})` : feeLabel.not_required],
                            ...(s ? [['Name', s.name], ['Date of birth', formatDate(s.dob)], ['Mobile', s.mobile], ['Email', s.email]] : []),
                        ] as [string, string][]).map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-3 border-b pb-1.5 last:border-0">
                                <dt className="text-muted-foreground">{k}</dt>
                                <dd className="text-right font-medium">{v}</dd>
                            </div>
                        ))}
                    </dl>
                </Panel>

                <Panel title="What happens next" icon={CalendarDays}>
                    <ul className="grid gap-2 text-sm">
                        {a.dates.map((d) => (
                            <li key={d.label} className="flex justify-between gap-3 border-b pb-1.5 last:border-0">
                                <span className="text-muted-foreground">{d.label}</span>
                                <span className="font-medium">{formatDate(d.date)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-xs text-muted-foreground">Watch the Notifications page for admit cards, results and any corrigendum.</p>
                </Panel>
            </div>

            <div className="flex gap-2 print:hidden">
                <Button asChild variant="outline"><Link href="/student/applications">All my applications</Link></Button>
                <Button asChild variant="outline"><Link href={`/recruitments/${a.recruitmentId}`}>View advertisement</Link></Button>
            </div>
        </div>
    );
}

ApplicationShow.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
