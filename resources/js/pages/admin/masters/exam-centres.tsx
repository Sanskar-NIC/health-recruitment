import { Head, router, useForm } from '@inertiajs/react';
import { Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Field } from '@/components/admin/recruitment/ui';
import { Textarea } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface Centre {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    capacity: number;
    is_active: boolean;
}

interface Props {
    centres: { data: Centre[]; current_page: number; last_page: number; total: number };
    filters: { search: string };
}

const BASE = '/admin/masters/exam-centres';

export default function ExamCentres({ centres, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [editing, setEditing] = useState<Centre | 'new' | null>(null);
    const [deleting, setDeleting] = useState<Centre | null>(null);

    const visit = (next: Partial<Props['filters']> & { page?: number }) =>
        router.get(BASE, { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });

    useEffect(() => {
        if (search === filters.search) return;

        const t = setTimeout(() => visit({ search, page: 1 }), 350);

        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-5">
            <Head title="Exam Centres – Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-primary-deep">Exam Centres</h1>
                    <p className="text-sm text-muted-foreground">Venues candidates can be allocated to. Capacity is the number of seats at the centre.</p>
                </div>
                <Button className="hover:bg-primary-hover" onClick={() => setEditing('new')}><Plus /> Add Centre</Button>
            </div>

            <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="relative">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input className="pl-9" placeholder="Search by centre name, code or city" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search exam centres" />
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Centre</TableHead>
                                <TableHead>Code</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Enabled</TableHead>
                                <TableHead className="w-24"><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {centres.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-14 text-center text-muted-foreground">
                                        <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                                        {filters.search ? 'No centres match your search.' : 'No exam centres yet. Add the first one.'}
                                    </TableCell>
                                </TableRow>
                            ) : centres.data.map((c) => (
                                <TableRow key={c.id} className={cn(!c.is_active && 'text-muted-foreground')}>
                                    <TableCell>
                                        <div className="font-medium">{c.name}</div>
                                        <div className="max-w-md truncate text-xs text-muted-foreground" title={c.address}>{c.address}</div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                                    <TableCell>{c.city}</TableCell>
                                    <TableCell>{c.capacity}</TableCell>
                                    <TableCell>
                                        <Switch checked={c.is_active} aria-label={`${c.is_active ? 'Disable' : 'Enable'} ${c.name}`} onCheckedChange={() => router.patch(`${BASE}/${c.id}/toggle`, {}, { preserveScroll: true })} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" aria-label={`Edit ${c.name}`} onClick={() => setEditing(c)}><Pencil /></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}><Trash2 /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {centres.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {centres.current_page} of {centres.last_page} · {centres.total} centres</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={centres.current_page <= 1} onClick={() => visit({ page: centres.current_page - 1 })}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={centres.current_page >= centres.last_page} onClick={() => visit({ page: centres.current_page + 1 })}>Next</Button>
                    </div>
                </div>
            )}

            {editing && <CentreDialog key={editing === 'new' ? 'new' : editing.id} centre={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}

            <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete exam centre?</DialogTitle>
                        <DialogDescription>“{deleting?.name}” will be removed. A centre that already has candidates allocated cannot be deleted; disable it instead.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleting && router.delete(`${BASE}/${deleting.id}`, { preserveScroll: true, onFinish: () => setDeleting(null) })}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function CentreDialog({ centre, onClose }: { centre: Centre | null; onClose: () => void }) {
    const form = useForm({
        name: centre?.name ?? '', code: centre?.code ?? '', address: centre?.address ?? '',
        city: centre?.city ?? '', capacity: centre ? String(centre.capacity) : '', is_active: centre?.is_active ?? true,
    });
    const { data, setData, errors, processing } = form;

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: onClose };

        if (centre) form.put(`${BASE}/${centre.id}`, options);
        else form.post(BASE, options);
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{centre ? 'Edit Exam Centre' : 'Add Exam Centre'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                    <Field label="Centre name" required error={errors.name} htmlFor="centre-name" className="sm:col-span-2">
                        <Input id="centre-name" value={data.name} onChange={(e) => setData('name', e.target.value)} aria-invalid={Boolean(errors.name)} />
                    </Field>
                    <Field label="Centre code" required error={errors.code} htmlFor="centre-code">
                        <Input id="centre-code" value={data.code} onChange={(e) => setData('code', e.target.value)} aria-invalid={Boolean(errors.code)} />
                    </Field>
                    <Field label="City" required error={errors.city} htmlFor="centre-city">
                        <Input id="centre-city" value={data.city} onChange={(e) => setData('city', e.target.value)} aria-invalid={Boolean(errors.city)} />
                    </Field>
                    <Field label="Address" required error={errors.address} htmlFor="centre-address" className="sm:col-span-2">
                        <Textarea id="centre-address" rows={3} value={data.address} onChange={(e) => setData('address', e.target.value)} aria-invalid={Boolean(errors.address)} />
                    </Field>
                    <Field label="Capacity (seats)" required error={errors.capacity} htmlFor="centre-capacity">
                        <Input id="centre-capacity" type="number" min={1} value={data.capacity} onChange={(e) => setData('capacity', e.target.value)} aria-invalid={Boolean(errors.capacity)} />
                    </Field>
                    <div className="flex items-center justify-between gap-4 self-end rounded-lg border p-3">
                        <p className="text-sm font-medium">Enabled</p>
                        <Switch checked={data.is_active} onCheckedChange={(v) => setData('is_active', v)} aria-label="Enabled" />
                    </div>
                    <DialogFooter className="sm:col-span-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="hover:bg-primary-hover" disabled={processing}>{centre ? 'Save changes' : 'Add centre'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

ExamCentres.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
