import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/animate-ui/components/radix/sheet';
import { BrandLogo } from '@/components/brand-logo';
import { ThemeToggle } from '@/components/student/shell/portal-toggles';
import { Button } from '@/components/ui/button';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { portalNav } from '@/lib/portal';
import { usePortalPrefs } from '@/lib/portal-prefs';
import type { TranslationKey } from '@/lib/portal-prefs';
import { cn } from '@/lib/utils';

const labelKey: Record<string, TranslationKey> = {
    '/': 'nav.home',
    '/recruitments': 'nav.recruitments',
    '/notifications': 'nav.notifications',
    '/faq': 'nav.faq',
    '/contact': 'nav.contact',
};

/** One sticky bar for the public pages: brand, navigation, language, theme and sign-in. */
export function PublicHeader() {
    const { auth } = usePage().props as unknown as { auth?: { student?: unknown } };
    const { isCurrentUrl } = useCurrentUrl();
    const { t } = usePortalPrefs();
    const [scrolled, setScrolled] = useState(false);
    const signedIn = Boolean(auth?.student);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header className={cn('sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md transition-shadow', scrolled && 'shadow-sm')}>
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Sheet>
                    <SheetTrigger asChild>
                        <button type="button" aria-label={t('shell.openMenu')} className="inline-flex size-10 items-center justify-center rounded-full border bg-card lg:hidden">
                            <Menu className="size-5" aria-hidden="true" />
                        </button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 bg-card p-0">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SheetDescription className="sr-only">Site navigation</SheetDescription>
                        <div className="flex items-center gap-3 border-b p-5">
                            <BrandLogo className="size-10" />
                            <span className="text-sm font-bold text-primary-deep">Health Recruitment Portal</span>
                        </div>
                        <nav aria-label="Mobile" className="grid gap-0.5 p-3">
                            {portalNav.map(({ label, href, icon: Icon }) => (
                                <SheetClose asChild key={href}>
                                    <Link href={href} aria-current={isCurrentUrl(href) ? 'page' : undefined} className={cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-muted', isCurrentUrl(href) && 'bg-primary-tint text-primary-deep')}>
                                        <Icon className="size-4" aria-hidden="true" />
                                        {labelKey[href] ? t(labelKey[href]) : label}
                                    </Link>
                                </SheetClose>
                            ))}
                        </nav>
                        <div className="mt-auto grid gap-2 border-t p-4">
                            {signedIn ? (
                                <SheetClose asChild><Button asChild className="h-11 rounded-full"><Link href="/student/dashboard">{t('nav.dashboard')}</Link></Button></SheetClose>
                            ) : (
                                <>
                                    <SheetClose asChild><Button asChild className="h-11 rounded-full"><Link href="/register">{t('auth.register')}</Link></Button></SheetClose>
                                    <SheetClose asChild><Button asChild variant="outline" className="h-11 rounded-full"><Link href="/login">{t('auth.login')}</Link></Button></SheetClose>
                                </>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>

                <Link href="/" className="flex min-w-0 items-center gap-3 rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                    <BrandLogo className="size-10 shrink-0 sm:size-11" />
                    <span className="hidden min-w-0 flex-col leading-tight sm:flex">
                        <span className="truncate text-base font-bold text-primary-deep">Health Recruitment Portal</span>
                        <span className="truncate text-[11px] text-muted-foreground">Government of Tripura</span>
                    </span>
                </Link>

                <nav aria-label="Main" className="mx-auto hidden items-center gap-1 rounded-full border bg-card p-1 lg:flex">
                    {portalNav.slice(0, 6).map(({ label, href }) => {
                        const active = isCurrentUrl(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                aria-current={active ? 'page' : undefined}
                                className={cn('rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none', active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
                            >
                                {labelKey[href] ? t(labelKey[href]) : label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <ThemeToggle />
                    {signedIn ? (
                        <Button asChild className="hidden h-10 rounded-full px-5 sm:inline-flex"><Link href="/student/dashboard">{t('nav.dashboard')}</Link></Button>
                    ) : (
                        <>
                            <Button asChild variant="outline" className="hidden h-10 rounded-full px-5 sm:inline-flex"><Link href="/login">{t('auth.login')}</Link></Button>
                            <Button asChild className="hidden h-10 rounded-full px-5 sm:inline-flex"><Link href="/register">{t('auth.register')}</Link></Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
