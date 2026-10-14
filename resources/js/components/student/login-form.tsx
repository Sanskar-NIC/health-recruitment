import { Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/animate-ui/components/radix/checkbox';
import { FieldError } from '@/components/student/field-error';
import { RequiredMark } from '@/components/student/required-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Field = 'identifier' | 'password';
type Errors = Partial<Record<Field, string>>;

interface LoginFormProps {
    idPrefix: string;
    showRemember?: boolean;
}

export function LoginForm({ idPrefix, showRemember = false }: LoginFormProps) {
    const form = useForm({ identifier: '', password: '', remember: false });
    const [errors, setErrors] = useState<Errors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const check = (field: Field): string | undefined => {
        const value = form.data[field];

        if (!value.trim()) {
            return field === 'identifier' ? 'Registration No. or Email is required' : 'Password is required';
        }

        return undefined;
    };

    const validateField = (field: Field) =>
        setErrors((prev) => ({ ...prev, [field]: check(field) }));

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();

        const next: Errors = {
            identifier: check('identifier'),
            password: check('password'),
        };

        setErrors(next);

        if (Object.values(next).some(Boolean)) {
            return;
        }

        // UI-only: replace with form.post(...) when login is wired to the backend.
        setLoading(true);
        window.setTimeout(() => {
            setLoading(false);
            toast.info('Login will be enabled soon');
        }, 1000);
    };

    const idId = `${idPrefix}-identifier`;
    const pwId = `${idPrefix}-password`;

    return (
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor={idId}>
                    Registration No. / Email
                    <RequiredMark />
                </Label>
                <div className="relative">
                    <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        id={idId}
                        value={form.data.identifier}
                        onChange={(e) => form.setData('identifier', e.target.value)}
                        onBlur={() => validateField('identifier')}
                        autoComplete="username"
                        className="h-11 pl-9"
                        aria-invalid={Boolean(errors.identifier)}
                        aria-describedby={errors.identifier ? `${idId}-error` : undefined}
                    />
                </div>
                {errors.identifier && <FieldError id={`${idId}-error`} message={errors.identifier} />}
            </div>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor={pwId}>
                        Password
                        <RequiredMark />
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-link hover:underline">
                        Forgot Password?
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        id={pwId}
                        type={showPassword ? 'text' : 'password'}
                        value={form.data.password}
                        onChange={(e) => form.setData('password', e.target.value)}
                        onBlur={() => validateField('password')}
                        autoComplete="current-password"
                        className="h-11 px-9"
                        aria-invalid={Boolean(errors.password)}
                        aria-describedby={errors.password ? `${pwId}-error` : undefined}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    </button>
                </div>
                {errors.password && <FieldError id={`${pwId}-error`} message={errors.password} />}
            </div>

            {showRemember && (
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${idPrefix}-remember`}
                        checked={form.data.remember}
                        onCheckedChange={(c) => form.setData('remember', c === true)}
                    />
                    <Label htmlFor={`${idPrefix}-remember`} className="font-normal">
                        Remember me
                    </Label>
                </div>
            )}

            <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl text-base font-medium shadow-md hover:bg-primary-hover">
                {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Sign In
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                New user?{' '}
                <Link href="/register" className="font-medium text-link hover:underline">
                    Register here
                </Link>
            </p>
        </form>
    );
}
