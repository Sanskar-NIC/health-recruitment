import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/student/form-field';
import { Panel } from '@/components/student/panel';
import { isStrongEnough, PasswordStrength } from '@/components/student/password-strength';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StudentLayout from '@/layouts/student-layout';

type Errors = Partial<Record<'identifier' | 'otp' | 'password' | 'confirm', string>>;

// UI-only: no request is sent; replace the toasts with backend calls later.
export default function ForgotPassword() {
    const form = useForm({ identifier: '', otp: '', password: '', confirm: '' });
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [errors, setErrors] = useState<Errors>({});
    const { data } = form;

    const set = (key: keyof typeof data, value: string) => {
        form.setData(key, value);
        setErrors((p) => ({ ...p, [key]: undefined }));
    };

    const sendOtp = (event: FormEvent) => {
        event.preventDefault();

        const next: Errors = {};

        if (!data.identifier.trim()) {
            next.identifier = 'Registration No., mobile or email is required';
        }

        setErrors(next);

        if (Object.keys(next).length === 0) {
            setStep('reset');
            toast.success('OTP sent (demo: enter any 6 digits)');
        }
    };

    const resetPassword = (event: FormEvent) => {
        event.preventDefault();

        const next: Errors = {};

        if (!/^\d{6}$/.test(data.otp)) {
            next.otp = 'Enter the 6-digit OTP';
        }

        if (!isStrongEnough(data.password)) {
            next.password = 'Password does not meet all the rules';
        }

        if (data.confirm !== data.password || !data.confirm) {
            next.confirm = 'Passwords do not match';
        }

        setErrors(next);

        if (Object.keys(next).length === 0) {
            toast.success('Password reset (demo only). Please log in.');
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <Head title="Forgot Password" />
            <Panel title="Forgot Password" icon={KeyRound}>
                {step === 'request' ? (
                    <form onSubmit={sendOtp} noValidate className="grid gap-4">
                        <FormField id="fp-identifier" label="Registration No. or Mobile / Email" required error={errors.identifier}>
                            {(aria) => <Input {...aria} value={data.identifier} onChange={(e) => set('identifier', e.target.value)} className="h-11" />}
                        </FormField>
                        <Button type="submit" className="h-11 w-full font-medium hover:bg-primary-hover">Send OTP</Button>
                    </form>
                ) : (
                    <form onSubmit={resetPassword} noValidate className="grid gap-4">
                        <FormField id="fp-otp" label="OTP" required error={errors.otp}>
                            {(aria) => <Input {...aria} inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={data.otp} onChange={(e) => set('otp', e.target.value.replace(/\D/g, ''))} className="h-11" />}
                        </FormField>
                        <FormField id="fp-password" label="New Password" required error={errors.password}>
                            {(aria) => <Input {...aria} type="password" autoComplete="new-password" value={data.password} onChange={(e) => set('password', e.target.value)} className="h-11" />}
                        </FormField>
                        <PasswordStrength password={data.password} />
                        <FormField id="fp-confirm" label="Confirm Password" required error={errors.confirm}>
                            {(aria) => <Input {...aria} type="password" autoComplete="new-password" value={data.confirm} onChange={(e) => set('confirm', e.target.value)} className="h-11" />}
                        </FormField>
                        <Button type="submit" className="h-11 w-full font-medium hover:bg-primary-hover">Reset Password</Button>
                    </form>
                )}
                <p className="mt-4 text-center text-sm">
                    <Link href="/login" className="font-medium text-link hover:underline">Back to Login</Link>
                </p>
            </Panel>
        </div>
    );
}

ForgotPassword.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
