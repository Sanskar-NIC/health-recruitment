import { Plus, Trash2 } from 'lucide-react';
import { Field, NativeSelect, StepCard, Textarea } from '@/components/admin/recruitment/ui';
import type { StepProps } from '@/components/admin/recruitment/ui';
import { newPost } from '@/components/admin/recruitment/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/** Step 1 */
export function BasicInfoStep({ form, update, errors, descriptionOnly }: StepProps & { descriptionOnly?: boolean }) {
    const b = form.basic;
    const set = (key: keyof typeof b) => (e: { target: { value: string } }) => update((d) => { d.basic[key] = e.target.value; });
    const locked = Boolean(descriptionOnly);

    return (
        <StepCard title="Basic Information" description="Details exactly as printed in the department notification.">
            {locked && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">This recruitment is published. Only the description, dates and attachments can be changed; every change is logged.</p>}
            <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Advertisement No." required error={errors['basic.advt_no']} htmlFor="advt_no">
                    <Input id="advt_no" value={b.advt_no} onChange={set('advt_no')} disabled={locked} placeholder="HFW/REC/2026/05" aria-invalid={Boolean(errors['basic.advt_no'])} />
                </Field>
                <Field label="Reference / Memo No." error={errors['basic.reference_no']} htmlFor="reference_no">
                    <Input id="reference_no" value={b.reference_no} onChange={set('reference_no')} disabled={locked} placeholder="F.No. 12(3)/HFW/2026" />
                </Field>
                <Field label="Title of recruitment" required error={errors['basic.title']} className="sm:col-span-2" htmlFor="title">
                    <Input id="title" value={b.title} onChange={set('title')} disabled={locked} placeholder="Recruitment for the posts of Staff Nurse and Pharmacist" aria-invalid={Boolean(errors['basic.title'])} />
                </Field>
                <Field label="Issuing directorate" error={errors['basic.directorate']} htmlFor="directorate">
                    <Input id="directorate" value={b.directorate} onChange={set('directorate')} disabled={locked} />
                </Field>
                <Field label="Date of notification" error={errors['basic.notification_date']} htmlFor="notification_date">
                    <Input id="notification_date" type="date" value={b.notification_date} onChange={set('notification_date')} disabled={locked} />
                </Field>
                <Field label="Short description" error={errors['basic.description']} className="sm:col-span-2" htmlFor="description">
                    <Textarea id="description" value={b.description} onChange={set('description')} placeholder="A short summary shown to candidates." />
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
                const set = (key: 'name' | 'code' | 'pay_level' | 'group' | 'total_vacancies') => (e: { target: { value: string } }) => update((d) => { d.posts[i][key] = e.target.value; });

                return (
                    <div key={i} className="grid gap-5 rounded-lg border bg-muted/30 p-5 sm:grid-cols-6">
                        <div className="flex items-center justify-between sm:col-span-6">
                            <h3 className="text-sm font-semibold text-primary-deep">Post {i + 1}</h3>
                            {form.posts.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => update((d) => { d.posts.splice(i, 1); })}>
                                    <Trash2 /> Remove
                                </Button>
                            )}
                        </div>
                        <Field label="Post name" required error={err('name')} className="sm:col-span-3">
                            <Input value={post.name} onChange={set('name')} placeholder="Staff Nurse" aria-invalid={Boolean(err('name'))} />
                        </Field>
                        <Field label="Post code" error={err('code')} className="sm:col-span-3">
                            <Input value={post.code} onChange={set('code')} placeholder="SN-01" />
                        </Field>
                        <Field label="Pay level / scale" error={err('pay_level')} className="sm:col-span-3">
                            <Input value={post.pay_level} onChange={set('pay_level')} placeholder="Level 6 (₹29,200 – ₹92,300)" />
                        </Field>
                        <Field label="Group" error={err('group')} className="sm:col-span-1">
                            <NativeSelect value={post.group} onChange={set('group')}>
                                <option value="">Select</option>
                                {options.groups.map((g) => <option key={g} value={g}>{g}</option>)}
                            </NativeSelect>
                        </Field>
                        <Field label="Total vacancies" error={err('total_vacancies')} className="sm:col-span-2">
                            <Input type="number" min={0} value={post.total_vacancies} onChange={set('total_vacancies')} aria-invalid={Boolean(err('total_vacancies'))} />
                        </Field>
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
