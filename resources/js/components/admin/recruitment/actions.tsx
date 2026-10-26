import { Link, router } from '@inertiajs/react';
import { CalendarPlus, Copy, Eye, Lock, MoreHorizontal, Pencil, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { RecruitmentStatus } from '@/components/admin/recruitment/types';
import { Field, Textarea } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export interface ActionTarget {
    id: number;
    advt_no: string;
    status: RecruitmentStatus;
    app_end: string | null;
    is_draft: boolean;
    is_cancelled: boolean;
}

type Kind = 'extend' | 'close' | 'cancel' | 'delete';

const live: RecruitmentStatus[] = ['upcoming', 'open', 'closing_soon'];

export function RecruitmentActions({ r, showView = true }: { r: ActionTarget; showView?: boolean }) {
    const [kind, setKind] = useState<Kind | null>(null);
    const [reason, setReason] = useState('');
    const [newEnd, setNewEnd] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState(false);

    const published = live.includes(r.status) || r.status === 'closed';
    const base = `/admin/recruitments/${r.id}`;

    const close = () => {
        setKind(null);
        setReason('');
        setNewEnd('');
        setErrors({});
    };

    const submit = () => {
        if (!kind) return;

        const options = {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onError: (e: Record<string, string>) => setErrors(e),
            onSuccess: close,
            onFinish: () => setBusy(false),
        };

        if (kind === 'delete') router.delete(base, options);
        else router.post(`${base}/${kind}`, kind === 'extend' ? { new_end: newEnd, reason } : { reason }, options);
    };

    const copy = () => router.post(`${base}/duplicate`, {}, { preserveScroll: true });

    const meta: Record<Kind, { title: string; text: string; cta: string; destructive?: boolean }> = {
        extend: { title: 'Extend last date', text: 'A corrigendum notice is published automatically.', cta: 'Extend date' },
        close: { title: 'Close recruitment early', text: 'Candidates will no longer be able to apply. A notice is published.', cta: 'Close recruitment', destructive: true },
        cancel: { title: 'Cancel recruitment', text: 'This cannot be undone. The advertisement is withdrawn and a cancellation notice is published.', cta: 'Cancel recruitment', destructive: true },
        delete: { title: 'Delete draft', text: `Permanently delete draft ${r.advt_no}? Only drafts can be deleted.`, cta: 'Delete draft', destructive: true },
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Actions for ${r.advt_no}`}><MoreHorizontal /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    {showView && <DropdownMenuItem asChild><Link href={base}><Eye /> View</Link></DropdownMenuItem>}
                    {!r.is_cancelled && <DropdownMenuItem asChild><Link href={`${base}/edit`}><Pencil /> Edit</Link></DropdownMenuItem>}
                    <DropdownMenuItem onSelect={copy}><Copy /> Duplicate</DropdownMenuItem>
                    {published && !r.is_cancelled && <DropdownMenuSeparator />}
                    {published && <DropdownMenuItem onSelect={() => setKind('extend')}><CalendarPlus /> Extend date</DropdownMenuItem>}
                    {live.includes(r.status) && <DropdownMenuItem onSelect={() => setKind('close')}><Lock /> Close early</DropdownMenuItem>}
                    {!r.is_draft && !r.is_cancelled && <DropdownMenuItem onSelect={() => setKind('cancel')}><XCircle /> Cancel</DropdownMenuItem>}
                    {r.is_draft && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" className="!text-destructive [&_svg]:!text-destructive" onSelect={() => setKind('delete')}><Trash2 /> Delete</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={kind !== null} onOpenChange={(open) => !open && close()}>
                {kind && (
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{meta[kind].title} · {r.advt_no}</DialogTitle>
                            <DialogDescription>{meta[kind].text}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                            {kind === 'extend' && (
                                <Field label="New last date" required error={errors.new_end}>
                                    <Input type="date" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                                </Field>
                            )}
                            {kind !== 'delete' && (
                                <Field label="Reason" required error={errors.reason}>
                                    <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
                                </Field>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={close}>Keep as is</Button>
                            <Button variant={meta[kind].destructive ? 'destructive' : 'default'} disabled={busy} onClick={submit}>{meta[kind].cta}</Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </>
    );
}
