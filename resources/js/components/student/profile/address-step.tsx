import { Home, MapPinned } from 'lucide-react';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { Section, TextField } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import { Label } from '@/components/ui/label';
import type { AddressBlock, AddressData } from '@/lib/profile';

interface BlockProps {
    scope: 'permanent' | 'correspondence';
    value: AddressBlock;
    onChange: (patch: Partial<AddressBlock>) => void;
    err: (path: string) => string | undefined;
    readOnly?: boolean;
}

function AddressFields({ scope, value, onChange, err, readOnly }: BlockProps) {
    const text = (key: keyof AddressBlock, label: string, required = false, extra: { inputMode?: 'numeric'; maxLength?: number } = {}) => (
        <TextField
            id={`a-${scope}-${key}`}
            label={label}
            required={required}
            value={value[key]}
            readOnly={readOnly}
            onChange={(v) => onChange({ [key]: key === 'pincode' ? v.replace(/\D/g, '') : v })}
            error={err(`${scope}.${key}`)}
            {...extra}
        />
    );

    return (
        <>
            {text('house', 'House No./Vill/Town')}
            {text('street', 'Street Name')}
            {text('locality', 'Locality')}
            {text('po', 'P.O.', true)}
            {text('ps', 'P.S.', true)}
            {text('pincode', 'PINCODE', true, { inputMode: 'numeric', maxLength: 6 })}
            {text('state', 'State/UT', true)}
            {text('city', 'City Name', true)}
            {text('district', 'District', true)}
        </>
    );
}

export function AddressStep({ data, set, err }: StepProps<AddressData>) {
    const setBlock = (scope: 'permanent' | 'correspondence') => (patch: Partial<AddressBlock>) =>
        set({ [scope]: { ...data[scope], ...patch } });

    return (
        <div className="grid gap-8">
            <Section title="Permanent Address Details" icon={Home}>
                <AddressFields scope="permanent" value={data.permanent} onChange={setBlock('permanent')} err={err} />
            </Section>

            <Section title="Correspondence Address" icon={MapPinned}>
                <div className="flex items-center gap-2 md:col-span-2">
                    <Checkbox
                        id="a-same"
                        checked={data.same_as_permanent}
                        onCheckedChange={(checked) =>
                            set({
                                same_as_permanent: checked === true,
                                ...(checked === true ? { correspondence: { ...data.permanent } } : {}),
                            })
                        }
                    />
                    <Label htmlFor="a-same" className="font-normal">Same as Permanent Address</Label>
                </div>
                <AddressFields
                    scope="correspondence"
                    value={data.same_as_permanent ? data.permanent : data.correspondence}
                    onChange={setBlock('correspondence')}
                    err={err}
                    readOnly={data.same_as_permanent}
                />
            </Section>
        </div>
    );
}
