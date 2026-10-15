import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import StudentPortalLayout from '@/layouts/student-portal-layout';
import StudentLayout from '@/layouts/student-layout';

/** Public pages that switch to the applicant header when a student is logged in. */
export default function StudentAdaptiveLayout({ children }: { children: ReactNode }) {
    const student = (usePage().props as unknown as { auth?: { student?: unknown } }).auth?.student;

    return student ? <StudentPortalLayout>{children}</StudentPortalLayout> : <StudentLayout>{children}</StudentLayout>;
}
