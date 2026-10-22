import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

export default function ThemeToggle({ className }: { className?: string }) {
    const { updateAppearance } = useAppearance();

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
            onClick={() =>
                updateAppearance(
                    document.documentElement.classList.contains('dark')
                        ? 'light'
                        : 'dark',
                )
            }
            className={cn('rounded-xl', className)}
        >
            {/* Icon is chosen by CSS, so SSR and client markup always match. */}
            <Sun aria-hidden="true" className="hidden dark:block" />
            <Moon aria-hidden="true" className="dark:hidden" />
        </Button>
    );
}