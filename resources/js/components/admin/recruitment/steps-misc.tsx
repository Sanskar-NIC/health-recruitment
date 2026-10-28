import { FileText } from 'lucide-react';
import { Field, StepCard, Textarea } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import { Input } from '@/components/ui/input';

/** Step 5 */
export function FeeStep({ form, update, errors, options }: StepProps) {
    return (
        <StepCard title="Application Fee">
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
    const interview = form.basic.selection_mode === 'interview';
    const walkIn = interview && form.basic.apply_mode === 'walk_in';
    const rows: { key: keyof typeof form.dates; label: string; required?: boolean }[] = interview
        ? walkIn
            ? []
            : [
                  { key: 'app_start', label: 'Application start', required: true },
                  { key: 'app_end', label: 'Application end (last date)', required: true },
                  { key: 'result_date', label: 'Tentative result date' },
              ]
        : [
              { key: 'app_start', label: 'Application start', required: true },
              { key: 'app_end', label: 'Application end (last date)', required: true },
              { key: 'fee_last_date', label: 'Fee last date' },
              { key: 'correction_end', label: 'Correction window ends' },
              { key: 'admit_card_date', label: 'Admit card release' },
              { key: 'exam_date', label: 'Exam date' },
              { key: 'result_date', label: 'Tentative result date' },
          ];
    const setIv = (key: keyof typeof form.interview) => (e: { target: { value: string } }) => update((d) => { d.interview[key] = e.target.value; });

    return (
        <StepCard title="Important Dates" description="Shown on the public website as the recruitment timeline.">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map(({ key, label, required }) => (
                    <Field key={key} label={label} required={required} error={errors[`dates.${key}`]}>
                        <Input type="date" value={form.dates[key]} onChange={(e) => update((d) => { d.dates[key] = e.target.value; })} aria-invalid={Boolean(errors[`dates.${key}`])} />
                    </Field>
                ))}
            </div>
            {interview && (
                <div className="grid gap-6 rounded-lg border bg-muted/30 p-5 sm:grid-cols-2">
                    <h3 className="text-sm font-semibold text-primary-deep sm:col-span-2">Interview details{walkIn && ' (shown to candidates as the notice)'}</h3>
                    <Field label="Interview start date" required error={errors['interview.date']}>
                        <Input type="date" value={form.interview.date} onChange={setIv('date')} aria-invalid={Boolean(errors['interview.date'])} />
                    </Field>
                    <Field label="Interview end date (if more than one day)" error={errors['interview.date_to']}>
                        <Input type="date" min={form.interview.date || undefined} value={form.interview.date_to} onChange={setIv('date_to')} aria-invalid={Boolean(errors['interview.date_to'])} />
                    </Field>
                    <Field label="Reporting time" required error={errors['interview.time']}>
                        <Input type="time" value={form.interview.time} onChange={setIv('time')} aria-invalid={Boolean(errors['interview.time'])} />
                    </Field>
                    <Field label="Venue" required error={errors['interview.venue']} className="sm:col-span-2">
                        <Input value={form.interview.venue} onChange={setIv('venue')} aria-invalid={Boolean(errors['interview.venue'])} />
                    </Field>
                    <Field label="Documents to carry" error={errors['interview.documents_to_carry']} className="sm:col-span-2">
                        <Textarea value={form.interview.documents_to_carry} onChange={setIv('documents_to_carry')} />
                    </Field>
                    <Field label="Reporting instructions" error={errors['interview.instructions']} className="sm:col-span-2">
                        <Textarea value={form.interview.instructions} onChange={setIv('instructions')} />
                    </Field>
                </div>
            )}
        </StepCard>
    );
}

interface AttachmentProps {
    advertisement: File | null;
    onAdvertisement: (f: File | null) => void;
    existing: { advertisement: string | null };
    errors: Record<string, string>;
}

function PdfField({ label, file, onChange, existingUrl, error, required }: { label: string; file: File | null; onChange: (f: File | null) => void; existingUrl: string | null; error?: string; required?: boolean }) {
    return (
        <Field label={label} required={required} error={error}>
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
export function AttachmentsStep({ advertisement, onAdvertisement, existing, errors }: AttachmentProps) {
    return (
        <StepCard title="Attachments" description="The advertisement PDF is required before publishing.">
            <div className="grid gap-6 sm:grid-cols-2">
                <PdfField label="Official advertisement PDF" required file={advertisement} onChange={onAdvertisement} existingUrl={existing.advertisement} error={errors.advertisement_pdf} />
            </div>
        </StepCard>
    );
}
