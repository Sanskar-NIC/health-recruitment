import { Plus, Trash2 } from 'lucide-react';
import { Field, NativeSelect, StepCard, Textarea } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import { deriveEligibility, newPost } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Step 1 */
export function BasicInfoStep({ form, update, errors, descriptionOnly }: StepProps & { descriptionOnly?: boolean }) {
    const b = form.basic;
    const set = (key: Exclude<keyof typeof b, 'selection_mode' | 'apply_mode'>) => (e: { target: { value: string } }) => update((d) => { d.basic[key] = e.target.value; });
    const locked = Boolean(descriptionOnly);

    return (
        <StepCard title="Basic Information" description="Details exactly as printed in the department notification.">
            {locked && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">This recruitment is published. Only the description, dates and attachments can be changed; every change is logged.</p>}
            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Advertisement No." required error={errors['basic.advt_no']} htmlFor="advt_no">
                    <Input id="advt_no" value={b.advt_no} onChange={set('advt_no')} disabled={locked} aria-invalid={Boolean(errors['basic.advt_no'])} />
                </Field>
                <Field label="Reference / Memo No." error={errors['basic.reference_no']} htmlFor="reference_no">
                    <Input id="reference_no" value={b.reference_no} onChange={set('reference_no')} disabled={locked} />
                </Field>
                <Field label="Title of recruitment" required error={errors['basic.title']} className="sm:col-span-2" htmlFor="title">
                    <Input id="title" value={b.title} onChange={set('title')} disabled={locked} aria-invalid={Boolean(errors['basic.title'])} />
                </Field>
                <Field label="Issuing directorate" error={errors['basic.directorate']} htmlFor="directorate">
                    <Input id="directorate" value={b.directorate} onChange={set('directorate')} disabled={locked} />
                </Field>
                <Field label="Date of notification" error={errors['basic.notification_date']} htmlFor="notification_date">
                    <Input id="notification_date" type="date" value={b.notification_date} onChange={set('notification_date')} disabled={locked} />
                </Field>
                <Field label="Selection process" required className="sm:col-span-2">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {([['exam', 'Written exam & selection'], ['interview', 'Interview only (engagement)']] as const).map(([value, title]) => (
                            <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${b.selection_mode === value ? 'border-primary bg-primary-tint' : ''} ${locked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                <input type="radio" name="selection_mode" className="mt-1 accent-primary" checked={b.selection_mode === value} disabled={locked} onChange={() => update((d) => { d.basic.selection_mode = value; })} />
                                <span className="font-medium">{title}</span>
                            </label>
                        ))}
                    </div>
                </Field>
                {b.selection_mode === 'interview' && (
                    <Field label="How do candidates participate?" required className="sm:col-span-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {([['online', 'Apply online, then interview'], ['walk_in', 'Walk-in']] as const).map(([value, title]) => (
                                <label key={value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${b.apply_mode === value ? 'border-primary bg-primary-tint' : ''} ${locked ? 'cursor-not-allowed opacity-60' : ''}`}>
                                    <input type="radio" name="apply_mode" className="mt-1 accent-primary" checked={b.apply_mode === value} disabled={locked} onChange={() => update((d) => { d.basic.apply_mode = value; })} />
                                    <span className="font-medium">{title}</span>
                                </label>
                            ))}
                        </div>
                    </Field>
                )}
                <Field label="Short description" error={errors['basic.description']} className="sm:col-span-2" htmlFor="description">
                    <Textarea id="description" value={b.description} onChange={set('description')} />
                </Field>
            </div>
        </StepCard>
    );
}

/** Step 2 */
export function PostsStep({ form, update, errors, options }: StepProps) {
    return (
        <StepCard title="Posts" description="Add every post advertised under this notification.">
            {errors.posts && <p className="text-sm font-medium text-destructive">{errors.posts}</p>}
            {form.posts.map((post, i) => {
                const err = (key: string) => errors[`posts.${i}.${key}`];
                const pick = (code: string) => {
                    const m = options.posts.find((x) => x.code === code);

                    update((d) => {
                        const p = d.posts[i];

                        p.name = m?.name ?? '';
                        p.code = m?.code ?? '';
                        p.is_contractual = Boolean(m?.is_contractual);
                        p.contract_unit = m?.is_contractual ? 'month' : '';
                        p.contract_duration = '';
                        p.reserved_for = '';
                        // Master values are only defaults; this notification can change them.
                        p.minimum_qualification = m?.minimum_qualification ?? '';
                        p.preferable_qualification = m?.preferable_qualification ?? '';
                        p.experience_years = m?.experience_required && m.experience_years ? String(m.experience_years) : '';
                        p.experience_criteria = m?.experience_required ? (m.experience_criteria ?? '') : '';
                        deriveEligibility(d, options);
                    });
                };
                const set = (key: 'monthly_salary' | 'total_vacancies' | 'preferable_qualification' | 'age_max' | 'experience_years' | 'experience_criteria' | 'contract_duration') => (e: { target: { value: string } }) => update((d) => { d.posts[i][key] = e.target.value; deriveEligibility(d, options); });

                return (
                    <div key={i} className="grid gap-5 rounded-lg border bg-muted/30 p-5 sm:grid-cols-6">
                        <div className="flex items-center justify-between sm:col-span-6">
                            <h3 className="text-sm font-semibold text-primary-deep">Post {i + 1}{post.is_contractual && <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">Contractual</span>}</h3>
                            {form.posts.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => update((d) => { d.posts.splice(i, 1); deriveEligibility(d, options); })}>
                                    <Trash2 /> Remove
                                </Button>
                            )}
                        </div>
                        <Field label="Post" required error={err('name')} className="sm:col-span-4">
                            <NativeSelect value={post.code || post.name} onChange={(e) => pick(e.target.value)} aria-invalid={Boolean(err('name'))}>
                                <option value="">Select a post</option>
                                {/* A post saved earlier that is no longer in the master stays selectable. */}
                                {post.name && !options.posts.some((m) => m.code === post.code) && <option value={post.code || post.name}>{post.name}</option>}
                                {options.posts.map((m) => <option key={m.code} value={m.code}>{m.name} ({m.code})</option>)}
                            </NativeSelect>
                        </Field>
                        <Field label="Post code" className="sm:col-span-2">
                            <Input value={post.code} readOnly disabled />
                        </Field>
                        <Field label="No. of posts" required error={err('total_vacancies')} className="sm:col-span-2">
                            <Input type="number" min={0} value={post.total_vacancies} onChange={set('total_vacancies')} aria-invalid={Boolean(err('total_vacancies'))} />
                        </Field>
                        <Field label="Monthly salary (₹)" error={err('monthly_salary')} className="sm:col-span-2">
                            <Input type="number" min={0} value={post.monthly_salary} onChange={set('monthly_salary')} />
                        </Field>
                        <Field label="Upper age limit" error={err('age_max')} className="sm:col-span-2">
                            <Input type="number" min={14} value={post.age_max} onChange={set('age_max')} />
                        </Field>
                        <Field label="Minimum qualification" required error={err('minimum_qualification')} className="sm:col-span-3">
                            <Input value={post.minimum_qualification} maxLength={255} onChange={(e) => update((d) => { d.posts[i].minimum_qualification = e.target.value; deriveEligibility(d, options); })} />
                        </Field>
                        <Field label="Preferable qualification" error={err('preferable_qualification')} className="sm:col-span-3">
                            <Input value={post.preferable_qualification} onChange={set('preferable_qualification')} />
                        </Field>
                        <Field label="Experience required (years)" error={err('experience_years')} className="sm:col-span-2">
                            <Input type="number" min={0} step="0.5" value={post.experience_years} onChange={set('experience_years')} />
                        </Field>
                        {Number(post.experience_years) > 0 && (
                            <Field label="Experience details" error={err('experience_criteria')} className="sm:col-span-6">
                                <Input value={post.experience_criteria} maxLength={500} placeholder="e.g. in Mental Health Work, preferable counselling" onChange={set('experience_criteria')} />
                            </Field>
                        )}
                        {post.is_contractual && (
                            <>
                                <Field label="Contract duration" error={err('contract_duration')} className="sm:col-span-2">
                                    <Input type="number" min={1} value={post.contract_duration} onChange={set('contract_duration')} />
                                </Field>
                                <Field label="Duration unit" error={err('contract_unit')} className="sm:col-span-2">
                                    <NativeSelect value={post.contract_unit || 'month'} onChange={(e) => update((d) => { d.posts[i].contract_unit = e.target.value; })}>
                                        <option value="day">Days</option>
                                        <option value="month">Months</option>
                                        <option value="year">Years</option>
                                    </NativeSelect>
                                </Field>
                            </>
                        )}
                    </div>
                );
            })}
            <div>
                <Button type="button" variant="outline" onClick={() => update((d) => { d.posts.push(newPost(options)); })}>
                    <Plus /> Add another post
                </Button>
            </div>
        </StepCard>
    );
}
