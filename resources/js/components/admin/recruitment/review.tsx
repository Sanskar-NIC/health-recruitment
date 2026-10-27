import { FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { EligibilitySummary } from '@/components/admin/recruitment/step-eligibility';
import type { Options, RecruitmentForm } from '@/components/admin/recruitment/types';

export function fmtDate(iso?: string | null) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('T')[0].split('-');

    return `${d}-${m}-${y}`;
}

export function Block({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <h3 className="border-b bg-muted/40 px-4 py-2.5 text-sm font-semibold text-primary-deep">{title}</h3>
            <div className="p-4">{children}</div>
        </section>
    );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-0.5 py-1.5 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium sm:col-span-2">{value || '—'}</dd>
        </div>
    );
}

interface Props {
    form: RecruitmentForm;
    options: Options;
    advertisementUrl?: string | null;
    syllabusUrl?: string | null;
    pendingFiles?: { advertisement?: string; syllabus?: string };
}

export const totalVacancies = (form: RecruitmentForm) => form.posts.reduce((t, p) => t + (Number(p.total_vacancies) || 0), 0);

export function BasicSection({ form }: { form: RecruitmentForm }) {
    return (
            <Block title="Basic information">
                <dl className="divide-y">
                    <Row label="Advertisement No." value={form.basic.advt_no} />
                    <Row label="Title" value={form.basic.title} />
                    <Row label="Directorate" value={form.basic.directorate} />
                    <Row label="Reference / Memo No." value={form.basic.reference_no} />
                    <Row label="Date of notification" value={fmtDate(form.basic.notification_date)} />
                    <Row label="Description" value={form.basic.description} />
                </dl>
            </Block>
    );
}

