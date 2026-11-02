import { FileSpreadsheet, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Field, NativeSelect } from '@/components/admin/recruitment/ui';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface ImportField {
    key: string;
    label: string;
    required?: boolean;
    /** Header words that suggest this column, used to pre-select it. */
    hints: string[];
}

export interface ImportOutcome {
    matched: number;
    unmatched: string[];
}

interface Props {
    title: string;
    description: string;
    fields: ImportField[];
    /** Shows a "marks out of" box used when the sheet has no column for it. */
    defaultTotal?: boolean;
    /** Receives each sheet row keyed by field; returns how many matched a candidate. */
    onApply: (rows: Record<string, string>[], options: { defaultTotal: string }) => ImportOutcome;
    onClose: () => void;
}

interface Parsed {
    headers: string[];
    rows: string[][];
}

const NONE = '-1';

function xsrf(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

const guess = (headers: string[], hints: string[]) => {
    const i = headers.findIndex((h) => hints.some((hint) => h.toLowerCase().replace(/[^a-z0-9]/g, '').includes(hint)));

    return i >= 0 ? String(i) : NONE;
};

/**
 * Reads any Excel/CSV the department sends. There is no fixed layout, so the admin says which
 * column holds what, checks the preview, and only then is anything applied.
 */
export function ExcelImportDialog({ title, description, fields, defaultTotal, onApply, onClose }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const [parsed, setParsed] = useState<Parsed | null>(null);
    const [fileName, setFileName] = useState('');
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [total, setTotal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [outcome, setOutcome] = useState<ImportOutcome | null>(null);

    const upload = async (file: File) => {
        setLoading(true);
        setError('');
        setOutcome(null);

        const body = new FormData();
        body.append('file', file);

        try {
            const response = await fetch('/admin/excel/parse', {
                method: 'POST',
                body,
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf() },
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.errors?.file?.[0] ?? result.message ?? 'This file could not be read.');
            }

            setParsed(result as Parsed);
            setFileName(file.name);
            setMapping(Object.fromEntries(fields.map((f) => [f.key, guess(result.headers, f.hints)])));
        } catch (e) {
            setParsed(null);
            setError(e instanceof Error ? e.message : 'This file could not be read.');
        } finally {
            setLoading(false);
        }
    };

    const ready = parsed && fields.every((f) => !f.required || mapping[f.key] !== NONE);

    const apply = () => {
        if (!parsed) return;

        const rows = parsed.rows.map((r) =>
            Object.fromEntries(fields.map((f) => [f.key, mapping[f.key] === NONE ? '' : (r[Number(mapping[f.key])] ?? '')])),
        );

        setOutcome(onApply(rows, { defaultTotal: total }));
    };

    return (
        <Dialog open onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-5">
                    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4">
                        <FileSpreadsheet className="size-8 text-primary" aria-hidden="true" />
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="truncate font-medium">{fileName || 'No file chosen'}</p>
                            <p className="text-xs text-muted-foreground">.xlsx, .xls or .csv, first sheet, first row as column headings.</p>
                        </div>
                        <input
                            ref={input}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="sr-only"
                            aria-label="Choose spreadsheet"
                            onChange={(e) => {
                                const file = e.target.files?.[0];

                                if (file) void upload(file);

                                e.target.value = '';
                            }}
                        />
                        <Button type="button" variant="outline" disabled={loading} onClick={() => input.current?.click()}>
                            <Upload /> {loading ? 'Reading…' : parsed ? 'Choose another' : 'Choose file'}
                        </Button>
                    </div>

                    {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

                    {parsed && (
                        <>
                            <p className="text-sm text-muted-foreground">Found {parsed.rows.length} row(s). Tell us which column is which.</p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {fields.map((f) => (
                                    <Field key={f.key} label={f.label} required={f.required} htmlFor={`map-${f.key}`}>
                                        <NativeSelect id={`map-${f.key}`} value={mapping[f.key]} onChange={(e) => setMapping({ ...mapping, [f.key]: e.target.value })}>
                                            <option value={NONE}>{f.required ? 'Select column' : 'Not in the file'}</option>
                                            {parsed.headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                                        </NativeSelect>
                                    </Field>
                                ))}
                                {defaultTotal && (
                                    <Field label="Marks out of (if the file has no such column)" htmlFor="map-total-default">
                                        <Input id="map-total-default" type="number" min={1} step="any" value={total} onChange={(e) => setTotal(e.target.value)} />
                                    </Field>
                                )}
                            </div>

                            <div className="overflow-x-auto rounded-lg border text-xs">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>{parsed.headers.map((h, i) => <th key={i} className="px-2 py-1.5 text-left font-medium whitespace-nowrap">{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {parsed.rows.slice(0, 4).map((r, i) => (
                                            <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="px-2 py-1.5 whitespace-nowrap">{c}</td>)}</tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                    {outcome && (
                        <div role="status" className="rounded-lg border bg-muted/30 p-3 text-sm">
                            <p className="font-medium">{outcome.matched} candidate(s) matched and updated on the page. Review them, then save.</p>
                            {outcome.unmatched.length > 0 && (
                                <>
                                    <p className="mt-2 text-destructive">{outcome.unmatched.length} row(s) did not match any candidate:</p>
                                    <p className="mt-1 max-h-24 overflow-y-auto font-mono text-xs break-all text-muted-foreground">{outcome.unmatched.slice(0, 100).join(', ')}{outcome.unmatched.length > 100 && ' …'}</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>{outcome ? 'Close' : 'Cancel'}</Button>
                    {!outcome && <Button type="button" className="hover:bg-primary-hover" disabled={!ready} onClick={apply}>Apply to list</Button>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

/** Lower-cases and strips spaces/punctuation so "HRP2026 0001", "hrp20260001" and "HRP2026-0001" compare equal. */
export const key = (v: string | null | undefined) => (v ?? '').toLowerCase().replace(/[^a-z0-9@.]/g, '');
