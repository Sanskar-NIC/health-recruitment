import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Locale = 'en' | 'bn';

const THEME_KEY = 'portal-theme';
const LOCALE_KEY = 'portal-locale';

/** Applicant-portal strings. Anything missing in a language falls back to English. */
const dictionary = {
    en: {
        'nav.home': 'Home',
        'nav.dashboard': 'Dashboard',
        'nav.recruitments': 'Recruitments',
        'nav.applications': 'My Applications',
        'nav.profile': 'My Profile',
        'nav.notifications': 'Notifications',
        'nav.admitCard': 'Admit Card',
        'nav.results': 'Results',
        'nav.answerKeys': 'Answer Keys',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contact',
        'nav.helpdesk': 'Helpdesk',
        'nav.group.overview': 'Overview',
        'nav.group.recruitment': 'Recruitment',
        'nav.group.account': 'Account',
        'nav.group.support': 'Support',
        'auth.login': 'Login',
        'auth.register': 'Register',
        'auth.logout': 'Logout',
        'auth.admin': 'Admin Login',
        'shell.search': 'Search advertisements, posts…',
        'shell.theme': 'Toggle dark mode',
        'shell.language': 'Language',
        'shell.openMenu': 'Open menu',
        'shell.skip': 'Skip to main content',
        'profile.completion': 'Profile completion',
        'profile.stepsDone': '{done} of {total} steps done',
        'profile.complete': 'Profile complete',
        'profile.continue': 'Continue profile',
        'dash.welcome': 'Welcome back',
        'dash.subtitle': 'Here is where your applications stand today.',
        'dash.profileTitle': 'Finish your profile to start applying',
        'dash.profileBody': 'Your profile is saved automatically as you go. Pick up where you left off.',
        'dash.readyTitle': 'Your profile is ready',
        'dash.readyBody': 'You can apply to any open recruitment you are eligible for.',
        'dash.stat.open': 'Open recruitments',
        'dash.stat.applied': 'Applications',
        'dash.stat.admit': 'Admit cards',
        'dash.tracker': 'Application tracker',
        'dash.tracker.empty': 'You have not applied to any recruitment yet.',
        'dash.tracker.browse': 'Browse recruitments',
        'dash.open': 'Open for applications',
        'dash.viewAll': 'View all',
        'dash.closing': 'Closing soon',
        'dash.lastDate': 'Last date',
        'dash.posts': 'posts',
        'dash.quick': 'Quick actions',
        'step.registered': 'Registered',
        'step.submitted': 'Application submitted',
        'step.review': 'Under review',
        'step.admit': 'Admit card',
        'step.result': 'Result',
        'step.rejected': 'Not shortlisted',
        'step.withdrawn': 'Withdrawn',
        'hero.badge': 'Health & Family Welfare Department · Tripura',
        'hero.title': 'Find and apply for health service jobs in Tripura',
        'hero.subtitle': 'Apply online, track every application and download admit cards — all in one place.',
        'hero.search': 'Search by post, advertisement no. or keyword',
        'hero.searchBtn': 'Search',
        'hero.stat.open': 'Open recruitments',
        'hero.stat.updates': 'Latest updates',
        'hero.new': 'New to the portal?',
        'hero.create': 'Create your account',
    },
    bn: {
        'nav.home': 'হোম',
        'nav.dashboard': 'ড্যাশবোর্ড',
        'nav.recruitments': 'নিয়োগ বিজ্ঞপ্তি',
        'nav.applications': 'আমার আবেদন',
        'nav.profile': 'আমার প্রোফাইল',
        'nav.notifications': 'বিজ্ঞপ্তি',
        'nav.admitCard': 'অ্যাডমিট কার্ড',
        'nav.results': 'ফলাফল',
        'nav.answerKeys': 'উত্তরমালা',
        'nav.faq': 'সাধারণ প্রশ্ন',
        'nav.contact': 'যোগাযোগ',
        'nav.helpdesk': 'হেল্পডেস্ক',
        'nav.group.overview': 'সংক্ষিপ্ত বিবরণ',
        'nav.group.recruitment': 'নিয়োগ',
        'nav.group.account': 'অ্যাকাউন্ট',
        'nav.group.support': 'সহায়তা',
        'auth.login': 'লগইন',
        'auth.register': 'নিবন্ধন',
        'auth.logout': 'লগআউট',
        'auth.admin': 'অ্যাডমিন লগইন',
        'shell.search': 'বিজ্ঞপ্তি, পদ খুঁজুন…',
        'shell.theme': 'ডার্ক মোড পরিবর্তন',
        'shell.language': 'ভাষা',
        'shell.openMenu': 'মেনু খুলুন',
        'shell.skip': 'মূল অংশে যান',
        'profile.completion': 'প্রোফাইল সম্পূর্ণতা',
        'profile.stepsDone': '{total}টির মধ্যে {done}টি ধাপ সম্পন্ন',
        'profile.complete': 'প্রোফাইল সম্পূর্ণ',
        'profile.continue': 'প্রোফাইল চালিয়ে যান',
        'dash.welcome': 'স্বাগতম',
        'dash.subtitle': 'আজ আপনার আবেদনগুলোর অবস্থা এখানে দেখুন।',
        'dash.profileTitle': 'আবেদন শুরু করতে প্রোফাইল সম্পূর্ণ করুন',
        'dash.profileBody': 'আপনার তথ্য স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়। যেখানে থেমেছিলেন সেখান থেকে শুরু করুন।',
        'dash.readyTitle': 'আপনার প্রোফাইল প্রস্তুত',
        'dash.readyBody': 'যোগ্য যেকোনো খোলা নিয়োগে আপনি আবেদন করতে পারেন।',
        'dash.stat.open': 'খোলা নিয়োগ',
        'dash.stat.applied': 'আবেদন',
        'dash.stat.admit': 'অ্যাডমিট কার্ড',
        'dash.tracker': 'আবেদনের অবস্থা',
        'dash.tracker.empty': 'আপনি এখনও কোনো নিয়োগে আবেদন করেননি।',
        'dash.tracker.browse': 'নিয়োগ দেখুন',
        'dash.open': 'আবেদন চলছে',
        'dash.viewAll': 'সব দেখুন',
        'dash.closing': 'শীঘ্রই শেষ',
        'dash.lastDate': 'শেষ তারিখ',
        'dash.posts': 'টি পদ',
        'dash.quick': 'দ্রুত কাজ',
        'step.registered': 'নিবন্ধিত',
        'step.submitted': 'আবেদন জমা হয়েছে',
        'step.review': 'যাচাই চলছে',
        'step.admit': 'অ্যাডমিট কার্ড',
        'step.result': 'ফলাফল',
        'step.rejected': 'মনোনীত হয়নি',
        'step.withdrawn': 'প্রত্যাহৃত',
        'hero.badge': 'স্বাস্থ্য ও পরিবার কল্যাণ দপ্তর · ত্রিপুরা',
        'hero.title': 'ত্রিপুরায় স্বাস্থ্য পরিষেবার চাকরি খুঁজুন ও আবেদন করুন',
        'hero.subtitle': 'অনলাইনে আবেদন করুন, প্রতিটি আবেদনের অবস্থা দেখুন এবং অ্যাডমিট কার্ড ডাউনলোড করুন।',
        'hero.search': 'পদ, বিজ্ঞপ্তি নম্বর বা শব্দ দিয়ে খুঁজুন',
        'hero.searchBtn': 'খুঁজুন',
        'hero.stat.open': 'খোলা নিয়োগ',
        'hero.stat.updates': 'সাম্প্রতিক আপডেট',
        'hero.new': 'পোর্টালে নতুন?',
        'hero.create': 'অ্যাকাউন্ট খুলুন',
    },
} as const;

