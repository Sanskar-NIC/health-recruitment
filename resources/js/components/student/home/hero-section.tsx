import { Link, router } from '@inertiajs/react';
import { ArrowRight, BellRing, BriefcaseMedical, Search } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { LoginForm } from '@/components/student/login-form';
import { usePortalPrefs } from '@/lib/portal-prefs';

interface Props {
    openCount: number;
    updatesCount: number;
}

export function HeroSection({ openCount, updatesCount }: Props) {
    const { t } = usePortalPrefs();
    const [query, setQuery] = useState('');

    const search = (e: FormEvent) => {
        e.preventDefault();
        router.get('/recruitments', query.trim() ? { q: query.trim() } : {});
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-start to-brand-end text-white">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-white/10 blur-2xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 size-[28rem] rounded-full bg-white/5" />

            <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:px-8 lg:py-20">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                        <span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />
                        {t('hero.badge')}
                    </span>
                    <h1 className="mt-5 text-3xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl">{t('hero.title')}</h1>
                    <p className="mt-4 max-w-xl text-base opacity-90 sm:text-lg">{t('hero.subtitle')}</p>

                    <form onSubmit={search} role="search" className="mt-7 flex max-w-xl items-center gap-2 rounded-full bg-card p-1.5 text-foreground shadow-xl">
                        <Search className="ml-3 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={t('hero.search')}
                            aria-label={t('hero.search')}
                            className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
                            {t('hero.searchBtn')} <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </form>

                    <dl className="mt-8 flex flex-wrap gap-3">
                        <Link href="/recruitments" className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur transition-colors hover:bg-white/20">
                            <BriefcaseMedical className="size-6 opacity-90" aria-hidden="true" />
                            <span>
                                <dd className="text-2xl leading-none font-bold tabular-nums">{openCount}</dd>
                                <dt className="mt-1 text-xs opacity-85">{t('hero.stat.open')}</dt>
                            </span>
                        </Link>
                        <Link href="/notifications" className="flex items-center gap-3 rounded-2xl bg-white/12 px-4 py-3 backdrop-blur transition-colors hover:bg-white/20">
                            <BellRing className="size-6 opacity-90" aria-hidden="true" />
                            <span>
                                <dd className="text-2xl leading-none font-bold tabular-nums">{updatesCount}</dd>
                                <dt className="mt-1 text-xs opacity-85">{t('hero.stat.updates')}</dt>
                            </span>
                        </Link>
                    </dl>
                </div>

                <div className="rounded-3xl border border-white/20 bg-card p-6 text-card-foreground shadow-2xl sm:p-7">
                    <h2 className="text-xl font-bold text-primary-deep">{t('auth.login')}</h2>
                    <div className="mt-4">
                        <LoginForm idPrefix="home-login" />
                    </div>
                    <p className="mt-5 border-t pt-4 text-center text-sm text-muted-foreground">
                        {t('hero.new')}{' '}
                        <Link href="/register" className="font-semibold text-link hover:underline">{t('hero.create')}</Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
