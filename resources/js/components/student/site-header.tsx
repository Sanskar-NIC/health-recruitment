import { Link, router, usePage } from '@inertiajs/react';
import { Phone } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
    const { portal } = usePage().props;

    return (
        <header className="border-b bg-card shadow-sm">
            <div className="mx-auto flex max-w-none sm:px-8 lg:px-16 xl:px-24 items-center justify-between gap-4 px-4 py-3">
                <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                    <BrandLogo className="size-12 shrink-0 sm:size-16" />
                    <span className="flex flex-col">
                        <span className="text-base leading-tight font-semibold text-primary sm:text-2xl">
                            Health Recruitment Portal
                        </span>
                        <span className="text-[11px] leading-snug text-muted-foreground sm:text-sm">
                            Health &amp; Family Welfare Department, Government of Tripura
                        </span>
                    </span>
                </Link>
                <div className="hidden items-center gap-4 lg:flex">
                    <a
                        href={`tel:${portal.helpdesk.phone.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                    >
                        <Phone className="size-4 text-primary" aria-hidden="true" />
                        <span>
                            <span className="sr-only">Helpdesk: </span>
                            {portal.helpdesk.phone}
                        </span>
                    </a>
                    {usePage().props.auth?.student ? (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 rounded-full border-primary px-6 text-primary hover:bg-primary-tint"
                            >
                                <Link href="/student/dashboard">Dashboard</Link>
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => router.post('/logout')}
                                className="h-11 rounded-full px-6 text-destructive hover:bg-destructive/10"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="outline"
                                className="h-11 rounded-full border-primary px-6 text-primary hover:bg-primary-tint hover:text-primary-hover"
                            >
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="h-11 rounded-full px-6 hover:bg-primary-hover">
                                <Link href="/register">Register</Link>
                            </Button>
                        </>
                    )}

                </div>
            </div>
        </header>
    );
}
