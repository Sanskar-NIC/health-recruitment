import { BadgeCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/student/form-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OtpFieldProps {
    id: string;
    label: string;
    kind: 'mobile' | 'email';
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    /** Whether the contact value is valid enough to request an OTP. */
    canSend: boolean;
    verified: boolean;
    onVerified: () => void;
    onReset: () => void;
    error?: string;
}

const RESEND_SECONDS = 30;

// UI-only: only the demo OTP is accepted. Replace with backend verification.
const DEMO_OTP = '123456';

export function OtpField({ id, label, kind, value, onChange, onBlur, canSend, verified, onVerified, onReset, error }: OtpFieldProps) {
    const [sent, setSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState<string>();
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (seconds <= 0) {
            return;
        }

        const timer = window.setTimeout(() => setSeconds((s) => s - 1), 1000);

        return () => window.clearTimeout(timer);
    }, [seconds]);

    const sendOtp = () => {
        setSent(true);
        setOtp('');
        setOtpError(undefined);
        setSeconds(RESEND_SECONDS);
        toast.success(`OTP sent to your ${kind} (demo OTP: ${DEMO_OTP})`);
    };

    const verify = () => {
        if (!/^\d{6}$/.test(otp)) {
            setOtpError('Enter the 6-digit OTP');

            return;
        }

        if (otp !== DEMO_OTP) {
            setOtpError('Incorrect OTP. Please try again.');

            return;
        }

        setOtpError(undefined);
        onVerified();
        toast.success(`${kind === 'mobile' ? 'Mobile number' : 'Email'} verified`);
    };

    const change = (next: string) => {
        onChange(next);

        if (verified || sent) {
            onReset();
            setSent(false);
            setOtp('');
            setSeconds(0);
        }
    };

    return (
        <div className="grid content-start gap-3">
            <FormField id={id} label={label} required error={error}>
                {(aria) => (
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            {kind === 'mobile' && (
                                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                            )}
                            <Input
                                {...aria}
                                type={kind === 'mobile' ? 'tel' : 'email'}
                                inputMode={kind === 'mobile' ? 'numeric' : 'email'}
                                maxLength={kind === 'mobile' ? 10 : undefined}
                                autoComplete={kind === 'mobile' ? 'tel-national' : 'email'}
                                value={value}
                                onChange={(e) => change(kind === 'mobile' ? e.target.value.replace(/\D/g, '') : e.target.value)}
                                onBlur={onBlur}
                                className={kind === 'mobile' ? 'h-11 pl-11' : 'h-11'}
                            />
                        </div>
                        {verified ? (
                            <span className="inline-flex h-11 items-center gap-1 rounded-md bg-success/10 px-3 text-sm font-medium text-success">
                                <BadgeCheck className="size-4" aria-hidden="true" />
                                Verified
                            </span>
                        ) : (
                            <Button type="button" variant="outline" disabled={!canSend || seconds > 0} onClick={sendOtp} className="h-11 border-primary text-primary hover:bg-primary-tint">
                                {sent && seconds > 0 ? `Resend in ${seconds}s` : sent ? 'Resend OTP' : 'Send OTP'}
                            </Button>
                        )}
                    </div>
                )}
            </FormField>
            {sent && !verified && (
                <FormField id={`${id}-otp`} label={`Enter OTP sent to your ${kind}`} required error={otpError}>
                    {(aria) => (
                        <div className="flex gap-2">
                            <Input {...aria} inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="h-11" />
                            <Button type="button" onClick={verify} className="h-11 hover:bg-primary-hover">
                                Verify
                            </Button>
                        </div>
                    )}
                </FormField>
            )}
        </div>
    );
}