export function PostsSection({ form, options }: { form: RecruitmentForm; options: Options }) {
    const total = totalVacancies(form);

    return (
            <Block title={`Posts · ${total} vacancies`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">Post</th>
                                <th className="py-2 pr-3 font-medium">Monthly salary</th>
                                {options.categories.map((c) => <th key={c} className="py-2 pr-3 text-right font-medium">{c}</th>)}
                                <th className="py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.posts.map((p, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-2 pr-3 font-medium">{p.name}{p.code && <span className="ml-1 text-muted-foreground">({p.code})</span>}</td>
                                    <td className="py-2 pr-3">{p.monthly_salary ? `₹${Number(p.monthly_salary).toLocaleString('en-IN')}` : '—'}</td>
                                    {p.is_contractual && !Object.values(p.category_breakup).some(Boolean) ? (
                                        <td colSpan={options.categories.length} className="py-2 pr-3 text-center text-muted-foreground">Contractual{p.contract_duration ? ` · ${p.contract_duration} ${p.contract_unit}${Number(p.contract_duration) > 1 ? 's' : ''}` : ''}{p.reserved_for ? ` · ${p.reserved_for}` : ''}</td>
                                    ) : options.categories.map((c) => {
                                        const w = p.horizontal.women[c];
                                        const x = p.horizontal.ex_serviceman[c];

                                        return (
                                            <td key={c} className="py-2 pr-3 text-right">
                                                {p.category_breakup[c] || 0}
                                                {(w || x) && <span className="block text-xs font-normal text-muted-foreground">{[w && `${w} W`, x && `${x} ESM`].filter(Boolean).join(' · ')}</span>}
                                            </td>
                                        );
                                    })}
                                    <td className="py-2 text-right font-semibold">{p.total_vacancies || 0}{p.horizontal.pwbd && <span className="block text-xs font-normal text-muted-foreground">{p.horizontal.pwbd} PwBD</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Block>
    );
}

export function EligibilitySection({ form }: { form: RecruitmentForm }) {
    return <Block title="Eligibility"><EligibilitySummary form={form} /></Block>;
}

export function FeeSection({ form, options }: { form: RecruitmentForm; options: Options }) {
    return (
            <Block title="Application fee">
                <div className="flex flex-wrap gap-2">
                    {options.feeCategories.map((c) => (
                        <span key={c} className="rounded-md bg-muted px-3 py-1.5 text-sm">{c}: <strong>₹{form.fees.amounts[c] || 0}</strong></span>
                    ))}
                </div>
            </Block>
    );
}

export function DocumentsSection({ form, options }: { form: RecruitmentForm; options: Options }) {
    return (
            <Block title="Documents required">
                <p className="text-sm">{form.documents.required.map((k) => options.documents[k]).join(', ') || '—'}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Photo {form.documents.photo.min_kb || '?'}–{form.documents.photo.max_kb || '?'} KB · Signature {form.documents.signature.min_kb || '?'}–{form.documents.signature.max_kb || '?'} KB
                </p>
            </Block>
    );
}

export function DatesSection({ form }: { form: RecruitmentForm }) {
    return (
            <Block title="Important dates">
                <dl className="divide-y">
                    {form.basic.selection_mode === 'interview' ? (
                        <>
                            <Row label="Process" value={form.basic.apply_mode === 'walk_in' ? 'Interview only · walk-in' : 'Interview only · apply online'} />
                            {form.basic.apply_mode === 'online' && <Row label="Application start" value={fmtDate(form.dates.app_start)} />}
                            {form.basic.apply_mode === 'online' && <Row label="Application end" value={fmtDate(form.dates.app_end)} />}
                            <Row label="Interview" value={`${fmtDate(form.interview.date)}${form.interview.date_to && form.interview.date_to !== form.interview.date ? ` to ${fmtDate(form.interview.date_to)}` : ''}${form.interview.time ? `, ${form.interview.time}` : ''}`} />
                            <Row label="Venue" value={form.interview.venue || '—'} />
                        </>
                    ) : (
                        <>
                            <Row label="Application start" value={fmtDate(form.dates.app_start)} />
                            <Row label="Application end" value={fmtDate(form.dates.app_end)} />
                            <Row label="Fee last date" value={fmtDate(form.dates.fee_last_date)} />
                            <Row label="Correction window ends" value={fmtDate(form.dates.correction_end)} />
                            <Row label="Admit card release" value={fmtDate(form.dates.admit_card_date)} />
                            <Row label="Exam date" value={fmtDate(form.dates.exam_date)} />
                            <Row label="Tentative result" value={fmtDate(form.dates.result_date)} />
                        </>
                    )}
                </dl>
            </Block>
    );
}

export function AttachmentsSection({ advertisementUrl, syllabusUrl, pendingFiles }: Pick<Props, 'advertisementUrl' | 'syllabusUrl' | 'pendingFiles'>) {
    return (
            <Block title="Attachments">
                <ul className="grid gap-1.5 text-sm">
                    {[
                        ['Advertisement PDF', advertisementUrl, pendingFiles?.advertisement],
                        ['Syllabus PDF', syllabusUrl, pendingFiles?.syllabus],
                    ].map(([label, url, pending]) => (
                        <li key={label} className="flex items-center gap-2">
                            <FileText className="size-4 text-primary" aria-hidden="true" />
                            {label}:{' '}
                            {pending ? <span>{pending} (will upload on save)</span> : url ? <a href={url} target="_blank" rel="noreferrer" className="text-link hover:underline">View</a> : <span className="text-muted-foreground">not uploaded</span>}
                        </li>
                    ))}
                </ul>
            </Block>
    );
}

/** Everything the admin has entered, laid out like the candidate-facing notice. */
export function RecruitmentReview({ form, options, advertisementUrl, syllabusUrl, pendingFiles }: Props) {
    return (
        <div className="grid gap-5">
            <BasicSection form={form} />
            <PostsSection form={form} options={options} />
            <EligibilitySection form={form} />
            <FeeSection form={form} options={options} />
            <DocumentsSection form={form} options={options} />
            <DatesSection form={form} />
            <AttachmentsSection advertisementUrl={advertisementUrl} syllabusUrl={syllabusUrl} pendingFiles={pendingFiles} />
        </div>
    );
}
