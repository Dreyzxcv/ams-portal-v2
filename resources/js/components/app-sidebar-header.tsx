import { Breadcrumbs } from '@/components/breadcrumbs';
import ThemeToggle from '@/components/theme-toggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="bg-background/80 sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 rounded-t-2xl border-b px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 sm:px-6">
            <SidebarTrigger className="hover:bg-muted -ml-1.5 size-8 rounded-lg" />
            <div aria-hidden="true" className="bg-border h-4 w-px" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
            <ThemeToggle className="ml-auto size-8" />
        </header>
    );
}