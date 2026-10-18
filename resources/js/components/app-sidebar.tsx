import { Link } from '@inertiajs/react';
import { GraduationCap, Layers, LayoutGrid, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { usePermissions } from '@/hooks/use-permissions';
import { dashboard } from '@/routes';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';
import { index as batchesIndex } from '@/routes/batches';
import { index as gradesIndex } from '@/routes/grades';

type PermittedNavItem = NavItem & {
    /** Item is shown only to users holding this permission. Omit for items everyone sees. */
    permission?: string;
};

const mainNavItems: PermittedNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: usersIndex(),
        icon: Users,
        permission: 'users.manage',
    },
    {
        title: 'Batches',
        href: batchesIndex(),
        icon: Layers,
        permission: 'batches.view',
    },
    {
        title: 'Grades',
        href: gradesIndex(),
        icon: GraduationCap,
    },
];

export function AppSidebar() {
    const { can } = usePermissions();

    const visibleItems = mainNavItems.filter(
        (item) => item.permission === undefined || can(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}