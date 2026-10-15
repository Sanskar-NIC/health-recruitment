import { CircleCheck, CircleX, FlaskConical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { eligibilitySummary, testEligibility } from '@/components/admin/recruitment/eligibility';
import type { EligibilityCase } from '@/components/admin/recruitment/eligibility';
import { Field, NativeSelect, StepCard } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import type { RecruitmentForm } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Live sentence the candidate side will enforce. */
export function EligibilitySummary({ form }: { form: RecruitmentForm }) {
    return (
        <div className="rounded-lg border border-primary/30 bg-primary-tint p-4">
            <p className="text-xs font-semibold tracking-wide text-primary-deep uppercase">Eligibility summary (as candidates will see it)</p>
            <p className="mt-1 text-sm text-primary-deep">{eligibilitySummary(form)}</p>
        </div>
    );
}

function TestEligibility({ form, options }: Pick<StepProps, 'form' | 'options'>) {
    const [c, setC] = useState<EligibilityCase>({ dob: '', category: 'UR', pwbd: false, qualification: '', percent: '', councilRegistered: false, prtc: false, gender: 'female', experience: '' });
    const [result, setResult] = useState<ReturnType<typeof testEligibility> | null>(null);
    const set = <K extends keyof EligibilityCase>(k: K, v: EligibilityCase[K]) => setC((p) => ({ ...p, [k]: v }));

    return (
        <div className="grid gap-5 rounded-lg border border-dashed p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-deep"><FlaskConical className="size-4" aria-hidden="true" /> Test eligibility</h3>
            <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Date of birth"><Input type="date" value={c.dob} onChange={(e) => set('dob', e.target.value)} /></Field>
                <Field label="Category">
                    <NativeSelect value={c.category} onChange={(e) => set('category', e.target.value)}>
                        {options.categories.map((x) => <option key={x}>{x}</option>)}
                    </NativeSelect>
                </Field>
                <Field label="Gender">
                    <NativeSelect value={c.gender} onChange={(e) => set('gender', e.target.value as 'male' | 'female')}>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </NativeSelect>
                </Field>
                <Field label="Qualification">
                    <NativeSelect value={c.qualification} onChange={(e) => set('qualification', e.target.value)}>
                        <option value="">Select</option>
                        {options.qualifications.map((x) => <option key={x}>{x}</option>)}
                    </NativeSelect>
                </Field>
                <Field label="Percentage"><Input type="number" min={0} max={100} value={c.percent} onChange={(e) => set('percent', e.target.value)} /></Field>
                <Field label="Experience (years)"><Input type="number" min={0} value={c.experience} onChange={(e) => set('experience', e.target.value)} /></Field>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {([['pwbd', 'PwBD'], ['councilRegistered', 'Council registered'], ['prtc', 'Has PRTC']] as const).map(([k, label]) => (
                    <label key={k} className="flex items-center gap-2">
                        <input type="checkbox" className="size-4 accent-primary" checked={c[k]} onChange={(e) => set(k, e.target.checked)} /> {label}
                    </label>
                ))}
            </div>
            <div className="flex flex-wrap items-start gap-3">
                <Button type="button" variant="secondary" onClick={() => setResult(testEligibility(form, c))}>Check</Button>
                {result && (
                    <div className={`flex-1 rounded-md p-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                        <p className="flex items-center gap-2 font-semibold">
                            {result.ok ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleX className="size-4" aria-hidden="true" />}
                            {result.ok ? 'Eligible' : 'Not eligible'}
                        </p>
                        {result.reasons.length > 0 && <ul className="mt-1 list-disc pl-5">{result.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
                    </div>
                )}
            </div>
        </div>
    );
}

/** Step 4 */
export function EligibilityStep({ form, update, errors, options }: StepProps) {
    const e = form.eligibility;
    const err = (k: string) => errors[`eligibility.${k}`];
    const set = (k: 'age_min' | 'age_max' | 'age_cutoff' | 'council' | 'min_experience_years') => (ev: { target: { value: string } }) => update((d) => { d.eligibility[k] = ev.target.value; });

    return (
        <StepCard title="Eligibility Rules" description="These rules automatically block ineligible candidates on the apply screen.">
            <EligibilitySummary form={form} />

            <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Minimum age" required error={err('age_min')}><Input type="number" min={14} value={e.age_min} onChange={set('age_min')} /></Field>
                <Field label="Maximum age" required error={err('age_max')}><Input type="number" min={14} value={e.age_max} onChange={set('age_max')} aria-invalid={Boolean(err('age_max'))} /></Field>
                <Field label="Age cut-off date" required error={err('age_cutoff')}><Input type="date" value={e.age_cutoff} onChange={set('age_cutoff')} /></Field>
            </div>

            <div>
                <p className="mb-2 text-sm font-medium">Age relaxation (years added to the maximum age)</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
                    {options.relaxations.map((k) => (
                        <Field key={k} label={k === 'ExServiceman' ? 'Ex-Serviceman' : k}>
                            <Input type="number" min={0} value={e.relaxations[k] ?? ''} onChange={(ev) => update((d) => { d.eligibility.relaxations[k] = ev.target.value; })} />
                        </Field>
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium">Accepted qualifications <span className="font-normal text-muted-foreground">(any one)</span></p>
                    <Button type="button" variant="outline" size="sm" onClick={() => update((d) => { d.eligibility.qualifications.push({ name: '', min_percent: '' }); })}><Plus /> Add</Button>
                </div>
                {err('qualifications') && <p role="alert" className="mb-2 text-xs font-medium text-destructive">{err('qualifications')}</p>}
                {e.qualifications.map((q, i) => (
                    <div key={i} className="mb-2 flex flex-wrap items-center gap-2">
                        <NativeSelect className="max-w-72" value={q.name} onChange={(ev) => update((d) => { d.eligibility.qualifications[i].name = ev.target.value; })}>
                            <option value="">Select qualification</option>
                            {options.qualifications.map((x) => <option key={x}>{x}</option>)}
                        </NativeSelect>
                        <Input className="max-w-36" type="number" min={0} max={100} placeholder="Min %" value={q.min_percent} onChange={(ev) => update((d) => { d.eligibility.qualifications[i].min_percent = ev.target.value; })} />
                        <Button type="button" variant="ghost" size="icon" aria-label="Remove qualification" onClick={() => update((d) => { d.eligibility.qualifications.splice(i, 1); })}><Trash2 className="text-destructive" /></Button>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Professional council registration">
                    <NativeSelect value={e.council} onChange={set('council')}>
                        <option value="">Not required</option>
                        {options.councils.map((x) => <option key={x}>{x}</option>)}
                    </NativeSelect>
                </Field>
                <Field label="Minimum experience (years)"><Input type="number" min={0} step="0.5" value={e.min_experience_years} onChange={set('min_experience_years')} /></Field>
                <Field label="Gender restriction">
                    <NativeSelect value={e.gender} onChange={(ev) => update((d) => { d.eligibility.gender = ev.target.value as 'any' | 'male' | 'female'; })}>
                        <option value="any">No restriction</option>
                        <option value="female">Female only</option>
                        <option value="male">Male only</option>
                    </NativeSelect>
                </Field>
            </div>
            <div className="flex items-center gap-2">
                <input id="prtc" type="checkbox" className="size-4 accent-primary" checked={e.prtc_required} onChange={(ev) => update((d) => { d.eligibility.prtc_required = ev.target.checked; })} />
                <Label htmlFor="prtc" className="font-normal">Domicile: only PRTC (Permanent Resident Certificate) holders can apply</Label>
            </div>

            <TestEligibility form={form} options={options} />
        </StepCard>
    );
}
