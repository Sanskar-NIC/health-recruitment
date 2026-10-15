import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BrandLogo } from '@/components/brand-logo';
import { FieldError } from '@/components/student/field-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLogin() {
    const form = useForm({ username: '', password: '', remember: false });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        document.documentElement.classList.remove('dark');
    }, []);

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/admin/login', { onFinish: () => form.setData('password', '') });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
            <Head title="Admin Login" />
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo className="size-16" />
                    <h1 className="mt-4 flex items-center gap-2 text-xl font-semibold text-primary-deep">
                        <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                        Admin Login
                    </h1>
                    <p className="text-sm text-muted-foreground">Health &amp; Family Welfare Department, Tripura</p>
                </div>

                <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="admin-username">Username</Label>
                        <div className="relative">
                            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="admin-username"
                                value={form.data.username}
                                onChange={(e) => form.setData('username', e.target.value)}
                                autoComplete="username"
                                className="h-11 pl-9"
                                aria-invalid={Boolean(form.errors.username)}
                            />
                        </div>
                        {form.errors.username && <FieldError id="admin-username-error" message={form.errors.username} />}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="admin-password">Password</Label>
                        <div className="relative">
                            <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.data.password}
                                onChange={(e) => form.setData('password', e.target.value)}
                                autoComplete="current-password"
                                className="h-11 px-9"
                                aria-invalid={Boolean(form.errors.password)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                            </button>
                        </div>
                        {form.errors.password && <FieldError id="admin-password-error" message={form.errors.password} />}
                    </div>

                    <Button type="submit" disabled={form.processing} className="h-12 w-full rounded-xl text-base font-medium hover:bg-primary-hover">
                        {form.processing && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                        Sign In
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        <Link href="/" className="text-link hover:underline">Back to public site</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
