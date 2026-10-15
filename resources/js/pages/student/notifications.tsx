import { Head } from '@inertiajs/react';
import { Inbox, Search } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { NotificationItem } from '@/components/student/notification-item';
import { SectionHeading } from '@/components/student/section-heading';
import { Input } from '@/components/ui/input';
import StudentAdaptiveLayout from '@/layouts/student-adaptive-layout';
import type { NotificationEntry } from '@/types/student';

export default function Notifications({ entries }: { entries: NotificationEntry[] }) {
    const [query, setQuery] = useState('');
    const q = query.trim().toLowerCase();
    const filtered = entries.filter(
        (e) => !q || e.title.toLowerCase().includes(q) || e.advtNo.toLowerCase().includes(q),
    );

    return (
        <div className="mx-auto max-w-none px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
            <Head title="Notifications" />
            <SectionHeading
                title="Notifications"
                description="Advertisements, application links and forms"
                action={
                    <div className="relative w-full sm:w-80">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by post or advertisement no."
                            aria-label="Search notifications"
                            className="h-11 rounded-full bg-card pl-9"
                        />
                    </div>
                }
            />
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
                    <Inbox className="size-10" aria-hidden="true" />
                    <p>No notifications match your search.</p>
                </div>
            ) : (
                <div className="grid gap-5">
                    {filtered.map((entry, i) => (
                        <NotificationItem key={entry.id} entry={entry} defaultOpen={i === 0 && !q} />
                    ))}
                </div>
            )}
        </div>
    );
}

Notifications.layout = (page: ReactNode) => <StudentAdaptiveLayout>{page}</StudentAdaptiveLayout>;
