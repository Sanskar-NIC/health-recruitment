import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';
import type { ReactNode } from 'react';
import AdminLayout from '@/layouts/admin-layout';

export default function AdminSection({ title }: { title: string }) {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
            <Head title={`${title} – Admin`} />
            <span className="flex size-20 items-center justify-center rounded-full bg-primary-tint text-primary">
                <Construction className="size-10" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-2xl font-semibold text-primary-deep">{title}</h1>
            <p className="mt-2 text-muted-foreground">This module is part of the admin structure and will be built soon.</p>
        </div>
    );
}

AdminSection.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;
