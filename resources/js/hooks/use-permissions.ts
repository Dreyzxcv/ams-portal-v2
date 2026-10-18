import { usePage } from '@inertiajs/react';

type SharedPermissions = {
    auth: { permissions?: string[] };
};

export function usePermissions() {
    const { auth } = usePage<SharedPermissions>().props;
    const granted = auth.permissions ?? [];

    return {
        can: (permission: string): boolean => granted.includes(permission),
    };
}