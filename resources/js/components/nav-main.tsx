import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export type NavSection = {
    label: string;
    items: NavItem[];
};

export function NavMain({ sections }: { sections: NavSection[] }) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <>
            {sections.map((section) => (
                <SidebarGroup key={section.label} className="px-2 py-0">
                    <SidebarGroupLabel className="text-muted-foreground mb-1 text-xs font-medium">
                        {section.label}
                    </SidebarGroupLabel>
                    <SidebarMenu className="gap-1">
                        {section.items.map((item) => {
                            const active = isCurrentOrParentUrl(item.href);

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={active}
                                        tooltip={{ children: item.title }}
                                        className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground h-10 rounded-xl px-3 font-medium transition-colors data-[active=true]:bg-sky-500/10 data-[active=true]:font-semibold data-[active=true]:text-sky-700 dark:data-[active=true]:text-sky-300"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon
                                                    className={
                                                        active
                                                            ? 'text-sky-600 dark:text-sky-400'
                                                            : undefined
                                                    }
                                                />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}