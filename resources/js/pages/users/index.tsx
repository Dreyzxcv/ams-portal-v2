import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useRef, useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CredentialsDialog from '@/components/users/credentials-dialog';
import { cn } from '@/lib/utils';
import type { Paginated, RoleOption, UserRow } from '@/types/users';

type Props = {
    users: Paginated<UserRow>;
    filters: { search: string; role: string | null; status: string | null };
    roles: RoleOption[];
    statuses: string[];
};

const selectClass =
    'border-input bg-background/70 h-9 rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join('');
}

function statusStyle(status: string | null) {
    if (status === 'active') {
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    }

    return status === 'suspended'
        ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
        : 'bg-muted text-muted-foreground';
}

export default function UsersIndex({ users, filters, roles, statuses }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [role, setRole] = useState(filters.role ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function visit(nextSearch: string, nextRole: string, nextStatus: string) {
        const params: Record<string, string> = {};

        if (nextSearch.trim() !== '') {
            params.search = nextSearch.trim();
        }

        if (nextRole !== '') {
            params.role = nextRole;
        }

        if (nextStatus !== '') {
            params.status = nextStatus;
        }

        router.get(UserController.index.url(), params, {
            preserveState: true,
            replace: true,
        });
    }

    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    function onSearchChange(value: string) {
        setSearch(value);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => visit(value, role, status), 300);
    }

    return (
        <>
            <Head title="Users" />
            <CredentialsDialog />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Users
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Create accounts, assign roles and manage access
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <form
                            className="flex flex-wrap items-center gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                visit(search, role, status);
                            }}
                        >
                            <div className="relative">
                                <Search
                                    aria-hidden="true"
                                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                                />
                                <Input
                                    className="bg-background/70 w-56 rounded-xl pl-9"
                                    type="search"
                                    placeholder="Search name, username or email"
                                    value={search}
                                    onChange={(event) => onSearchChange(event.target.value)}
                                    aria-label="Search users"
                                />
                            </div>

                            <select
                                className={selectClass}
                                value={role}
                                aria-label="Filter by role"
                                onChange={(event) => {
                                    setRole(event.target.value);
                                    visit(search, event.target.value, status);
                                }}
                            >
                                <option value="">All roles</option>
                                {roles.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className={selectClass}
                                value={status}
                                aria-label="Filter by status"
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    visit(search, role, event.target.value);
                                }}
                            >
                                <option value="">All statuses</option>
                                {statuses.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>

                            <Button
                                type="submit"
                                variant="outline"
                                className="bg-background/70 rounded-xl"
                            >
                                Search
                            </Button>
                        </form>

                        <Button asChild className="rounded-xl">
                            <Link href={UserController.create()}>
                                <Plus />
                                New user
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/60 text-muted-foreground text-left text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Role</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Last login</th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-muted-foreground px-5 py-12 text-center"
                                        >
                                            No users match these filters.
                                        </td>
                                    </tr>
                                )}
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-muted/40 border-t transition-colors"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <span
                                                    aria-hidden="true"
                                                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-xs font-semibold text-sky-700 dark:text-sky-300"
                                                >
                                                    {initials(user.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-muted-foreground truncate text-xs">
                                                        @{user.username} ·{' '}
                                                        {user.email ?? 'No email'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="bg-violet-500/10 inline-flex rounded-full px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-400">
                                                {user.role_label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={cn(
                                                    'inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize',
                                                    statusStyle(user.status),
                                                )}
                                            >
                                                {user.status}
                                            </span>
                                            {user.force_password_change && (
                                                <div className="text-muted-foreground mt-1 text-xs">
                                                    Password change pending
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3">
                                            {user.last_login_at
                                                ? new Date(user.last_login_at).toLocaleString()
                                                : 'Never'}
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <Button
                                                asChild
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl"
                                            >
                                                <Link href={UserController.edit(user.id)}>
                                                    Manage
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex items-center justify-between px-1 text-sm">
                    <p className="text-muted-foreground">
                        {users.total === 0
                            ? 'No users'
                            : `Showing ${users.from} to ${users.to} of ${users.total}`}
                    </p>
                    <div className="flex gap-2">
                        {users.prev_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={users.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        )}
                        {users.next_page_url && (
                            <Button asChild variant="outline" size="sm" className="rounded-xl">
                                <Link href={users.next_page_url} preserveScroll>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: UserController.index() }],
};