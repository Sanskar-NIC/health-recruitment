import { Moon, Sun } from 'lucide-react';
import { usePortalPrefs } from '@/lib/portal-prefs';
import type { Locale } from '@/lib/portal-prefs';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme, t } = usePortalPrefs();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label={t('shell.theme')}
            aria-pressed={theme === 'dark'}
            title={t('shell.theme')}
            className={cn('inline-flex size-10 items-center justify-center rounded-full border bg-card text-muted-foreground transition-colors hover:bg-primary-tint hover:text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none', className)}
        >
            {theme === 'dark' ? <Sun className="size-4.5" aria-hidden="true" /> : <Moon className="size-4.5" aria-hidden="true" />}
        </button>
    );
}

const options: { value: Locale; label: string; full: string }[] = [
    { value: 'en', label: 'EN', full: 'English' },
    { value: 'bn', label: 'বাং', full: 'বাংলা' },
];

export function LanguageToggle({ className }: { className?: string }) {
    const { locale, setLocale, t } = usePortalPrefs();

    return (
        <div role="group" aria-label={t('shell.language')} className={cn('inline-flex h-10 items-center rounded-full border bg-card p-1 text-xs font-semibold', className)}>
            {options.map((o) => (
                <button
                    key={o.value}
                    type="button"
                    lang={o.value}
                    title={o.full}
                    aria-pressed={locale === o.value}
                    onClick={() => setLocale(o.value)}
                    className={cn(
                        'h-8 rounded-full px-3 transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                        locale === o.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {o.label}
                </button>
            ))}
        </div>
    );
}
