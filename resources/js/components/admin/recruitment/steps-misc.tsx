import { FileText } from 'lucide-react';
import { Field, StepCard } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import { Input } from '@/components/ui/input';

/** Step 5 */
export function FeeStep({ form, update, errors, options }: StepProps) {
    return (
        <StepCard title="Application Fee" description="Enter ₹0 for exempted categories (e.g. SC / ST / PwBD).">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {options.feeCategories.map((c) => (
                    <Field key={c} label={c} error={errors[`fees.amounts.${c}`]}>
                        <div className="relative">
                            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
                            <Input className="pl-7" type="number" min={0} value={form.fees.amounts[c] ?? ''} onChange={(e) => update((d) => { d.fees.amounts[c] = e.target.value; })} />
                        </div>
                    </Field>
                ))}
            </div>
            <Field label="Last date for fee payment" error={errors['dates.fee_last_date']} className="max-w-xs">
                <Input type="date" value={form.dates.fee_last_date} onChange={(e) => update((d) => { d.dates.fee_last_date = e.target.value; })} />
            </Field>
        </StepCard>
    );
}

/** Step 6 */
export function DocumentsStep({ form, update, errors, options }: StepProps) {
    const toggle = (key: string, on: boolean) => update((d) => {
        d.documents.required = on ? [...d.documents.required, key] : d.documents.required.filter((k) => k !== key);
    });

    return (
        <StepCard title="Documents Required" description="Candidates must upload every ticked document.">
            <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(options.documents).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 rounded-md border bg-card px-3 py-2.5 text-sm">
                        <input type="checkbox" className="size-4 accent-primary" checked={form.documents.required.includes(key)} onChange={(e) => toggle(key, e.target.checked)} />
                        {label}
                    </label>
                ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
                {(['photo', 'signature'] as const).map((k) => (
                    <div key={k} className="rounded-lg border p-5">
                        <p className="mb-3 text-sm font-medium capitalize">{k} size (KB)</p>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Min" error={errors[`documents.${k}.min_kb`]}><Input type="number" min={1} value={form.documents[k].min_kb} onChange={(e) => update((d) => { d.documents[k].min_kb = e.target.value; })} /></Field>
                            <Field label="Max" error={errors[`documents.${k}.max_kb`]}><Input type="number" min={1} value={form.documents[k].max_kb} onChange={(e) => update((d) => { d.documents[k].max_kb = e.target.value; })} /></Field>
                        </div>
                    </div>
                ))}
            </div>
        </StepCard>
    );
}

/** Step 7 */
export function DatesStep({ form, update, errors }: StepProps) {
    const rows: { key: keyof typeof form.dates; label: string; required?: boolean }[] = [
        { key: 'app_start', label: 'Application start', required: true },
        { key: 'app_end', label: 'Application end (last date)', required: true },
        { key: 'fee_last_date', label: 'Fee last date' },
        { key: 'correction_end', label: 'Correction window ends' },
        { key: 'admit_card_date', label: 'Admit card release' },
        { key: 'exam_date', label: 'Exam date' },
        { key: 'result_date', label: 'Tentative result date' },
    ];

    return (
        <StepCard title="Important Dates" description="Shown on the public website as the recruitment timeline.">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map(({ key, label, required }) => (
                    <Field key={key} label={label} required={required} error={errors[`dates.${key}`]}>
                        <Input type="date" value={form.dates[key]} onChange={(e) => update((d) => { d.dates[key] = e.target.value; })} aria-invalid={Boolean(errors[`dates.${key}`])} />
                    </Field>
                ))}
            </div>
        </StepCard>
    );
}

interface AttachmentProps {
    advertisement: File | null;
    syllabus: File | null;
    onAdvertisement: (f: File | null) => void;
    onSyllabus: (f: File | null) => void;
    existing: { advertisement: string | null; syllabus: string | null };
    errors: Record<string, string>;
}

function PdfField({ label, file, onChange, existingUrl, error, required }: { label: string; file: File | null; onChange: (f: File | null) => void; existingUrl: string | null; error?: string; required?: boolean }) {
    return (
        <Field label={label} required={required} error={error} hint="PDF, up to 10 MB">
            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                className="block w-full rounded-md border border-input text-sm file:mr-3 file:border-0 file:bg-primary-tint file:px-4 file:py-2.5 file:font-medium file:text-primary-deep"
            />
            {!file && existingUrl && (
                <a href={existingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-link hover:underline"><FileText className="size-4" aria-hidden="true" /> Current file (uploading a new one replaces it)</a>
            )}
        </Field>
    );
}

/** Step 8 */
export function AttachmentsStep({ advertisement, syllabus, onAdvertisement, onSyllabus, existing, errors }: AttachmentProps) {
    return (
        <StepCard title="Attachments" description="The advertisement PDF is required before publishing.">
            <div className="grid gap-6 sm:grid-cols-2">
                <PdfField label="Official advertisement PDF" required file={advertisement} onChange={onAdvertisement} existingUrl={existing.advertisement} error={errors.advertisement_pdf} />
                <PdfField label="Syllabus PDF" file={syllabus} onChange={onSyllabus} existingUrl={existing.syllabus} error={errors.syllabus_pdf} />
            </div>
        </StepCard>
    );
}
