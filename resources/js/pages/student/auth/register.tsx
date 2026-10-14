import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, TriangleAlert, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/animate-ui/components/radix/radio-group';
import { FormField } from '@/components/student/form-field';
import { OtpField } from '@/components/student/otp-field';
import { Panel } from '@/components/student/panel';
import { PasswordStrength } from '@/components/student/password-strength';
import { RegisterStepper } from '@/components/student/register-stepper';
import { RegisterSuccess } from '@/components/student/register-success';
import { RequiredMark } from '@/components/student/required-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import StudentLayout from '@/layouts/student-layout';
import { emptyRegister, ageHint, isValidEmail, isValidMobile, validateRegister } from '@/lib/register-validation';
import type { RegisterData, RegisterErrors } from '@/lib/register-validation';

const categories = ['UR', 'SC', 'ST', 'OBC', 'EWS'];

const steps: { label: string; fields: (keyof RegisterData)[] }[] = [
    { label: 'Personal Details', fields: ['fullName', 'fatherName', 'motherName', 'dob', 'gender', 'category'] },
    { label: 'Contact & Verification', fields: ['mobile', 'email'] },
    { label: 'Account Security', fields: ['password', 'confirmPassword'] },
    { label: 'Declaration', fields: [] },
];
const lastStep = steps.length - 1;

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <fieldset className="grid gap-4">
            <legend className="mb-1 w-full text-base font-semibold text-primary-deep">{title}</legend>
            <Separator className="-mt-2" />
            <div className="grid gap-4 md:grid-cols-2">{children}</div>
        </fieldset>
    );
}

