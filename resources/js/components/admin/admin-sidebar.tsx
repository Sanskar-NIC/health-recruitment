import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/brand-logo';
import { adminMenu } from '@/components/admin/admin-menu';
import type { AdminMenuItem } from '@/components/admin/admin-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';

/** Same 20px icon whether the sidebar is open or collapsed. */
const iconButton = '[&>svg]:size-5';

function NavEntry({ item }: { item: AdminMenuItem }) {
    const { currentUrl } = useCurrentUrl();

    if (!item.children) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={currentUrl === item.href} tooltip={{ children: item.title }} className={iconButton}>
                    <Link href={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    const active = item.children.some((c) => c.href === currentUrl) || currentUrl.startsWith(`${item.href}/`);

    return (
        <Collapsible asChild defaultOpen={active} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={active} tooltip={{ children: item.title }} className={iconButton}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto !size-4 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton asChild isActive={currentUrl === child.href}>
                                    <Link href={child.href}>
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export function AdminSidebar() {
    // Collapses to icons on desktop; phones get a slide-in drawer opened from the topbar.
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="group-data-[collapsible=icon]:size-8!">
                            <Link href="/admin/dashboard">
                                <BrandLogo className="size-9 shrink-0 group-data-[collapsible=icon]:size-8" />
                                <span className="grid flex-1 text-left leading-tight">
                                    <span className="truncate text-sm font-semibold text-primary">Admin Portal</span>
                                    <span className="truncate text-xs text-muted-foreground">Health Recruitment</span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {adminMenu.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <NavEntry key={item.title} item={item} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
        </Sidebar>
    );
}
