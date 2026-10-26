import { Accessibility, Fingerprint, Home, User, Users } from 'lucide-react';
import { DateField } from '@/components/student/profile/date-field';
import { FileField, Section, SelectField, TextField, YesNoField } from '@/components/student/profile/fields';
import type { StepProps } from '@/components/student/profile/types';
import { ageDetail, formatAadhaar } from '@/lib/profile';
import type { PersonalData } from '@/lib/profile';

export function PersonalStep({ data: d, set, err, options, rules }: StepProps<PersonalData>) {
    const resident = d.is_tripura_resident === 'yes';
    const reserved = d.category !== '' && d.category !== 'UR';
    const age = ageDetail(d.dob);

    const text = (key: keyof PersonalData, label: string, extra: { required?: boolean; type?: string; readOnly?: boolean; max?: string } = {}) => (
        <TextField
            id={`p-${key}`}
            label={label}
            value={String(d[key] ?? '')}
            onChange={(v) => set({ [key]: v })}
            error={err(key)}
            {...extra}
        />
    );

    return (
        <div className="grid gap-8">
            <Section title="Tripura Residence Detail" icon={Home}>
                <YesNoField id="p-resident" label="Are you a permanent resident of Tripura?" required value={d.is_tripura_resident} onChange={(v) => set({ is_tripura_resident: v })} error={err('is_tripura_resident')} />
                {resident && (
                    <>
                        {text('prtc_number', 'PRTC Number', { required: true })}
                        <SelectField id="p-prtc_district" label="PRTC Issuing District" required value={d.prtc_district} onChange={(v) => set({ prtc_district: v })} options={options.districts} error={err('prtc_district')} />
                        <DateField id="p-prtc_issue_date" label="PRTC Issue Date" required value={d.prtc_issue_date} onChange={(v) => set({ prtc_issue_date: v })} error={err('prtc_issue_date')} />
                        <FileField id="p-prtc_certificate" label="PRTC Certificate Document" required field="prtc_certificate" rule={rules.prtc_certificate} value={d.prtc_certificate} onChange={(v) => set({ prtc_certificate: v })} error={err('prtc_certificate') ?? err('prtc_certificate.path')} />
                    </>
                )}
            </Section>

            <Section title="Personal Information" icon={User}>
                <SelectField id="p-title" label="Title" required value={d.title} onChange={(v) => set({ title: v })} options={options.titles} error={err('title')} />
                {text('name', 'Name', { required: true, readOnly: true })}
                {text('mobile', 'Mobile No', { required: true, readOnly: true })}
                {text('email', 'Email ID', { required: true, readOnly: true })}
                {text('father_name', "Father's Name", { required: true })}
                {text('mother_name', "Mother's Name", { required: true })}
                {text('nationality', 'Nationality', { required: true })}
                <SelectField id="p-gender" label="Gender" required value={d.gender} onChange={(v) => set({ gender: v })} options={options.genders} error={err('gender')} />
                {text('mother_tongue', 'Mother Tongue', { required: true })}
                <DateField id="p-dob" label="Date of Birth" required disabled value={d.dob} onChange={() => {}} />
                <TextField id="p-age" label="Age" value={age ?? ''} onChange={() => {}} readOnly />
                <SelectField id="p-marital_status" label="Marital Status" required value={d.marital_status} onChange={(v) => set({ marital_status: v })} options={options.maritalStatuses} error={err('marital_status')} />
            </Section>

            <Section title="Identity Details" icon={Fingerprint}>
                <TextField
                    id="p-aadhaar_no"
                    label="Aadhaar No"
                    required
                    inputMode="numeric"

                    value={formatAadhaar(d.aadhaar_no)}
                    onChange={(v) => set({ aadhaar_no: v.replace(/\D/g, '').slice(0, 12) })}
                    error={err('aadhaar_no')}
                />
                {text('aadhaar_name', 'Name on Aadhaar', { required: true })}
                <FileField id="p-aadhaar_front" label="Aadhaar Front Document" required field="aadhaar_front" rule={rules.aadhaar_front} value={d.aadhaar_front} onChange={(v) => set({ aadhaar_front: v })} error={err('aadhaar_front') ?? err('aadhaar_front.path')} />
                <FileField id="p-aadhaar_back" label="Aadhaar Back Document" required field="aadhaar_back" rule={rules.aadhaar_back} value={d.aadhaar_back} onChange={(v) => set({ aadhaar_back: v })} error={err('aadhaar_back') ?? err('aadhaar_back.path')} />
            </Section>

            <Section title="Category Reservation" icon={Users}>
                <SelectField id="p-category" label="Category" required value={d.category} onChange={(v) => set({ category: v })} options={options.categories} error={err('category')} />
                {reserved && (
                    <>
                        {text('cert_number', 'Certificate Number', { required: true })}
                        <SelectField id="p-cert_district" label="Certificate Issuing District" required value={d.cert_district} onChange={(v) => set({ cert_district: v })} options={options.districts} error={err('cert_district')} />
                        <DateField id="p-cert_date" label="Certificate Issuing Date" required value={d.cert_date} onChange={(v) => set({ cert_date: v })} error={err('cert_date')} />
                    </>
                )}
            </Section>

            <Section title="Subcategory Reservation" icon={Accessibility}>
                <YesNoField id="p-is_pwd" label="Are you a Differently Abled Person?" required value={d.is_pwd} onChange={(v) => set({ is_pwd: v })} error={err('is_pwd')} />
                {d.is_pwd === 'yes' && text('ph_percentage', 'PH Percentage', { required: true })}
            </Section>
        </div>
    );
}
