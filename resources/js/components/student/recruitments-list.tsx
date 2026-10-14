import { Inbox } from 'lucide-react';
import { RecruitmentCard } from '@/components/student/home/recruitment-card';
import { SectionHeading } from '@/components/student/section-heading';
import type { Recruitment } from '@/types/student';

export function RecruitmentsList({ recruitments }: { recruitments: Recruitment[] }) {
    const active = recruitments.filter((r) => r.status === 'open' || r.status === 'closing_soon');

    return (
        <section aria-labelledby="recruitments-heading" className="mx-auto max-w-none px-4 py-10 sm:px-8 lg:px-16 xl:px-24">
            <SectionHeading id="recruitments-heading" title="Recruitments" description="Browse open advertisements" />
            {active.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-center text-muted-foreground">
                    <Inbox className="size-10" aria-hidden="true" />
                    <p>No active recruitments right now.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {active.map((item) => (
                        <RecruitmentCard key={item.id} item={item} />
                    ))}
                </div>
            )}
        </section>
    );
}
