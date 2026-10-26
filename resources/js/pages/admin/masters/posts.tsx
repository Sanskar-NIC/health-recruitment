import { Head, router, useForm } from '@inertiajs/react';
import { Inbox, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Field, NativeSelect } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { cn } from '@/lib/utils';

interface PostRow {
    id: number;
    name: string;
    code: string;
    is_contractual: boolean;
    minimum_qualification: string | null;
    preferable_qualification: string | null;
    experience_required: boolean;
    experience_years: number | null;
    experience_criteria: string | null;
    is_active: boolean;
}

interface Props {
    posts: { data: PostRow[]; current_page: number; last_page: number; total: number };
    filters: { search: string; status: string };
    qualifications: string[];
}

interface PostForm {
    name: string;
    code: string;
    is_contractual: boolean;
    minimum_qualification: string;
    preferable_qualification: string;
    experience_required: boolean;
    experience_years: string;
    experience_criteria: string;
    is_active: boolean;
}

const BASE = '/admin/masters/posts';
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));

const emptyForm: PostForm = {
    name: '', code: '', is_contractual: false, minimum_qualification: '', preferable_qualification: '',
    experience_required: false, experience_years: '', experience_criteria: '', is_active: true,
};

const fromRow = (p: PostRow): PostForm => ({
    name: p.name, code: p.code, is_contractual: p.is_contractual, minimum_qualification: str(p.minimum_qualification),
    preferable_qualification: str(p.preferable_qualification), experience_required: p.experience_required,
    experience_years: str(p.experience_years), experience_criteria: str(p.experience_criteria), is_active: p.is_active,
});

