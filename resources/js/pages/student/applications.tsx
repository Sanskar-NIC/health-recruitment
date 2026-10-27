import { Head, Link } from '@inertiajs/react';
import { ClipboardList, Download, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import { formatDate } from '@/lib/portal';
import type { ApplicationSummary } from '@/types/student';

export default function Applications({ applications }: { applications: ApplicationSummary[] }) {
    return (
        <div className="grid gap-6 px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title="My Applications" />
            <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary-deep"><ClipboardList className="size-6" aria-hidden="true" /> My Applications</h1>
                <p className="text-sm text-muted-foreground">Applications you have submitted on this portal.</p>
            </div>

            {applications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
                    <Inbox className="size-10" aria-hidden="true" />
                    <p>You have not applied for any post yet.</p>
                    <Button asChild><Link href="/recruitments">Browse recruitments</Link></Button>
                </div>
            ) : (
                <ul className="grid gap-4">
                    {applications.map((a) => (
                        <li key={a.id} className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="font-mono">{a.applicationNo}</Badge>
                                    <Badge className={a.status === 'submitted' ? 'bg-success text-white' : 'bg-gray-200 text-gray-700'}>{a.status === 'submitted' ? 'Submitted' : 'Withdrawn'}</Badge>
                                    {a.feeStatus === 'pending' && <Badge variant="secondary">Fee pending · ₹{a.feeAmount}</Badge>}
                                </div>
                                <p className="mt-2 text-lg font-semibold">{a.postName}</p>
                                <p className="text-sm text-muted-foreground">{a.title} · {a.advtNo}</p>
                                {a.submittedAt && <p className="text-xs text-muted-foreground">Applied on {formatDate(a.submittedAt.slice(0, 10))}</p>}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {a.status === 'submitted' && <Button asChild variant="outline"><Link href={`/student/applications/${a.id}`}>View</Link></Button>}
                                {a.status === 'submitted' && <Button asChild><a href={`/student/applications/${a.id}/download`}><Download className="size-4" aria-hidden="true" /> Download form</a></Button>}
                                {a.status === 'withdrawn' && <Button asChild variant="outline"><Link href={`/recruitments/${a.recruitmentId}`}>View advertisement</Link></Button>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

Applications.layout = (page: ReactNode) => <StudentPortalLayout>{page}</StudentPortalLayout>;
