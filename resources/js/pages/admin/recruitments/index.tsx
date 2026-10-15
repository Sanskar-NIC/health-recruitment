import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { RecruitmentActions } from '@/components/admin/recruitment/actions';
import { fmtDate } from '@/components/admin/recruitment/review';
import { STATUS_LABEL, STATUS_TONE } from '@/components/admin/recruitment/types';
import type { RecruitmentStatus } from '@/components/admin/recruitment/types';
import { NativeSelect } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Row {
    id: number;
    advt_no: string;
    title: string;
    posts_count: number;
    vacancies: number;
    app_start: string | null;
    app_end: string | null;
    publish_at: string | null;
    status: RecruitmentStatus;
    applications: number;
    is_draft: boolean;
    is_cancelled: boolean;
}

interface Props {
    recruitments: Row[];
    meta: { page: number; last_page: number; total: number };
    filters: { search: string; status: string; year: string };
    years: string[];
}

export default function RecruitmentsIndex({ recruitments, meta, filters, years }: Props) {
    const [search, setSearch] = useState(filters.search);

    const visit = (next: Partial<Props['filters']> & { page?: number }) =>
        router.get('/admin/recruitments', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    // Debounced search so the table filters as the admin types.
    useEffect(() => {
        if (search === filters.search) return;

        const t = setTimeout(() => visit({ search, page: 1 }), 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="All Recruitments – Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-primary-deep">All Recruitments</h1>
                    <p className="text-sm text-muted-foreground">Advertisements issued by the department, across their full lifecycle.</p>
                </div>
                <Button asChild className="hover:bg-primary-hover"><Link href="/admin/recruitments/create"><Plus /> Create New</Link></Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <div className="relative min-w-60 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input className="pl-9" placeholder="Search by Advt. No. or title" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search recruitments" />
                </div>
                <NativeSelect className="w-44" value={filters.status} onChange={(e) => visit({ status: e.target.value, page: 1 })} aria-label="Filter by status">
                    <option value="">All statuses</option>
                    {(Object.keys(STATUS_LABEL) as RecruitmentStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </NativeSelect>
                <NativeSelect className="w-32" value={filters.year} onChange={(e) => visit({ year: e.target.value, page: 1 })} aria-label="Filter by year">
                    <option value="">All years</option>
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </NativeSelect>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Advt. No.</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="text-right">Posts</TableHead>
                            <TableHead className="text-right">Vacancies</TableHead>
                            <TableHead>Application period</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Applications</TableHead>
                            <TableHead className="w-12"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recruitments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-14 text-center text-muted-foreground">
                                    <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                                    {meta.total === 0 && !filters.search && !filters.status && !filters.year ? 'No recruitments yet. Create the first one from a department notification.' : 'No recruitments match these filters.'}
                                </TableCell>
                            </TableRow>
                        ) : recruitments.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell className="font-medium whitespace-nowrap"><Link href={`/admin/recruitments/${r.id}`} className="text-link hover:underline">{r.advt_no}</Link></TableCell>
                                <TableCell className="max-w-72 truncate" title={r.title}>{r.title}</TableCell>
                                <TableCell className="text-right">{r.posts_count}</TableCell>
                                <TableCell className="text-right">{r.vacancies}</TableCell>
                                <TableCell className="whitespace-nowrap text-sm">
                                    {r.app_start || r.app_end ? `${fmtDate(r.app_start)} → ${fmtDate(r.app_end)}` : r.status === 'scheduled' ? `Publishes ${fmtDate(r.publish_at)}` : '—'}
                                </TableCell>
                                <TableCell><span className={cn('rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', STATUS_TONE[r.status])}>{STATUS_LABEL[r.status]}</span></TableCell>
                                <TableCell className="text-right">{r.applications}</TableCell>
                                <TableCell><RecruitmentActions r={r} /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {meta.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {meta.page} of {meta.last_page} · {meta.total} recruitments</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={meta.page <= 1} onClick={() => visit({ page: meta.page - 1 })}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={meta.page >= meta.last_page} onClick={() => visit({ page: meta.page + 1 })}>Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}

RecruitmentsIndex.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