export default function Posts({ posts, filters, qualifications }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [editing, setEditing] = useState<PostRow | 'new' | null>(null);
    const [deleting, setDeleting] = useState<PostRow | null>(null);

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
            <Head title="Posts – Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-primary-deep">Posts</h1>
                    <p className="text-sm text-muted-foreground">Posts you can pick when creating a recruitment. Salary, seats and age are set per notification.</p>
                </div>
                <Button className="hover:bg-primary-hover" onClick={() => setEditing('new')}><Plus /> Add Post</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
                <div className="relative min-w-60 flex-1">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input className="pl-9" placeholder="Search by post name or code" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search posts" />
                </div>
                <NativeSelect className="w-40" value={filters.status} onChange={(e) => visit({ status: e.target.value, page: 1 })} aria-label="Filter by status">
                    <option value="">All statuses</option>
                    <option value="active">Enabled</option>
                    <option value="inactive">Disabled</option>
                </NativeSelect>
            </div>

            <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Post</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Minimum qualification</TableHead>
                            <TableHead>Preferable qualification</TableHead>
                            <TableHead>Experience</TableHead>
                            <TableHead>Enabled</TableHead>
                            <TableHead className="w-24"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="py-14 text-center text-muted-foreground">
                                    <Inbox className="mx-auto mb-2 size-8" aria-hidden="true" />
                                    {filters.search || filters.status ? 'No posts match these filters.' : 'No posts yet. Add the first one.'}
                                </TableCell>
                            </TableRow>
                        ) : posts.data.map((p) => (
                            <TableRow key={p.id} className={cn(!p.is_active && 'text-muted-foreground')}>
                                <TableCell className="font-medium">{p.name}</TableCell>
                                <TableCell className="whitespace-nowrap">{p.code}</TableCell>
                                <TableCell>{p.is_contractual ? 'Contractual' : 'Regular'}</TableCell>
                                <TableCell>{p.minimum_qualification || '—'}</TableCell>
                                <TableCell className="max-w-64 truncate" title={p.preferable_qualification ?? undefined}>{p.preferable_qualification || '—'}</TableCell>
                                <TableCell className="whitespace-nowrap">{p.experience_required ? `${p.experience_years} yrs` : 'Not required'}</TableCell>
                                <TableCell>
                                    <Switch
                                        checked={p.is_active}
                                        aria-label={`${p.is_active ? 'Disable' : 'Enable'} ${p.name}`}
                                        onCheckedChange={() => router.patch(`${BASE}/${p.id}/toggle`, {}, { preserveScroll: true })}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}><Pencil /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" aria-label={`Delete ${p.name}`} onClick={() => setDeleting(p)}><Trash2 /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {posts.last_page > 1 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Page {posts.current_page} of {posts.last_page} · {posts.total} posts</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={posts.current_page <= 1} onClick={() => visit({ page: posts.current_page - 1 })}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={posts.current_page >= posts.last_page} onClick={() => visit({ page: posts.current_page + 1 })}>Next</Button>
                    </div>
                </div>
            )}

            {editing && <PostDialog key={editing === 'new' ? 'new' : editing.id} post={editing === 'new' ? null : editing} qualifications={qualifications} onClose={() => setEditing(null)} />}

            <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete post?</DialogTitle>
                        <DialogDescription>
                            “{deleting?.name}” will be removed from the master list. Existing recruitments keep their own copy. To hide it from new recruitments instead, disable it.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={() => deleting && router.delete(`${BASE}/${deleting.id}`, { preserveScroll: true, onSuccess: () => setDeleting(null) })}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function PostDialog({ post, qualifications, onClose }: { post: PostRow | null; qualifications: string[]; onClose: () => void }) {
    const form = useForm<PostForm>(post ? fromRow(post) : emptyForm);
    const { data, setData, errors, processing } = form;

    const text = (key: keyof PostForm) => (e: { target: { value: string } }) => setData(key, e.target.value as never);

    const submit = (e: FormEvent) => {
        e.preventDefault();

        const options = { preserveScroll: true, onSuccess: onClose };

        if (post) {
            form.put(`${BASE}/${post.id}`, options);
        } else {
            form.post(BASE, options);
        }
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{post ? 'Edit Post' : 'Add Post'}</DialogTitle>
                    <DialogDescription>Defaults only. Salary, number of posts, age and contract period are entered for each notification.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
                    <Field label="Post name" required error={errors.name} htmlFor="post-name">
                        <Input id="post-name" value={data.name} onChange={text('name')} aria-invalid={Boolean(errors.name)} />
                    </Field>
                    <Field label="Post code" required error={errors.code} htmlFor="post-code">
                        <Input id="post-code" value={data.code} onChange={text('code')} aria-invalid={Boolean(errors.code)} />
                    </Field>

                    <Field label="Minimum qualification" required error={errors.minimum_qualification} htmlFor="post-qual">
                        <NativeSelect id="post-qual" value={data.minimum_qualification} onChange={text('minimum_qualification')} aria-invalid={Boolean(errors.minimum_qualification)}>
                            <option value="">Select</option>
                            {qualifications.map((q) => <option key={q} value={q}>{q}</option>)}
                        </NativeSelect>
                    </Field>
                    <Field label="Preferable qualification" error={errors.preferable_qualification} htmlFor="post-pref-qual">
                        <Input id="post-pref-qual" value={data.preferable_qualification} onChange={text('preferable_qualification')} />
                    </Field>

                    <ToggleRow label="Contractual" checked={data.is_contractual} onChange={(v) => setData('is_contractual', v)} className="sm:col-span-2" />
                    <ToggleRow label="Experience required" checked={data.experience_required} onChange={(v) => setData('experience_required', v)} className="sm:col-span-2" />

                    {data.experience_required && (
                        <div className="grid gap-5 rounded-lg border bg-muted/30 p-4 sm:col-span-2 sm:grid-cols-2">
                            <Field label="Years of experience" required error={errors.experience_years} htmlFor="post-exp-years">
                                <Input id="post-exp-years" type="number" min={0.5} step={0.5} value={data.experience_years} onChange={text('experience_years')} />
                            </Field>
                            <Field label="Experience criteria" error={errors.experience_criteria} htmlFor="post-exp-criteria">
                                <Input id="post-exp-criteria" value={data.experience_criteria} onChange={text('experience_criteria')} />
                            </Field>
                        </div>
                    )}

                    <ToggleRow label="Enabled" checked={data.is_active} onChange={(v) => setData('is_active', v)} className="sm:col-span-2" />

                    <DialogFooter className="sm:col-span-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" className="hover:bg-primary-hover" disabled={processing}>{post ? 'Save changes' : 'Create post'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ToggleRow({ label, checked, onChange, className }: { label: string; checked: boolean; onChange: (v: boolean) => void; className?: string }) {
    return (
        <div className={cn('flex items-center justify-between gap-4 rounded-lg border p-3', className)}>
            <p className="text-sm font-medium">{label}</p>
            <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
        </div>
    );
}

Posts.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
