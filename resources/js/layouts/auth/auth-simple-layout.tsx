import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6">
            {/* Soft background glow */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
            >
                <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
                <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-violet-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-sky-400/10 blur-3xl" />
            </div>

            <div className="w-full max-w-md">
                <Link
                    href={home()}
                    className="mb-6 flex flex-col items-center gap-3"
                >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
                        <AppLogoIcon className="size-7 fill-current text-white" />
                    </div>
                    <span className="text-sm font-medium tracking-tight text-muted-foreground">
                        {name}
                    </span>
                </Link>

                <div className="rounded-3xl border bg-card/80 p-8 shadow-xl shadow-black/5 backdrop-blur sm:p-10">
                    <div className="mb-8 space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>

                <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    Secured access for authorized personnel only
                </p>
            </div>
        </div>
    );
}