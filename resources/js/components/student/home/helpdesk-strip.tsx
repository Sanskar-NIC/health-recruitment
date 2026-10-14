import { Link, usePage } from '@inertiajs/react';
import { Clock, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HelpdeskStrip() {
    const { helpdesk } = usePage().props.portal;

    return (
        <section aria-labelledby="help-heading" className="bg-primary-tint">
            <div className="mx-auto flex max-w-none sm:px-8 lg:px-16 xl:px-24 flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 id="help-heading" className="text-2xl font-semibold text-primary-deep">Need help?</h2>
                    <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <li className="flex items-center gap-2"><Phone className="size-4 text-primary" aria-hidden="true" />{helpdesk.phone}</li>
                        <li className="flex items-center gap-2"><Mail className="size-4 text-primary" aria-hidden="true" /><span className="break-all">{helpdesk.email}</span></li>
                        <li className="flex items-center gap-2"><Clock className="size-4 text-primary" aria-hidden="true" />{helpdesk.hours}</li>
                    </ul>
                </div>
                <Button asChild className="h-11 px-6 hover:bg-primary-hover">
                    <Link href="/contact">Contact Us</Link>
                </Button>
            </div>
        </section>
    );
}
