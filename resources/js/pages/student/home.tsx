import { Head } from '@inertiajs/react';
import { FaqSection } from '@/components/student/home/faq-section';
import { HelpdeskStrip } from '@/components/student/home/helpdesk-strip';
import { HeroSection } from '@/components/student/home/hero-section';
import { HowToApply } from '@/components/student/home/how-to-apply';
import { ImportantDates } from '@/components/student/home/important-dates';
import { QuickLinks } from '@/components/student/home/quick-links';
import { RecruitmentsSection } from '@/components/student/home/recruitments-section';
import { WhatsNewPanel } from '@/components/student/home/whats-new-panel';
import StudentLayout from '@/layouts/student-layout';
import type { HomeProps } from '@/types/student';

export default function Home({
    recruitments,
    notifications,
    importantDates,
    featuredRecruitment,
    faqs,
}: HomeProps) {
    return (
        <>
            <Head title="Home" />
            <HeroSection openCount={recruitments.length} updatesCount={notifications.length} />
            <div className="mx-auto max-w-7xl px-4 pt-12 pb-2 sm:px-6 lg:px-8">
                <WhatsNewPanel items={notifications} />
            </div>
            <RecruitmentsSection recruitments={recruitments} />
            <ImportantDates dates={importantDates} recruitment={featuredRecruitment} />
            <QuickLinks />
            <HowToApply />
            <FaqSection faqs={faqs} />
            <HelpdeskStrip />
        </>
    );
}

Home.layout = (page: React.ReactNode) => <StudentLayout>{page}</StudentLayout>;
