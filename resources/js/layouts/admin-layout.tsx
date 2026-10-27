import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminTopbar } from '@/components/admin/admin-topbar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {

    // The admin portal is light-mode only, like the public site.
    useEffect(() => {
        const root = document.documentElement;
        const wasDark = root.classList.contains('dark');

        root.classList.remove('dark');

        return () => {
            if (wasDark) {
                root.classList.add('dark');
            }
        };
    }, []);

    return (
        <SidebarProvider>
            <AdminSidebar />
            <SidebarInset className="min-w-0 bg-muted/30">
                <AdminTopbar />
                <main className="flex-1 p-4 sm:p-8 lg:px-10 lg:py-8">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    );
}
