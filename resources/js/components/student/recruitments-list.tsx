import { Inbox, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { RecruitmentCard, RecruitmentRow } from '@/components/student/home/recruitment-card';
import { SectionHeading } from '@/components/student/section-heading';
import { cn } from '@/lib/utils';
import type { Recruitment } from '@/types/student';

type View = 'grid' | 'list';

const STORAGE_KEY = 'recruitments-view';

const options: { value: View; label: string; icon: typeof List }[] = [
    { value: 'grid', label: 'Grid', icon: LayoutGrid },
    { value: 'list', label: 'List', icon: List },
];

const initialView = (): View => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
        return 'grid';
    }
};

export function RecruitmentsList({ recruitments }: { recruitments: Recruitment[] }) {
    const active = recruitments.filter((r) => r.status === 'open' || r.status === 'closing_soon');
    const [view, setView] = useState<View>(initialView);

    const choose = (next: View) => {
        setView(next);

        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // The preference just isn't remembered.
        }
    };

    return (
        <section aria-labelledby="recruitments-heading" className="mx-auto max-w-none px-4 py-10 sm:px-8 lg:px-16 xl:px-24">
            <SectionHeading id="recruitments-heading" title="Recruitments" description="Browse open advertisements" />
            {active.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
                    <Inbox className="size-10" aria-hidden="true" />
                    <p>No active recruitments right now.</p>
                </div>
            ) : (
                <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            {active.length} active {active.length === 1 ? 'advertisement' : 'advertisements'}
                        </p>
                        <div role="group" aria-label="Change layout" className="inline-flex rounded-lg border bg-card p-1 shadow-sm">
                            {options.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={view === value}
                                    aria-label={`${label} view`}
                                    onClick={() => choose(value)}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                                        view === value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted',
                                    )}
                                >
                                    <Icon className="size-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {view === 'grid' ? (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {active.map((item) => (
                                <RecruitmentCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {active.map((item) => (
                                <RecruitmentRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}