export default function Register() {
    const form = useForm<RegisterData>({ ...emptyRegister });
    const [errors, setErrors] = useState<RegisterErrors>({});
    const [verified, setVerified] = useState({ mobile: false, email: false });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [registrationNo, setRegistrationNo] = useState<string | null>(null);
    const { data } = form;

    const set = <K extends keyof RegisterData>(key: K, value: RegisterData[K]) => {
        form.setData((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

    const validateOne = (key: keyof RegisterData) =>
        setErrors((prev) => ({ ...prev, [key]: validateRegister(data, verified)[key] }));

    const { age, message: ageMessage } = ageHint(data.dob);
    const canSubmit = data.declaration && verified.mobile && verified.email && !loading;

    const goNext = () => {
        const all = validateRegister(data, verified);
        const stepErrors: RegisterErrors = {};

        steps[step].fields.forEach((key) => {
            if (all[key]) {
                stepErrors[key] = all[key];
            }
        });
        setErrors((prev) => ({ ...prev, ...stepErrors }));

        if (Object.keys(stepErrors).length > 0) {
            toast.error('Please correct the highlighted fields');

            return;
        }

        setStep((n) => n + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => setStep((n) => Math.max(0, n - 1));

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        if (step < lastStep) {
            goNext();

            return;
        }

        const next = validateRegister(data, verified);

        setErrors(next);

        if (Object.keys(next).length > 0) {
            toast.error('Please correct the highlighted fields');

            return;
        }

        // UI-only: replace with form.post(...) when registration is wired to the backend.
        setLoading(true);
        window.setTimeout(() => {
            setLoading(false);
            setRegistrationNo('HRP2026000123');
        }, 1000);
    };

    const onReset = () => {
        form.setData({ ...emptyRegister });
        setErrors({});
        setVerified({ mobile: false, email: false });
        setStep(0);
    };

    const text = (key: keyof RegisterData, label: string, extra?: { hint?: string; autoComplete?: string }) => (
        <FormField id={`reg-${key}`} label={label} required error={errors[key]} hint={extra?.hint}>
            {(aria) => (
                <Input
                    {...aria}
                    value={String(data[key])}
                    onChange={(e) => set(key, e.target.value as never)}
                    onBlur={() => validateOne(key)}
                    autoComplete={extra?.autoComplete}
                    className="h-11"
                />
            )}
        </FormField>
    );

    if (registrationNo) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10">
                <Head title="Registration Successful" />
                <RegisterSuccess registrationNo={registrationNo} />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Head title="New Registration" />
            <Panel title="New Applicant Registration" icon={UserPlus}>
                <div role="note" className="mb-6 flex gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                    <p>
                        <strong className="text-destructive">Important:</strong> Fill your details exactly as in your Class 10 certificate. Name and Date of Birth cannot be changed after registration.
                    </p>
                </div>

                <RegisterStepper steps={steps.map((x) => x.label)} current={step} />
                <form onSubmit={onSubmit} onReset={(e) => { e.preventDefault(); onReset(); }} noValidate className="grid gap-8">
                    {step === 0 && (
<Section title="Personal Details">
                        {text('fullName', 'Full Name (as in Class 10 certificate)', { autoComplete: 'name' })}
                        {text('fatherName', "Father's Name")}
                        {text('motherName', "Mother's Name")}
                        <FormField id="reg-dob" label="Date of Birth" required error={errors.dob} hint={age !== null ? `Age: ${age} years${ageMessage ? ` — ${ageMessage}` : ''}` : undefined}>
                            {(aria) => (
                                <Input {...aria} type="date" value={data.dob} max="2026-10-14" onChange={(e) => set('dob', e.target.value)} onBlur={() => validateOne('dob')} className="h-11" />
                            )}
                        </FormField>
                        <FormField id="reg-gender" label="Gender" required error={errors.gender}>
                            {(aria) => (
                                <RadioGroup value={data.gender} onValueChange={(v) => set('gender', v)} className="flex flex-wrap gap-4" aria-invalid={aria['aria-invalid']} aria-describedby={aria['aria-describedby']}>
                                    {['Male', 'Female', 'Transgender'].map((g) => (
                                        <div key={g} className="flex min-h-11 items-center gap-2">
                                            <RadioGroupItem id={`reg-gender-${g}`} value={g} />
                                            <Label htmlFor={`reg-gender-${g}`} className="font-normal">{g}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </FormField>
                        <FormField id="reg-category" label="Category" required error={errors.category}>
                            {(aria) => (
                                <Select value={data.category} onValueChange={(v) => set('category', v)}>
                                    <SelectTrigger {...aria} className="h-11 w-full">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </FormField>
                        <FormField id="reg-pwbd" label="Person with Benchmark Disability?">
                            {() => (
                                <RadioGroup value={data.pwbd} onValueChange={(v) => set('pwbd', v)} className="flex gap-4" aria-labelledby="reg-pwbd">
                                    {['yes', 'no'].map((v) => (
                                        <div key={v} className="flex min-h-11 items-center gap-2">
                                            <RadioGroupItem id={`reg-pwbd-${v}`} value={v} />
                                            <Label htmlFor={`reg-pwbd-${v}`} className="font-normal capitalize">{v}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </FormField>
                    </Section>
)}

                    {step === 1 && (
<Section title="Contact & Verification">
                        <OtpField
                            id="reg-mobile"
                            label="Mobile Number"
                            kind="mobile"
                            value={data.mobile}
                            onChange={(v) => set('mobile', v)}
                            onBlur={() => validateOne('mobile')}
                            canSend={isValidMobile(data.mobile)}
                            verified={verified.mobile}
                            onVerified={() => { setVerified((p) => ({ ...p, mobile: true })); setErrors((p) => ({ ...p, mobile: undefined })); }}
                            onReset={() => setVerified((p) => ({ ...p, mobile: false }))}
                            error={errors.mobile}
                        />
                        <OtpField
                            id="reg-email"
                            label="Email"
                            kind="email"
                            value={data.email}
                            onChange={(v) => set('email', v)}
                            onBlur={() => validateOne('email')}
                            canSend={isValidEmail(data.email)}
                            verified={verified.email}
                            onVerified={() => { setVerified((p) => ({ ...p, email: true })); setErrors((p) => ({ ...p, email: undefined })); }}
                            onReset={() => setVerified((p) => ({ ...p, email: false }))}
                            error={errors.email}
                        />
                    </Section>
)}

                    {step === 2 && (
<Section title="Account Security">
                        <div className="grid content-start gap-3">
                            <FormField id="reg-password" label="Password" required error={errors.password}>
                                {(aria) => (
                                    <div className="relative">
                                        <Input {...aria} type={showPw ? 'text' : 'password'} value={data.password} onChange={(e) => set('password', e.target.value)} onBlur={() => validateOne('password')} autoComplete="new-password" className="h-11 pr-11" />
                                        <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Hide password' : 'Show password'} className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                                            {showPw ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                                        </button>
                                    </div>
                                )}
                            </FormField>
                            <PasswordStrength password={data.password} />
                        </div>
                        <FormField id="reg-confirm" label="Confirm Password" required error={errors.confirmPassword}>
                            {(aria) => (
                                <Input {...aria} type="password" value={data.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} onBlur={() => validateOne('confirmPassword')} autoComplete="new-password" className="h-11" />
                            )}
                        </FormField>
                    </Section>
)}

                    {step === 3 && (
<Section title="Declaration">
                        <div className="flex items-start gap-3 md:col-span-2">
                            <Checkbox id="reg-declaration" checked={data.declaration} onCheckedChange={(c) => set('declaration', c === true)} className="mt-0.5" />
                            <Label htmlFor="reg-declaration" className="leading-snug font-normal">
                                I hereby declare that the information provided is true and correct to the best of my knowledge.
                                <RequiredMark />
                            </Label>
                        </div>
                    </Section>
)}

                    <div className="flex flex-wrap items-center gap-3">
                        {step > 0 && (
                            <Button type="button" variant="outline" onClick={goBack} className="h-11 min-w-32 border-primary text-primary hover:bg-primary-tint">
                                <ArrowLeft className="size-4" aria-hidden="true" />
                                Back
                            </Button>
                        )}
                        {step < lastStep ? (
                            <Button type="button" onClick={goNext} className="h-11 min-w-32 hover:bg-primary-hover">
                                Next
                                <ArrowRight className="size-4" aria-hidden="true" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={!canSubmit} className="h-11 min-w-32 hover:bg-primary-hover">
                                {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                                Register
                            </Button>
                        )}
                        <Button type="reset" variant="ghost" className="h-11 text-muted-foreground">
                            Reset
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Already registered?{' '}
                        <Link href="/login" className="font-medium text-link hover:underline">Login here</Link>
                    </p>
                </form>
            </Panel>
        </div>
    );
}

Register.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
