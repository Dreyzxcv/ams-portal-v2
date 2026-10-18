import { Head, Link, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CredentialsDialog from '@/components/users/credentials-dialog';
import type { Paginated, RoleOption, UserRow } from '@/types/users';

type Props = {
    users: Paginated<UserRow>;
    filters: { search: string; role: string | null; status: string | null };
    roles: RoleOption[];
    statuses: string[];
};

const selectClass =
    'border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function statusVariant(status: string | null) {
    if (status === 'active') {
        return 'default' as const;
    }

    return status === 'suspended' ? ('destructive' as const) : ('secondary' as const);
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

    return (
        <>
            <Head title="Users" />
            <CredentialsDialog />

            <div className="space-y-6 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading
                        title="Users"
                        description="Create accounts, assign roles and manage access"
                    />
                    <Button asChild>
                        <Link href={UserController.create()}>
                            <Plus />
                            New user
                        </Link>
                    </Button>
                </div>

                <form
                    className="flex flex-wrap items-center gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        visit(search, role, status);
                    }}
                >
                    <Input
                        className="w-64"
                        type="search"
                        placeholder="Search name, username or email"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        aria-label="Search users"
                    />

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

                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Username</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Last login</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-muted-foreground px-4 py-8 text-center"
                                    >
                                        No users match these filters.
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{user.name}</div>
                                        <div className="text-muted-foreground">
                                            {user.email ?? 'No email'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono">
                                        {user.username}
                                    </td>
                                    <td className="px-4 py-3">{user.role_label}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={statusVariant(user.status)}>
                                            {user.status}
                                        </Badge>
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
                                    <td className="px-4 py-3 text-right">
                                        <Button asChild variant="outline" size="sm">
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

                <div className="flex items-center justify-between text-sm">
                    <p className="text-muted-foreground">
                        {users.total === 0
                            ? 'No users'
                            : `Showing ${users.from} to ${users.to} of ${users.total}`}
                    </p>
                    <div className="flex gap-2">
                        {users.prev_page_url ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={users.prev_page_url} preserveScroll>
                                    Previous
                                </Link>
                            </Button>
                        ) : null}
                        {users.next_page_url ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={users.next_page_url} preserveScroll>
                                    Next
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [{ title: 'Users', href: UserController.index() }],
};