import { Head, router } from '@inertiajs/react';
import { Inbox, Wand2 } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { PageTitle, PickRecruitmentHint, RecruitmentPicker } from '@/components/admin/exam/recruitment-picker';
import type { RecruitmentOption } from '@/components/admin/exam/recruitment-picker';
import { NativeSelect } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';

interface Centre {
    id: number;
    name: string;
    code: string;
    city: string;
    capacity: number;
    allocated: number;
}

interface Candidate {
    id: number;
    applicationNo: string;
    name: string;
    registrationNo: string;
    postName: string;
    rollNo: string | null;
    centreId: number | null;
}

interface Props {
    recruitments: RecruitmentOption[];
    recruitment: number | null;
    released: boolean;
    centres: Centre[];
    candidates: Candidate[];
}

export default function Centres({ recruitments, recruitment, released, centres, candidates }: Props) {
    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Centres & Allocation – Admin" />
            <PageTitle title="Centres & Allocation" description="Give every shortlisted candidate an exam centre. Roll numbers are issued automatically when a centre is allocated." />
            <RecruitmentPicker path="/admin/exams/centres" recruitments={recruitments} value={recruitment} />
            {recruitment ? <Allocation key={recruitment} recruitment={recruitment} released={released} centres={centres} candidates={candidates} /> : <PickRecruitmentHint />}
        </div>
    );
}

function Allocation({ recruitment, released, centres, candidates }: Omit<Props, 'recruitments' | 'recruitment'> & { recruitment: number }) {
    const [picked, setPicked] = useState<Set<number>>(new Set());
    const [target, setTarget] = useState('');
    const [auto, setAuto] = useState(false);

    const centreName = new Map(centres.map((c) => [c.id, c.name]));
    const pending = candidates.filter((c) => !c.centreId).length;
    const post = (url: string, data: Record<string, unknown>, done?: () => void) => router.post(url, { recruitment, ...data }, { preserveScroll: true, onSuccess: done });

    const assign = () => post('/admin/exams/centres/assign', { ids: [...picked], centre_id: target ? Number(target) : null }, () => setPicked(new Set()));

    const toggle = (id: number, on: boolean) => setPicked((prev) => {
        const next = new Set(prev);

        if (on) next.add(id);
        else next.delete(id);

        return next;
    });

    if (candidates.length === 0) {
        return (
            <div className="rounded-lg border bg-card py-14 text-center text-muted-foreground">
                <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                No candidates are shortlisted for this recruitment yet. Shortlist them first.
            </div>
        );
    }

    return (
        <>
            {released && <p role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">Admit cards are already released. Changes made here show on candidates&apos; cards immediately.</p>}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {centres.length === 0 && <p className="text-sm text-destructive sm:col-span-4">No active exam centres. Add them under Masters → Exam Centres.</p>}
                {centres.map((c) => {
                    const used = candidates.filter((x) => x.centreId === c.id).length;

                    return (
                        <div key={c.id} className="rounded-lg border bg-card p-3 shadow-sm">
                            <p className="truncate text-sm font-medium" title={c.name}>{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.city} · {c.code}</p>
                            <p className="mt-1 text-sm"><span className="font-semibold">{used}</span> / {c.capacity} seats</p>
                        </div>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <p className="text-sm"><span className="font-semibold">{candidates.length - pending}</span> of {candidates.length} allocated{pending > 0 && <span className="text-destructive"> · {pending} waiting</span>}</p>
                <div className="ml-auto flex flex-wrap items-center gap-2">
                    <Button variant="outline" disabled={pending === 0 || centres.length === 0} onClick={() => setAuto(true)}><Wand2 /> Auto-allocate waiting</Button>
                    <NativeSelect className="w-56" value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Centre for selected candidates">
                        <option value="">Remove centre</option>
                        {centres.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </NativeSelect>
                    <Button className="hover:bg-primary-hover" disabled={picked.size === 0} onClick={assign}>Apply to {picked.size} selected</Button>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"><Checkbox checked={picked.size === candidates.length} onCheckedChange={(v) => setPicked(v === true ? new Set(candidates.map((c) => c.id)) : new Set())} aria-label="Select all candidates" /></TableHead>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Post</TableHead>
                                <TableHead>Roll No.</TableHead>
                                <TableHead>Exam centre</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {candidates.map((c) => (
                                <TableRow key={c.id} data-state={picked.has(c.id) ? 'selected' : undefined}>
                                    <TableCell><Checkbox checked={picked.has(c.id)} onCheckedChange={(v) => toggle(c.id, v === true)} aria-label={`Select ${c.name}`} /></TableCell>
                                    <TableCell>
                                        <div className="font-medium">{c.name}</div>
                                        <div className="font-mono text-xs text-muted-foreground">{c.registrationNo}</div>
                                    </TableCell>
                                    <TableCell className="max-w-64 truncate" title={c.postName}>{c.postName}</TableCell>
                                    <TableCell className="font-mono text-sm whitespace-nowrap">{c.rollNo ?? '–'}</TableCell>
                                    <TableCell>{c.centreId ? centreName.get(c.centreId) ?? '–' : <span className="text-destructive">Not allocated</span>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {auto && <AutoDialog centres={centres} waiting={pending} onClose={() => setAuto(false)} onRun={(ids) => post('/admin/exams/centres/auto', { centre_ids: ids }, () => setAuto(false))} />}
        </>
    );
}

function AutoDialog({ centres, waiting, onRun, onClose }: { centres: Centre[]; waiting: number; onRun: (ids: number[]) => void; onClose: () => void }) {
    const [ids, setIds] = useState<number[]>([]);
    const seats = centres.filter((c) => ids.includes(c.id)).reduce((n, c) => n + Math.max(c.capacity - c.allocated, 0), 0);

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Auto-allocate {waiting} candidate(s)</DialogTitle>
                    <DialogDescription>Choose the centres to use. They are filled in the order shown, up to each centre&apos;s free seats.</DialogDescription>
                </DialogHeader>
                <ul className="grid max-h-72 gap-2 overflow-y-auto">
                    {centres.map((c) => (
                        <li key={c.id}>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm">
                                <Checkbox checked={ids.includes(c.id)} onCheckedChange={(v) => setIds(v === true ? [...ids, c.id] : ids.filter((x) => x !== c.id))} />
                                <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name}</span><span className="text-xs text-muted-foreground">{c.city}</span></span>
                                <span className="text-xs text-muted-foreground">{Math.max(c.capacity - c.allocated, 0)} free</span>
                            </label>
                        </li>
                    ))}
                </ul>
                <p className="text-sm text-muted-foreground">{seats} free seat(s) selected for {waiting} waiting candidate(s).</p>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button className="hover:bg-primary-hover" disabled={ids.length === 0} onClick={() => onRun(ids)}>Allocate</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

Centres.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
