import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { STATUS_TONE } from '@/components/admin/application/status';
import { fmtDate } from '@/components/admin/recruitment/review';
import { NativeSelect } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Row {
    id: number;
    applicationNo: string;
    status: 'submitted' | 'withdrawn' | 'rejected';
    category: string;
    submittedAt: string | null;
    candidateName: string;
    registrationNo: string;
    mobile: string;
    recruitmentId: number;
    advtNo: string;
    title: string;
    postName: string;
}

interface Props {
    applications: Row[];
    meta: { page: number; last_page: number; total: number };
    filters: { search: string; status: string; recruitment: number | '' };
    recruitments: { id: number; advt_no: string }[];
}

export default function ApplicationsIndex({ applications, meta, filters, recruitments }: Props) {
    const [search, setSearch] = useState(filters.search);

    const visit = (next: Partial<Props['filters']> & { page?: number }) =>
        router.get('/admin/applications', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    useEffect(() => {
        if (search === filters.search) return;

        const t = setTimeout(() => visit({ search, page: 1 }), 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const filtered = !!(filters.search || filters.status || filters.recruitment);

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Applications – Admin" />

            <div>
                <h1 className="text-2xl font-semibold text-primary-deep">Applications</h1>
                <p className="text-sm text-muted-foreground">Applications submitted by candidates across all recruitments.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <div className="relative min-w-60 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input className="pl-9" placeholder="Search by application no., name, registration no., mobile or Advt. No." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search applications" />
                </div>
                <NativeSelect className="w-52" value={filters.recruitment} onChange={(e) => visit({ recruitment: e.target.value ? Number(e.target.value) : '', page: 1 })} aria-label="Filter by recruitment">
                    <option value="">All recruitments</option>
                    {recruitments.map((r) => <option key={r.id} value={r.id}>{r.advt_no}</option>)}
                </NativeSelect>
                <NativeSelect className="w-40" value={filters.status} onChange={(e) => visit({ status: e.target.value, page: 1 })} aria-label="Filter by status">
                    <option value="">All statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="rejected">Rejected</option>
                </NativeSelect>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Application No.</TableHead>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Advt. No.</TableHead>
                            <TableHead>Post</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Applied on</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-14 text-center text-muted-foreground">
                                    <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                                    {filtered ? 'No applications match these filters.' : 'No applications yet.'}
                                </TableCell>
                            </TableRow>
                        ) : applications.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell className="font-mono text-sm font-medium whitespace-nowrap"><Link href={`/admin/applications/${a.id}`} className="text-link hover:underline">{a.applicationNo}</Link></TableCell>
                                <TableCell>
                                    <div className="font-medium">{a.candidateName}</div>
                                    <div className="font-mono text-xs text-muted-foreground">{a.registrationNo}</div>
                                </TableCell>
                                <TableCell className="whitespace-nowrap"><Link href={`/admin/recruitments/${a.recruitmentId}`} className="text-link hover:underline">{a.advtNo}</Link></TableCell>
                                <TableCell className="max-w-64 truncate" title={a.postName}>{a.postName}</TableCell>
                                <TableCell>{a.category}</TableCell>
                                <TableCell className="whitespace-nowrap">{fmtDate(a.submittedAt)}</TableCell>
                                <TableCell><span className={cn('rounded-full px-2.5 py-1 text-xs font-medium capitalize', STATUS_TONE[a.status])}>{a.status}</span></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {meta.page} of {meta.last_page} · {meta.total} applications</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => visit({ page: meta.page - 1 })}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={meta.page >= meta.last_page} onClick={() => visit({ page: meta.page + 1 })}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

ApplicationsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
