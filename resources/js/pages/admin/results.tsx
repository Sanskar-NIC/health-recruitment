import { Head, router } from '@inertiajs/react';
import { FileSpreadsheet, Inbox } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { key, ExcelImportDialog } from '@/components/admin/exam/excel-import';
import { PageTitle, PickRecruitmentHint, RecruitmentPicker } from '@/components/admin/exam/recruitment-picker';
import type { RecruitmentOption } from '@/components/admin/exam/recruitment-picker';
import { fmtDate } from '@/components/admin/recruitment/review';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Candidate {
    id: number;
    applicationNo: string;
    name: string;
    registrationNo: string;
    rollNo: string | null;
    postName: string;
    marksObtained: number | null;
    marksTotal: number | null;
    selected: boolean;
}

interface Edit {
    selected: boolean;
    obtained: string;
    total: string;
}

interface Props {
    recruitments: RecruitmentOption[];
    recruitment: number | null;
    publishedAt: string | null;
    candidates: Candidate[];
}

const str = (n: number | null) => (n === null ? '' : String(n));

export default function Results({ recruitments, recruitment, publishedAt, candidates }: Props) {
    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Results & Selection – Admin" />
            <PageTitle title="Results & Selection" description="Enter the selected candidates with their marks (obtained and out of), or import the department's Excel list. Candidates see nothing until you publish." />
            <RecruitmentPicker path="/admin/results" recruitments={recruitments} value={recruitment} />
            {recruitment ? <ResultTable key={recruitment} recruitment={recruitment} publishedAt={publishedAt} candidates={candidates} /> : <PickRecruitmentHint />}
        </div>
    );
}

function ResultTable({ recruitment, publishedAt, candidates }: { recruitment: number; publishedAt: string | null; candidates: Candidate[] }) {
    const initial = () => Object.fromEntries(candidates.map((c) => [c.id, { selected: c.selected, obtained: str(c.marksObtained), total: str(c.marksTotal) }])) as Record<number, Edit>;
    const [edits, setEdits] = useState<Record<number, Edit>>(initial);
    const [importing, setImporting] = useState(false);
    const [saving, setSaving] = useState(false);

    const selectedCount = Object.values(edits).filter((e) => e.selected).length;
    const dirty = candidates.some((c) => {
        const e = edits[c.id];

        return e.selected !== c.selected || e.obtained !== str(c.marksObtained) || e.total !== str(c.marksTotal);
    });

    const patch = (id: number, change: Partial<Edit>) => setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));

    const importMarks = (rows: Record<string, string>[], { defaultTotal }: { defaultTotal: string }) => {
        const index = new Map<string, number>();
        candidates.forEach((c) => [c.rollNo, c.registrationNo, c.applicationNo].forEach((v) => v && index.set(key(v), c.id)));

        const next = { ...edits };
        const found = new Set<number>();
        const unmatched: string[] = [];

        rows.forEach((r) => {
            const id = index.get(key(r.id));

            if (!id) {
                if (r.id.trim()) unmatched.push(r.id.trim());

                return;
            }

            found.add(id);
            next[id] = { selected: true, obtained: r.obtained.trim(), total: r.total.trim() || defaultTotal };
        });

        setEdits(next);

        return { matched: found.size, unmatched };
    };

    const rows = () => candidates.map((c) => ({
        id: c.id,
        selected: edits[c.id].selected,
        marks_obtained: edits[c.id].selected && edits[c.id].obtained !== '' ? Number(edits[c.id].obtained) : null,
        marks_total: edits[c.id].selected && edits[c.id].total !== '' ? Number(edits[c.id].total) : null,
    }));

    const save = () => {
        setSaving(true);
        router.post('/admin/results', { recruitment, rows: rows() }, { preserveScroll: true, onFinish: () => setSaving(false) });
    };

    const post = (action: 'publish' | 'unpublish') => router.post(`/admin/results/${action}`, { recruitment }, { preserveScroll: true });

    if (candidates.length === 0) {
        return (
            <div className="rounded-lg border bg-card py-14 text-center text-muted-foreground">
                <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                No shortlisted candidates for this recruitment.
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <p className="text-sm">
                    <span className="font-semibold">{selectedCount}</span> selected of {candidates.length} appeared
                    {publishedAt ? <span className="ml-2 font-medium text-success">· Published {fmtDate(publishedAt)}</span> : <span className="ml-2 text-muted-foreground">· Not published</span>}
                </p>
                <div className="ml-auto flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setImporting(true)}><FileSpreadsheet /> Import marks from Excel</Button>
                    <Button variant="outline" disabled={!dirty || saving} onClick={save}>Save</Button>
                    {publishedAt
                        ? <Button variant="outline" onClick={() => post('unpublish')}>Withdraw results</Button>
                        : <Button className="hover:bg-primary-hover" disabled={dirty || selectedCount === 0} onClick={() => post('publish')} title={dirty ? 'Save your changes first' : undefined}>Publish results</Button>}
                </div>
            </div>
            {publishedAt && dirty && <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">Results are live. Saved changes are visible to candidates immediately.</p>}

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Selected</TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Roll No.</TableHead>
                                <TableHead>Post</TableHead>
                                <TableHead className="w-36">Marks obtained</TableHead>
                                <TableHead className="w-36">Out of</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidates.map((c) => {
                                const e = edits[c.id];

                                return (
                                    <TableRow key={c.id} data-state={e.selected ? 'selected' : undefined}>
                                        <TableCell><Checkbox checked={e.selected} onCheckedChange={(v) => patch(c.id, { selected: v === true })} aria-label={`Mark ${c.name} as selected`} /></TableCell>
                                        <TableCell>
                                            <div className="font-medium">{c.name}</div>
                                            <div className="font-mono text-xs text-muted-foreground">{c.registrationNo}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm whitespace-nowrap">{c.rollNo ?? '–'}</TableCell>
                                        <TableCell className="max-w-64 truncate" title={c.postName}>{c.postName}</TableCell>
                                        <TableCell><Input type="number" min={0} step="any" disabled={!e.selected} value={e.obtained} onChange={(ev) => patch(c.id, { obtained: ev.target.value })} aria-label={`Marks obtained by ${c.name}`} /></TableCell>
                                        <TableCell><Input type="number" min={0} step="any" disabled={!e.selected} value={e.total} onChange={(ev) => patch(c.id, { total: ev.target.value })} aria-label={`Marks out of for ${c.name}`} /></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {importing && (
                <ExcelImportDialog
                    title="Import selected list with marks"
                    description="Every candidate found in the file is marked selected with the marks from the file. Others stay as they are. Nothing is saved until you press Save."
                    defaultTotal
                    fields={[
                        { key: 'id', label: 'Column with Roll No. / Registration No. / Application No.', required: true, hints: ['rollno', 'roll', 'registration', 'regno', 'applicationno'] },
                        { key: 'obtained', label: 'Marks obtained column', required: true, hints: ['obtained', 'marksobt', 'scored', 'marks', 'score'] },
                        { key: 'total', label: 'Marks out of column', hints: ['outof', 'total', 'maxmarks', 'maximum', 'fullmarks'] },
                    ]}
                    onApply={importMarks}
                    onClose={() => setImporting(false)}
                />
            )}
        </>
    );
}

Results.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
