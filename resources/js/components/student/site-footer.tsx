import { Link, usePage } from '@inertiajs/react';
import { ArrowUp, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand-logo';

const quickLinks = [
    ['Recruitments', '/recruitments'],
    ['Admit Card', '/admit-card'],
    ['Results', '/results'],
    ['Answer Keys', '/answer-keys'],
    ['FAQ', '/faq'],
] as const;

const importantLinks = [
    'Health & Family Welfare Dept',
    'Government of Tripura Portal',
    'Grievance',
];

const legal = ['Privacy Policy', 'Terms of Use', 'Disclaimer', 'Accessibility Statement', 'Sitemap'];

const linkClass =
    'rounded text-sm text-slate-300 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-white';

export function SiteFooter() {
    const { portal } = usePage().props;
    const { helpdesk, siteMeta } = portal;
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <footer className="bg-slate-900 text-slate-200">
            <div className="mx-auto grid max-w-none sm:px-8 lg:px-16 xl:px-24 gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <div className="mb-3 flex items-center gap-3">
                        <span className="rounded-full bg-white p-1.5"><BrandLogo className="size-12" /></span>
                        <h2 className="text-base font-semibold text-white">About</h2>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                        The Health Recruitment Portal is the official platform of the
                        Health &amp; Family Welfare Department, Government of Tripura,
                        for notifications, online applications, admit cards and
                        results for health service posts.
                    </p>
                </div>
                <div>
                    <h2 className="mb-3 text-base font-semibold text-white">Quick Links</h2>
                    <ul className="grid gap-2">
                        {quickLinks.map(([label, href]) => (
                            <li key={href}>
                                <Link href={href} className={linkClass}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="mb-3 text-base font-semibold text-white">Important Links</h2>
                    <ul className="grid gap-2">
                        {importantLinks.map((label) => (
                            <li key={label}>
                                <a href="#" className={linkClass}>{label}</a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="mb-3 text-base font-semibold text-white">Helpdesk</h2>
                    <ul className="grid gap-2 text-sm text-slate-300">
                        <li className="flex gap-2"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{helpdesk.address}</li>
                        <li className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{helpdesk.phone}</li>
                        <li className="flex gap-2"><Mail className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span className="break-all">{helpdesk.email}</span></li>
                        <li className="flex gap-2"><Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{helpdesk.hours}</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-700">
                <div className="mx-auto max-w-none sm:px-8 lg:px-16 xl:px-24 space-y-3 px-4 py-4 text-xs text-slate-300">
                    <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {legal.map((label) => (
                            <li key={label}><a href="#" className={linkClass}>{label}</a></li>
                        ))}
                    </ul>
                    <div className="flex flex-wrap justify-between gap-2">
                        <p>Last updated: {siteMeta.lastUpdated} | Visitors: {siteMeta.visitors}</p>
                        <p>© 2026 Health &amp; Family Welfare Department, Government of Tripura. Designed &amp; developed by DIT, Tripura.</p>
                    </div>
                </div>
            </div>
            {showTop && (
                <button
                    type="button"
                    aria-label="Scroll to top"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed right-4 bottom-4 z-40 inline-flex size-11 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <ArrowUp className="size-5" aria-hidden="true" />
                </button>
            )}
        </footer>
    );
}
