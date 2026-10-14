import { Link } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RegisterSuccess({ registrationNo }: { registrationNo: string }) {
    return (
        <div role="status" className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center shadow-sm">
            <CircleCheck className="mx-auto size-14 text-success" aria-hidden="true" />
            <h2 className="mt-3 text-2xl font-semibold">Registration Successful</h2>
            <p className="mt-2 text-sm text-muted-foreground">Your Registration No. is</p>
            <p className="mt-1 rounded-md bg-primary-tint py-3 font-mono text-2xl font-semibold tracking-wider text-primary-deep">
                {registrationNo}
            </p>
            <p className="mt-3 text-sm font-medium text-destructive">
                Important: <span className="font-normal">Please save this number. You will need it to log in.</span>
            </p>
            <Button asChild className="mt-6 h-11 w-full hover:bg-primary-hover">
                <Link href="/login">Go to Login</Link>
            </Button>
        </div>
    );
}
