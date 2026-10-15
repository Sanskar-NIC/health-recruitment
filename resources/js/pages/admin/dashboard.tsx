import { Head, Link } from '@inertiajs/react';
import { Clock, FileCheck2, Headset, Inbox, Megaphone, Plus, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

interface Props {
    stats: {
        activeRecruitments: number;
        totalApplications: number;
        todayApplications: number;
        pendingScrutiny: number;
        openGrievances: number;
    };
    deadlines: { title: string; daysLeft: number }[];
    pendingTasks: { label: string; count: number }[];
    activity: { text: string; at: string }[];
    previousLogin: { at: string | null; ip: string | null } | null;
}

const cards: { key: keyof Props['stats']; label: string; icon: LucideIcon }[] = [
    { key: 'activeRecruitments', label: 'Active Recruitments', icon: Megaphone },
    { key: 'totalApplications', label: 'Total Applications', icon: Inbox },
    { key: 'todayApplications', label: "Today's Applications", icon: Sun },
    { key: 'pendingScrutiny', label: 'Pending Scrutiny', icon: FileCheck2 },
    { key: 'openGrievances', label: 'Open Grievances', icon: Headset },
];

function Section({ title, empty, children }: { title: string; empty: string; children?: ReactNode }) {
    return (
        <section className="rounded-lg border bg-card p-5 shadow-sm">
            <h2 className="font-semibold text-primary-deep">{title}</h2>
            <div className="mt-3 text-sm">{children ?? <p className="text-muted-foreground">{empty}</p>}</div>
        </section>
    );
}

export default function AdminDashboard({ stats, deadlines, pendingTasks, activity, previousLogin }: Props) {
    const admin = usePage().props.auth.admin;

    return (
        <div className="mx-auto grid w-full max-w-[96rem] gap-6">
            <Head title="Dashboard – Admin" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-primary-deep">Welcome, {admin?.name}</h1>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="size-4" aria-hidden="true" />
                        {previousLogin?.at
                            ? `Last login: ${new Date(previousLogin.at).toLocaleString()}${previousLogin.ip ? ` from ${previousLogin.ip}` : ''}`
                            : 'This is your first login.'}
                    </p>
                </div>
                <Button asChild className="hover:bg-primary-hover">
                    <Link href="/admin/recruitments/create"><Plus /> New Recruitment</Link>
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {cards.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                            <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <p className="text-2xl font-semibold">{stats[key]}</p>
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Section title="Applications (per day / post / category / district)" empty="Charts will appear once applications start coming in." />
                <Section title="Upcoming Deadlines" empty="No upcoming deadlines.">
                    {deadlines.length > 0 && (
                        <ul className="space-y-2">
                            {deadlines.map((d) => (
                                <li key={d.title}>{d.title} closes in {d.daysLeft} days</li>
                            ))}
                        </ul>
                    )}
                </Section>
                <Section title="Pending Tasks" empty="Nothing pending.">
                    {pendingTasks.length > 0 && (
                        <ul className="space-y-2">
                            {pendingTasks.map((t) => (
                                <li key={t.label}>{t.label}: {t.count}</li>
                            ))}
                        </ul>
                    )}
                </Section>
                <Section title="Recent Activity" empty="No recent activity.">
                    {activity.length > 0 && (
                        <ul className="space-y-2">
                            {activity.map((a) => (
                                <li key={a.at + a.text}>{a.text} <span className="text-muted-foreground">· {a.at}</span></li>
                            ))}
                        </ul>
                    )}
                </Section>
            </div>
        </div>
    );
}

AdminDashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
