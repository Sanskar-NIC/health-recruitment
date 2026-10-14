import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { MobileNav } from '@/components/student/mobile-nav';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { portalNav } from '@/lib/portal';
import { cn } from '@/lib/utils';

export function MainNav() {
    const { isCurrentUrl } = useCurrentUrl();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 4);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div
            className={cn(
                'sticky top-0 z-40 bg-primary text-primary-foreground transition-shadow',
                scrolled && 'shadow-md',
            )}
        >
            <div className="mx-auto flex max-w-none sm:px-8 lg:px-16 xl:px-24 items-center px-2 sm:px-4">
                <MobileNav />
                <span className="px-2 text-sm font-medium lg:hidden">
                    Menu
                </span>
                <nav aria-label="Main" className="hidden lg:block">
                    <ul className="flex">
                        {portalNav.map(({ label, href, icon: Icon }) => {
                            const active = isCurrentUrl(href);

                            return (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'flex min-h-12 items-center gap-2 border-b-4 border-transparent px-4 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white',
                                            active && 'border-white bg-white/15',
                                        )}
                                    >
                                        <Icon className="size-4" aria-hidden="true" />
                                        {label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </div>
    );
}
