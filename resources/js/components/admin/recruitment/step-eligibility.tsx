import { eligibilitySummary } from '@/components/admin/recruitment/eligibility';
import { Field, NativeSelect, StepCard } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import { isContractualOnly } from '@/components/admin/recruitment/types';
import type { RecruitmentForm } from '@/components/admin/recruitment/types';
import { Input } from '@/components/ui/input';

/** Live sentence the candidate side will enforce. */
export function EligibilitySummary({ form }: { form: RecruitmentForm }) {
    return (
        <div className="rounded-lg border border-primary/30 bg-primary-tint p-4">
            <p className="text-xs font-semibold tracking-wide text-primary-deep uppercase">Eligibility summary (as candidates will see it)</p>
            <p className="mt-1 text-sm text-primary-deep">{eligibilitySummary(form)}</p>
        </div>
    );
}

/** Step 4 */
export function EligibilityStep({ form, update, errors }: StepProps) {
    const e = form.eligibility;
    const contractual = isContractualOnly(form);
    const err = (k: string) => errors[`eligibility.${k}`];
    const set = (k: 'age_min' | 'age_max' | 'age_cutoff' | 'min_experience_years') => (ev: { target: { value: string } }) => update((d) => { d.eligibility[k] = ev.target.value; });

    return (
        <StepCard title="Eligibility Rules" description="These rules automatically block ineligible candidates on the apply screen.">
            <EligibilitySummary form={form} />

            <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Minimum age" required error={err('age_min')}><Input type="number" min={14} value={e.age_min} onChange={set('age_min')} /></Field>
                <Field label="Maximum age" required={!contractual} error={err('age_max')}><Input type="number" min={14} value={e.age_max} onChange={set('age_max')} aria-invalid={Boolean(err('age_max'))} /></Field>
                <Field label="Age cut-off date" required={!contractual || Boolean(e.age_max)} error={err('age_cutoff')}><Input type="date" value={e.age_cutoff} onChange={set('age_cutoff')} /></Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Minimum experience (years)"><Input type="number" min={0} step="0.5" value={e.min_experience_years} onChange={set('min_experience_years')} /></Field>
                <Field label="Gender restriction">
                    <NativeSelect value={e.gender} onChange={(ev) => update((d) => { d.eligibility.gender = ev.target.value as 'any' | 'male' | 'female'; })}>
                        <option value="any">No restriction</option>
                        <option value="female">Female only</option>
                        <option value="male">Male only</option>
                    </NativeSelect>
                </Field>
            </div>
        </StepCard>
    );
}
