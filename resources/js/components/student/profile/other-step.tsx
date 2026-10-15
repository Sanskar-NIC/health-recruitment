import { ClipboardList, Ruler } from 'lucide-react';
import { DateField } from '@/components/student/profile/date-field';
import { Section, SelectField, TextField, YesNoField } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import type { OtherData } from '@/lib/profile';

export function OtherStep({ data: d, set, err, options, gender }: StepProps<OtherData> & { gender: string }) {
    const num = (key: 'height_cm' | 'chest_cm' | 'weight_kg', label: string) => (
        <TextField id={`o-${key}`} label={label} inputMode="decimal" value={d[key]} onChange={(v) => set({ [key]: v })} error={err(key)} />
    );

    return (
        <div className="grid gap-8">
            <Section title="Other Details" icon={ClipboardList}>
                <YesNoField id="o-is_bpl" label="Are you a BPL card holder?" required value={d.is_bpl} onChange={(v) => set({ is_bpl: v })} error={err('is_bpl')} />
                {d.is_bpl === 'yes' && (
                    <>
                        <TextField id="o-bpl_number" label="BPL Registration No" required value={d.bpl_number} onChange={(v) => set({ bpl_number: v })} error={err('bpl_number')} />
                        <SelectField id="o-bpl_district" label="BPL Certificate District" required value={d.bpl_district} onChange={(v) => set({ bpl_district: v })} options={options.districts} error={err('bpl_district')} />
                        <DateField id="o-bpl_date" label="BPL Registration Date" value={d.bpl_date} onChange={(v) => set({ bpl_date: v })} error={err('bpl_date')} />
                    </>
                )}
                <YesNoField id="o-is_govt_employee" label="Are you a govt. employee?" required value={d.is_govt_employee} onChange={(v) => set({ is_govt_employee: v })} error={err('is_govt_employee')} />
                <YesNoField id="o-is_ex_serviceman" label="Are you an Ex-serviceman?" required value={d.is_ex_serviceman} onChange={(v) => set({ is_ex_serviceman: v })} error={err('is_ex_serviceman')} />
            </Section>

            <Section title="Physical Standards" icon={Ruler}>
                {num('height_cm', 'Height (CM)')}
                {gender === 'Male' && num('chest_cm', 'Chest (CM) (Male only)')}
                {num('weight_kg', 'Weight (KG)')}
            </Section>
        </div>
    );
}