export type TranslationKey = keyof (typeof dictionary)['en'];

interface Prefs {
    theme: Theme;
    toggleTheme: () => void;
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const PrefsContext = createContext<Prefs | null>(null);

const read = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    if (typeof window === 'undefined') return fallback;

    const stored = window.localStorage.getItem(key);

    return (allowed as readonly string[]).includes(stored ?? '') ? (stored as T) : fallback;
};

/** Theme + language for the applicant portal. Dark mode is scoped to the portal so the admin area is untouched. */
export function PortalPrefsProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => read<Theme>(THEME_KEY, ['light', 'dark'], 'light'));
    const [locale, setLocaleState] = useState<Locale>(() => read<Locale>(LOCALE_KEY, ['en', 'bn'], 'en'));

    useEffect(() => {
        const root = document.documentElement;

        // The portal owns its own dark class; the starter kit's `.dark` must not leak in.
        root.classList.remove('dark');
        root.classList.toggle('portal-dark', theme === 'dark');
        root.style.colorScheme = theme;

        return () => {
            root.classList.remove('portal-dark');
            root.style.colorScheme = '';
        };
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = locale;

        return () => {
            document.documentElement.lang = 'en';
        };
    }, [locale]);

    const toggleTheme = useCallback(() => {
        setTheme((current) => {
            const next = current === 'dark' ? 'light' : 'dark';

            window.localStorage.setItem(THEME_KEY, next);

            return next;
        });
    }, []);

    const setLocale = useCallback((next: Locale) => {
        window.localStorage.setItem(LOCALE_KEY, next);
        setLocaleState(next);
    }, []);

    const value = useMemo<Prefs>(
        () => ({
            theme,
            toggleTheme,
            locale,
            setLocale,
            t: (key, vars) => {
                const text: string = (dictionary[locale] as Record<string, string>)[key] ?? dictionary.en[key];

                return vars ? text.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? '')) : text;
            },
        }),
        [theme, toggleTheme, locale, setLocale],
    );

    return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePortalPrefs(): Prefs {
    const ctx = useContext(PrefsContext);

    if (!ctx) {
        throw new Error('usePortalPrefs must be used inside PortalPrefsProvider');
    }

    return ctx;
}
