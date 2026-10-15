import { FileText } from 'lucide-react';
import type { ReactNode } from 'react';
import { EligibilitySummary } from '@/components/admin/recruitment/step-eligibility';
import type { Options, RecruitmentForm } from '@/components/admin/recruitment/types';

export function fmtDate(iso?: string | null) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('T')[0].split('-');

    return `${d}-${m}-${y}`;
}

function Block({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-lg border bg-card p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-primary-deep">{title}</h3>
            {children}
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

/** Everything the admin has entered, laid out like the candidate-facing notice. */
export function RecruitmentReview({ form, options, advertisementUrl, syllabusUrl, pendingFiles }: Props) {
    const total = form.posts.reduce((t, p) => t + (Number(p.total_vacancies) || 0), 0);

    return (
        <div className="grid gap-5">
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

            <Block title={`Posts · ${total} vacancies`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-muted-foreground">
                                <th className="py-2 pr-3 font-medium">Post</th>
                                <th className="py-2 pr-3 font-medium">Pay level</th>
                                <th className="py-2 pr-3 font-medium">Group</th>
                                {options.categories.map((c) => <th key={c} className="py-2 pr-3 text-right font-medium">{c}</th>)}
                                <th className="py-2 text-right font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.posts.map((p, i) => (
                                <tr key={i} className="border-b last:border-0">
                                    <td className="py-2 pr-3 font-medium">{p.name}{p.code && <span className="ml-1 text-muted-foreground">({p.code})</span>}</td>
                                    <td className="py-2 pr-3">{p.pay_level || '—'}</td>
                                    <td className="py-2 pr-3">{p.group || '—'}</td>
                                    {options.categories.map((c) => {
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

            <Block title="Eligibility"><EligibilitySummary form={form} /></Block>

            <Block title="Application fee">
                <div className="flex flex-wrap gap-2">
                    {options.feeCategories.map((c) => (
                        <span key={c} className="rounded-md bg-muted px-3 py-1.5 text-sm">{c}: <strong>₹{form.fees.amounts[c] || 0}</strong></span>
                    ))}
                </div>
            </Block>

            <Block title="Documents required">
                <p className="text-sm">{form.documents.required.map((k) => options.documents[k]).join(', ') || '—'}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    Photo {form.documents.photo.min_kb || '?'}–{form.documents.photo.max_kb || '?'} KB · Signature {form.documents.signature.min_kb || '?'}–{form.documents.signature.max_kb || '?'} KB
                </p>
            </Block>

            <Block title="Important dates">
                <dl className="divide-y">
                    <Row label="Application start" value={fmtDate(form.dates.app_start)} />
                    <Row label="Application end" value={fmtDate(form.dates.app_end)} />
                    <Row label="Fee last date" value={fmtDate(form.dates.fee_last_date)} />
                    <Row label="Correction window ends" value={fmtDate(form.dates.correction_end)} />
                    <Row label="Admit card release" value={fmtDate(form.dates.admit_card_date)} />
                    <Row label="Exam date" value={fmtDate(form.dates.exam_date)} />
                    <Row label="Tentative result" value={fmtDate(form.dates.result_date)} />
                </dl>
            </Block>

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
        </div>
    );
}
