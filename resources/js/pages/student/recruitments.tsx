import { Head } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { RecruitmentsList } from '@/components/student/recruitments-list';
import StudentLayout from '@/layouts/student-layout';
import type { Recruitment } from '@/types/student';

export default function Recruitments({ recruitments }: { recruitments: Recruitment[] }) {
    return (
        <>
            <Head title="Recruitments" />
            <RecruitmentsList recruitments={recruitments} />
        </>
    );
}

Recruitments.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
