import { Briefcase, Plus, Trash2 } from 'lucide-react';
import { DateField } from '@/components/student/profile/date-field';
import { FileField, Section, SelectField, TextField, YesNoField } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { emptyExperience } from '@/lib/profile';
import type { ExperienceData, ExperienceEntry } from '@/lib/profile';

const MAX_ROWS = 10;

export function ExperienceStep({ data, set, err, options, rules }: StepProps<ExperienceData>) {
    const has = data.has_experience === 'yes';

    const update = (index: number, patch: Partial<ExperienceEntry>) =>
        set({ entries: data.entries.map((row, i) => (i === index ? { ...row, ...patch } : row)) });

    const toggle = (value: 'yes' | 'no') =>
        set({ has_experience: value, entries: value === 'yes' && data.entries.length === 0 ? [{ ...emptyExperience }] : data.entries });

    return (
        <div className="grid gap-8">
            <Section title="Work Experience" icon={Briefcase}>
                <YesNoField id="x-has_experience" label="Do you have any work experience?" required value={data.has_experience} onChange={toggle} error={err('has_experience')} />
            </Section>

            {has && (
                <div className="grid gap-6">
                    {err('entries') && <p role="alert" className="text-sm text-destructive">{err('entries')}</p>}

                    {data.entries.map((x, i) => {
                        const e = (key: string) => err(`entries.${i}.${key}`);
                        const id = (key: string) => `x${i}-${key}`;

                        return (
                            <fieldset key={i} className="rounded-xl border bg-muted/10 p-4">
                                <legend className="flex items-center gap-3 px-2 text-sm font-semibold text-primary-deep">
                                    <Briefcase className="size-4 text-primary" aria-hidden="true" /> Experience {i + 1}
                                    {data.entries.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => set({ entries: data.entries.filter((_, n) => n !== i) })}>
                                            <Trash2 className="mr-1 size-4" /> Remove
                                        </Button>
                                    )}
                                </legend>
                                <div className="grid gap-x-6 gap-y-5 md:grid-cols-2">
                                    <TextField id={id('employer')} label="Organization / Employer" required value={x.employer} onChange={(v) => update(i, { employer: v })} error={e('employer')} />
                                    <TextField id={id('designation')} label="Designation" required value={x.designation} onChange={(v) => update(i, { designation: v })} error={e('designation')} />
                                    <SelectField id={id('sector')} label="Sector" required value={x.sector} onChange={(v) => update(i, { sector: v })} options={options.sectors} error={e('sector')} />
                                    <div className="grid content-start gap-2">
                                        <span className="text-sm font-medium">Currently working here?</span>
                                        <div className="flex min-h-11 items-center gap-3">
                                            <Switch checked={x.currently_working} onCheckedChange={(on) => update(i, { currently_working: on, to_date: on ? '' : x.to_date })} aria-label="Currently working here" />
                                            <span className="text-sm font-medium">{x.currently_working ? 'Yes' : 'No'}</span>
                                        </div>
                                    </div>
                                    <DateField id={id('from_date')} label="From Date" required value={x.from_date} onChange={(v) => update(i, { from_date: v })} error={e('from_date')} />
                                    {!x.currently_working && (
                                        <DateField id={id('to_date')} label="To Date" required value={x.to_date} onChange={(v) => update(i, { to_date: v })} error={e('to_date')} />
                                    )}
                                    <FileField id={id('document')} label="Experience Certificate" required field="experience_document" rule={rules.experience_document} value={x.document} onChange={(v) => update(i, { document: v })} error={e('document') ?? e('document.path')} />
                                </div>
                            </fieldset>
                        );
                    })}

                    <div>
                        <Button type="button" variant="outline" disabled={data.entries.length >= MAX_ROWS} onClick={() => set({ entries: [...data.entries, { ...emptyExperience }] })}>
                            <Plus className="mr-1.5 size-4" /> Add Experience
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
