import { Link } from '@inertiajs/react';
import { BookOpen, CreditCard, LifeBuoy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SectionHeading } from '@/components/student/section-heading';

const links: { label: string; hint: string; href: string; icon: LucideIcon }[] = [
    { label: 'Syllabus & Exam Pattern', hint: 'Plan your preparation', href: '/recruitments', icon: BookOpen },
    { label: 'Fee Payment Status', hint: 'Track your payment', href: '/login', icon: CreditCard },
    { label: 'Helpdesk / Grievance', hint: 'Get support', href: '/contact', icon: LifeBuoy },
];

export function QuickLinks() {
    return (
        <section aria-labelledby="quick-links-heading" className="mx-auto max-w-none sm:px-8 lg:px-16 xl:px-24 px-4 py-10">
            <SectionHeading id="quick-links-heading" title="Quick Links" />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {links.map(({ label, hint, href, icon: Icon }) => (
                    <li key={label}>
                        <Link
                            href={href}
                            className="group flex min-h-20 items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_2px_12px_-4px_rgb(15_23_42/0.12)] transition duration-200 hover:border-primary/50 hover:shadow-[0_12px_28px_-8px_rgb(14_116_144/0.3)] motion-safe:hover:-translate-y-0.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                        >
                            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary transition-transform motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6">
                                <Icon className="size-6" aria-hidden="true" />
                            </span>
                            <span>
                                <span className="block font-medium text-foreground">{label}</span>
                                <span className="block text-sm text-muted-foreground">{hint}</span>
                            </span>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
