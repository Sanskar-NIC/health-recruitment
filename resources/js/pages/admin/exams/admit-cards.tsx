import { Head, router } from '@inertiajs/react';
import { CheckCircle2, CircleAlert, FileDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageTitle, PickRecruitmentHint, RecruitmentPicker } from '@/components/admin/exam/recruitment-picker';
import type { RecruitmentOption } from '@/components/admin/exam/recruitment-picker';
import { fmtDate } from '@/components/admin/recruitment/review';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    recruitments: RecruitmentOption[];
    recruitment: number | null;
    scheduleSet: boolean;
    releasedAt: string | null;
    shortlisted: number;
    allocated: number;
    candidates: { id: number; name: string; registrationNo: string; rollNo: string | null; centre: string | null }[];
}

export default function AdmitCards({ recruitments, recruitment, scheduleSet, releasedAt, shortlisted, allocated, candidates }: Props) {
    const post = (action: 'release' | 'withdraw') => router.post(`/admin/exams/admit-cards/${action}`, { recruitment }, { preserveScroll: true });
    const ready = scheduleSet && shortlisted > 0 && allocated === shortlisted;

    const checks = [
        { ok: shortlisted > 0, text: `${shortlisted} candidate(s) shortlisted` },
        { ok: shortlisted > 0 && allocated === shortlisted, text: `${allocated} of ${shortlisted} have an exam centre` },
        { ok: scheduleSet, text: scheduleSet ? 'Exam schedule is set' : 'Exam schedule is not set' },
    ];

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Admit Cards – Admin" />
            <PageTitle title="Admit Cards" description="Release admit cards once every shortlisted candidate has a centre. Candidates download them from their portal." />
            <RecruitmentPicker path="/admin/exams/admit-cards" recruitments={recruitments} value={recruitment} />

            {!recruitment ? <PickRecruitmentHint /> : (
                <>
                    <div className="grid gap-4 rounded-lg border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
                        <ul className="grid gap-2 text-sm">
                            {checks.map((c) => (
                                <li key={c.text} className="flex items-center gap-2">
                                    {c.ok ? <CheckCircle2 className="size-4 text-success" aria-hidden="true" /> : <CircleAlert className="size-4 text-warning" aria-hidden="true" />}
                                    {c.text}
                                </li>
                            ))}
                            {releasedAt && <li className="font-medium text-success">Released to candidates on {fmtDate(releasedAt)}</li>}
                        </ul>
                        {releasedAt
                            ? <Button variant="outline" onClick={() => post('withdraw')}>Withdraw admit cards</Button>
                            : <Button className="hover:bg-primary-hover" disabled={!ready} onClick={() => post('release')}>Release admit cards</Button>}
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Candidate</TableHead>
                                        <TableHead>Roll No.</TableHead>
                                        <TableHead>Exam centre</TableHead>
                                        <TableHead className="w-28"><span className="sr-only">Preview</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.length === 0 ? (
                                        <TableRow><TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No candidates have an exam centre yet.</TableCell></TableRow>
                                    ) : candidates.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>
                                                <div className="font-medium">{c.name}</div>
                                                <div className="font-mono text-xs text-muted-foreground">{c.registrationNo}</div>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{c.rollNo}</TableCell>
                                            <TableCell>{c.centre}</TableCell>
                                            <TableCell><Button asChild variant="ghost" size="sm"><a href={`/admin/exams/admit-cards/${c.id}`} target="_blank" rel="noreferrer"><FileDown /> Preview</a></Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

AdmitCards.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
