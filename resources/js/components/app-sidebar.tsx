import { Link } from '@inertiajs/react';
import { GraduationCap, ShieldAlert, TrendingUp, Layers, LayoutGrid, Users, DoorOpen, Megaphone } from 'lucide-react';
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
import { index as violationsIndex } from '@/routes/violations';
import { index as progressIndex } from '@/routes/progress';
import { edit as intakeEdit } from '@/routes/intake';
import { index as announcementsIndex } from '@/routes/announcements';

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
    {
        title: 'Violations',
        href: violationsIndex(),
        icon: ShieldAlert,
    },
    {
        title: 'Progress',
        href: progressIndex(),
        icon: TrendingUp,
        permission: 'progress.manage',
    },
    {
        title: 'Intake',
        href: intakeEdit(),
        icon: DoorOpen,
        permission: 'settings.manage',
    },
    {
        title: 'Announcements',
        href: announcementsIndex(),
        icon: Megaphone,
        permission: 'announcements.manage',
    },
];

export function AppSidebar() {
    const { can } = usePermissions();

    const visibleItems = mainNavItems.filter(
        (item) => item.permission === undefined || can(item.permission),
    );

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-0">
            <SidebarHeader className="px-3 pt-3 pb-1">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent rounded-xl"
                        >
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-1.5 py-2">
                <NavMain items={visibleItems} />
            </SidebarContent>

            <SidebarFooter className="p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}