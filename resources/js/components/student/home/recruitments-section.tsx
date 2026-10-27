import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { RecruitmentCard } from '@/components/student/home/recruitment-card';
import { SectionHeading } from '@/components/student/section-heading';
import { Button } from '@/components/ui/button';
import type { Recruitment } from '@/types/student';

const HOME_LIMIT = 3;

export function RecruitmentsSection({ recruitments }: { recruitments: Recruitment[] }) {
    const active = recruitments.filter((r) => r.status === 'open' || r.status === 'closing_soon');
    const shown = active.slice(0, HOME_LIMIT);

    return (
        <section id="recruitments" aria-labelledby="recruitments-heading" className="mx-auto max-w-none scroll-mt-16 px-4 pt-6 pb-10 sm:px-8 lg:px-16 xl:px-24">
            <SectionHeading
                id="recruitments-heading"
                title="Recruitments"
                description="Latest open advertisements"
                action={
                    <Button asChild variant="outline" className="h-11 rounded-full border-primary/40 text-primary hover:bg-primary-tint hover:text-primary-hover">
                        <Link href="/recruitments">
                            View all recruitments
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </Button>
                }
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((item) => (
                    <RecruitmentCard key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}
