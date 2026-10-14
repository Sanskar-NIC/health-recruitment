import { Head, Link } from '@inertiajs/react';
import { Construction } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import StudentLayout from '@/layouts/student-layout';

export default function ComingSoon({ title }: { title: string }) {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
            <Head title={title} />
            <span className="flex size-24 items-center justify-center rounded-full bg-primary-tint text-primary">
                <Construction className="size-12" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold text-primary-deep">{title}</h1>
            <p className="mt-2 text-muted-foreground">This section will be available soon.</p>
            <Button asChild className="mt-6 h-11 px-6 hover:bg-primary-hover">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    );
}

ComingSoon.layout = (page: ReactNode) => <StudentLayout>{page}</StudentLayout>;
