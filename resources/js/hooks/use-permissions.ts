import { usePage } from '@inertiajs/react';

type SharedPermissions = {
    auth: {
        permissions?: string[];
        user?: { role?: string | null };
    };
};

export function usePermissions() {
    const { auth } = usePage<SharedPermissions>().props;
    const granted = auth.permissions ?? [];

    return {
        role: auth.user?.role ?? null,
        can: (permission: string): boolean => granted.includes(permission),
    };
}
