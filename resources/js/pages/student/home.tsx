import { Head } from '@inertiajs/react';
import { ApplicantLoginPanel } from '@/components/student/home/applicant-login-panel';
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
            <HeroSection />
            <div className="mx-auto grid max-w-none sm:px-8 lg:px-16 xl:px-24 gap-6 px-4 pt-8 pb-2 lg:grid-cols-3">
                {/* Mobile: login comes right after the hero. */}
                <div className="lg:order-2 [&>*]:h-full">
                    <ApplicantLoginPanel />
                </div>
                <div className="lg:order-1 lg:col-span-2 [&>*]:h-full">
                    <WhatsNewPanel items={notifications} />
                </div>
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
