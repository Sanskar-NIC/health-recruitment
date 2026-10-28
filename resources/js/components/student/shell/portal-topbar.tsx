import { Link, router } from '@inertiajs/react';
import { BellRing, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ThemeToggle } from '@/components/student/shell/portal-toggles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePortalPrefs } from '@/lib/portal-prefs';

interface Props {
    student: { full_name: string; registration_no: string } | null | undefined;
    onOpenMenu: () => void;
}

export function PortalTopbar({ student, onOpenMenu }: Props) {
    const { t } = usePortalPrefs();
    const [query, setQuery] = useState('');
    const [leaving, setLeaving] = useState(false);

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get('/recruitments', query.trim() ? { q: query.trim() } : {});
    };

    const logout = () => {
        setLeaving(true);
        router.post('/logout', {}, { onFinish: () => setLeaving(false) });
    };

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:px-8">
            <button
                type="button"
                onClick={onOpenMenu}
                aria-label={t('shell.openMenu')}
                className="inline-flex size-10 items-center justify-center rounded-full border bg-card text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none lg:hidden"
            >
                <Menu className="size-5" aria-hidden="true" />
            </button>

            <form onSubmit={search} role="search" className="relative hidden max-w-md flex-1 sm:block">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('shell.search')}
                    aria-label={t('shell.search')}
                    className="h-10 w-full rounded-full border bg-card pr-4 pl-10 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-[3px] focus:ring-ring/25"
                />
            </form>

            <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <Link
                    href="/notifications"
                    aria-label={t('nav.notifications')}
                    className="inline-flex size-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-primary-tint hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <BellRing className="size-[18px]" aria-hidden="true" />
                </Link>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button type="button" className="flex h-10 items-center gap-2 rounded-full border bg-card pr-3 pl-1.5 text-sm font-medium focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{student?.full_name?.charAt(0).toUpperCase()}</span>
                            <span className="hidden max-w-32 truncate md:inline">{student?.full_name}</span>
                            <ChevronDown className="size-4 opacity-60" aria-hidden="true" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                        <DropdownMenuLabel>
                            <p className="truncate text-sm font-semibold">{student?.full_name}</p>
                            <p className="font-mono text-xs font-normal text-muted-foreground">{student?.registration_no}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/student/profile">{t('nav.profile')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/student/applications">{t('nav.applications')}</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled={leaving} onSelect={logout} className="text-destructive focus:text-destructive">
                            <LogOut className="size-4" /> {t('auth.logout')}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
