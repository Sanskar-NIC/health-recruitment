import { Head } from '@inertiajs/react';
import { CircleCheck, Clock, LogIn, Mail, Phone, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { LoginForm } from '@/components/student/login-form';
import { Panel } from '@/components/student/panel';
import StudentLayout from '@/layouts/student-layout';
import { usePage } from '@inertiajs/react';

const checklist = [
    'Keep your Registration No. or registered email ready.',
    'Use the password you set during registration.',
    'Do not share your password or OTP with anyone.',
];

export default function Login() {
    const { helpdesk } = usePage().props.portal;

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <Head title="Applicant Login" />
            <div className="grid gap-6 md:grid-cols-2">
                <Panel title="Applicant Login" icon={LogIn}>
                    <LoginForm idPrefix="login" showRemember />
                </Panel>
                <section className="rounded-lg border bg-card p-5 shadow-sm">
                    <h2 className="text-lg font-semibold text-primary-deep">Before you log in</h2>
                    <ul className="mt-3 space-y-2 text-sm">
                        {checklist.map((text) => (
                            <li key={text} className="flex gap-2">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                                {text}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-5 flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                        <span>
                            <strong className="text-destructive">Important:</strong> Applications can be submitted only after login. Complete your profile before the last date.
                        </span>
                    </p>
                    <h3 className="mt-5 font-medium">Need help?</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><Phone className="size-4 text-primary" aria-hidden="true" />{helpdesk.phone}</li>
                        <li className="flex items-center gap-2"><Mail className="size-4 text-primary" aria-hidden="true" /><span className="break-all">{helpdesk.email}</span></li>
                        <li className="flex items-center gap-2"><Clock className="size-4 text-primary" aria-hidden="true" />{helpdesk.hours}</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}

Login.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
