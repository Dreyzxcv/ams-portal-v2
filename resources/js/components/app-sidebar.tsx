import { Link } from '@inertiajs/react';
import {
    DoorOpen,
    GraduationCap,
    Layers,
    LayoutGrid,
    Megaphone,
    ShieldAlert,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import type { NavSection } from '@/components/nav-main';
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
import { index as announcementsIndex } from '@/routes/announcements';
import { index as batchesIndex } from '@/routes/batches';
import { index as gradesIndex } from '@/routes/grades';
import { edit as intakeEdit } from '@/routes/intake';
import { index as progressIndex } from '@/routes/progress';
import { index as usersIndex } from '@/routes/users';
import { index as violationsIndex } from '@/routes/violations';
import type { NavItem } from '@/types';

type PermittedNavItem = NavItem & {
    /** Item is shown only to users holding this permission. Omit for items everyone sees. */
    permission?: string;
};

type PermittedSection = {
    label: string;
    items: PermittedNavItem[];
};

const sections: PermittedSection[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        ],
    },
    {
        label: 'Academics',
        items: [
            {
                title: 'Batches',
                href: batchesIndex(),
                icon: Layers,
                permission: 'batches.view',
            },
            { title: 'Grades', href: gradesIndex(), icon: GraduationCap },
            {
                title: 'Progress',
                href: progressIndex(),
                icon: TrendingUp,
                permission: 'progress.manage',
            },
        ],
    },
    {
        label: 'Records',
        items: [
            { title: 'Violations', href: violationsIndex(), icon: ShieldAlert },
        ],
    },
    {
        label: 'Administration',
        items: [
            {
                title: 'Announcements',
                href: announcementsIndex(),
                icon: Megaphone,
                permission: 'announcements.manage',
            },
            {
                title: 'Recruitment',
                href: intakeEdit(),
                icon: DoorOpen,
                permission: 'settings.manage',
            },
            {
                title: 'Users',
                href: usersIndex(),
                icon: Users,
                permission: 'users.manage',
            },
        ],
    },
];

export function AppSidebar() {
    const { can } = usePermissions();

    const visibleSections: NavSection[] = sections
        .map((section) => ({
            label: section.label,
            items: section.items.filter(
                (item) => item.permission === undefined || can(item.permission),
            ),
        }))
        .filter((section) => section.items.length > 0);

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

            <SidebarContent className="gap-3 px-1.5 py-2">
                <NavMain sections={visibleSections} />
            </SidebarContent>

            <SidebarFooter className="p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}