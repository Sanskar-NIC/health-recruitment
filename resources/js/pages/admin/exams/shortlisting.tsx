import { Head, router } from '@inertiajs/react';
import { FileSpreadsheet, Inbox, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { key, ExcelImportDialog } from '@/components/admin/exam/excel-import';
import { PageTitle, PickRecruitmentHint, RecruitmentPicker } from '@/components/admin/exam/recruitment-picker';
import type { RecruitmentOption } from '@/components/admin/exam/recruitment-picker';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Row {
    id: number;
    applicationNo: string;
    name: string;
    registrationNo: string;
    mobile: string;
    email: string;
    postName: string;
    category: string;
    shortlisted: boolean;
}

interface Props {
    recruitments: RecruitmentOption[];
    recruitment: number | null;
    applications: Row[];
    locked: boolean;
}

export default function Shortlisting({ recruitments, recruitment, applications, locked }: Props) {
    // Remounted per recruitment so the ticks always start from what is saved.
    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Shortlisting – Admin" />
            <PageTitle title="Shortlisting for written exam" description="After the department scrutinises the applications, tick the candidates called for the written exam. You can tick by hand or import the department's Excel list." />
            <RecruitmentPicker path="/admin/exams/shortlisting" recruitments={recruitments} value={recruitment} />
            {recruitment ? <ShortlistTable key={recruitment} recruitment={recruitment} applications={applications} locked={locked} /> : <PickRecruitmentHint />}
        </div>
    );
}

function ShortlistTable({ recruitment, applications, locked }: { recruitment: number; applications: Row[]; locked: boolean }) {
    const [ticked, setTicked] = useState(() => new Set(applications.filter((a) => a.shortlisted).map((a) => a.id)));
    const [search, setSearch] = useState('');
    const [importing, setImporting] = useState(false);
    const [saving, setSaving] = useState(false);

    const saved = useMemo(() => new Set(applications.filter((a) => a.shortlisted).map((a) => a.id)), [applications]);
    const dirty = ticked.size !== saved.size || [...ticked].some((id) => !saved.has(id));

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();

        return q ? applications.filter((a) => [a.name, a.registrationNo, a.applicationNo, a.mobile, a.postName].some((v) => v.toLowerCase().includes(q))) : applications;
    }, [applications, search]);

    const allVisible = visible.length > 0 && visible.every((a) => ticked.has(a.id));

    const toggle = (ids: number[], on: boolean) => setTicked((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (on ? next.add(id) : next.delete(id)));

        return next;
    });

    // The sheet may carry a registration no., application no., e-mail or mobile; any of them identifies a candidate.
    const importList = (rows: Record<string, string>[]) => {
        const index = new Map<string, number>();
        applications.forEach((a) => [a.registrationNo, a.applicationNo, a.email, a.mobile].forEach((v) => index.set(key(v), a.id)));

        const found = new Set<number>();
        const unmatched: string[] = [];

        rows.forEach((r) => {
            const id = index.get(key(r.id));

            if (id) found.add(id);
            else if (r.id.trim()) unmatched.push(r.id.trim());
        });

        setTicked((prev) => new Set([...prev, ...found]));

        return { matched: found.size, unmatched };
    };

    const save = () => {
        setSaving(true);
        router.post('/admin/exams/shortlisting', { recruitment, ids: [...ticked] }, { preserveScroll: true, onFinish: () => setSaving(false) });
    };

    if (applications.length === 0) {
        return (
            <div className="rounded-lg border bg-card py-14 text-center text-muted-foreground">
                <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                No active applications for this recruitment yet.
            </div>
        );
    }

    return (
        <>
            {locked && <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">Results are already published for this recruitment, so the shortlist is locked. Withdraw the results first to change it.</p>}

            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <div className="relative min-w-60 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input className="pl-9" placeholder="Search by name, registration no., application no. or mobile" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search candidates" />
                </div>
                <Button variant="outline" disabled={locked} onClick={() => setImporting(true)}><FileSpreadsheet /> Import from Excel</Button>
                <Button className="hover:bg-primary-hover" disabled={locked || !dirty || saving} onClick={save}>Save shortlist ({ticked.size})</Button>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"><Checkbox checked={allVisible} disabled={locked} onCheckedChange={(v) => toggle(visible.map((a) => a.id), v === true)} aria-label="Select all listed candidates" /></TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Application No.</TableHead>
                                <TableHead>Post</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Mobile</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {visible.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No candidates match your search.</TableCell></TableRow>
                            ) : visible.map((a) => (
                                <TableRow key={a.id} data-state={ticked.has(a.id) ? 'selected' : undefined}>
                                    <TableCell><Checkbox checked={ticked.has(a.id)} disabled={locked} onCheckedChange={(v) => toggle([a.id], v === true)} aria-label={`Shortlist ${a.name}`} /></TableCell>
                                    <TableCell>
                                        <div className="font-medium">{a.name}</div>
                                        <div className="font-mono text-xs text-muted-foreground">{a.registrationNo}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm whitespace-nowrap">{a.applicationNo}</TableCell>
                                    <TableCell className="max-w-64 truncate" title={a.postName}>{a.postName}</TableCell>
                                    <TableCell>{a.category}</TableCell>
                                    <TableCell className="whitespace-nowrap">{a.mobile}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">{ticked.size} of {applications.length} candidate(s) ticked{dirty ? ' · unsaved changes' : ''}. Un-ticking a saved candidate also removes their centre, roll number and marks.</p>

            {importing && (
                <ExcelImportDialog
                    title="Import shortlist from Excel"
                    description="Candidates found in the file are ticked on this page. Nothing is saved until you press Save shortlist."
                    fields={[{ key: 'id', label: 'Column with Registration No. / Application No. / Email / Mobile', required: true, hints: ['registration', 'regno', 'applicationno', 'appno', 'email', 'mobile'] }]}
                    onApply={importList}
                    onClose={() => setImporting(false)}
                />
            )}
        </>
    );
}

Shortlisting.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
