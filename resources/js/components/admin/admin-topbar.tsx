import { Link, router, usePage } from '@inertiajs/react';
import { Fragment } from 'react';
import { Bell, ChevronDown, KeyRound, LayoutDashboard, LogOut, Search, UserRound } from 'lucide-react';
import { findAdminTrail } from '@/components/admin/admin-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

export function AdminTopbar() {
    const admin = usePage().props.auth.admin;
    const { currentUrl } = useCurrentUrl();
    const trail = findAdminTrail(currentUrl);
    
    return (
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
            <SidebarTrigger className="-ml-1 shrink-0" />
            <Breadcrumb className="min-w-0">
                <BreadcrumbList className="flex-nowrap">
                    <BreadcrumbItem className="shrink-0">
                        {trail.length === 0 || (trail.length === 1 && trail[0].title === 'Dashboard') ? (
                            <BreadcrumbPage className="flex items-center gap-1.5 font-semibold text-primary">
                                <LayoutDashboard className="size-4" aria-hidden="true" />
                                Dashboard
                            </BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink asChild>
                                <Link href="/admin/dashboard" className="flex items-center gap-1.5">
                                    <LayoutDashboard className="size-4" aria-hidden="true" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            </BreadcrumbLink>
                        )}
                    </BreadcrumbItem>
                    {trail.length > 0 && trail[0].title !== 'Dashboard' && trail.map((crumb, i) => (
                        <Fragment key={crumb.title}>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem className={i < trail.length - 1 ? 'hidden sm:inline-flex' : 'min-w-0'}>
                                {i === trail.length - 1 ? (
                                    <BreadcrumbPage className="truncate font-semibold text-primary">{crumb.title}</BreadcrumbPage>
                                ) : (
                                    <span className="text-muted-foreground">{crumb.title}</span>
                                )}
                            </BreadcrumbItem>
                        </Fragment>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden md:block">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input
                        placeholder="Search Advt No. / Application No."
                        aria-label="Global search"
                        className="h-9 w-72 pl-9"
                    />
                </div>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                    <Bell className="size-5" aria-hidden="true" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 gap-2 px-2">
                            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                {admin?.name?.charAt(0).toUpperCase()}
                            </span>
                            <span className="hidden text-sm font-medium sm:inline">{admin?.name}</span>
                            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <p className="text-sm font-medium">{admin?.name}</p>
                            <p className="text-xs text-muted-foreground">{admin?.designation ?? admin?.email}</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/admin/profile"><UserRound /> My Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/profile"><KeyRound /> Change Password</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            variant="destructive"
                            className="font-medium !text-destructive focus:!bg-destructive/10 [&_svg]:!text-destructive"
                            onSelect={() => router.post('/admin/logout')}>
                            <LogOut /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
