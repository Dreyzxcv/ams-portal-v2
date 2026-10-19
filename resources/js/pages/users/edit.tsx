import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CredentialsDialog from '@/components/users/credentials-dialog';
import { cn } from '@/lib/utils';
import type { RoleOption, UserRow } from '@/types/users';

type Props = {
    user: UserRow;
    roles: RoleOption[];
    statuses: string[];
    can: { changeRole: boolean; changeStatus: boolean; resetPassword: boolean };
};

const card = 'bg-card rounded-2xl border shadow-xs';

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50';

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

export default function UsersEdit({ user, roles, statuses, can }: Props) {
    return (
        <>
            <Head title={`Manage ${user.name}`} />
            <CredentialsDialog />

            <div className="mx-auto w-full max-w-7xl space-y-4 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <div className="flex min-w-0 items-center gap-4">
                        <div
                            aria-hidden="true"
                            className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-base font-semibold text-sky-700 dark:text-sky-300"
                        >
                            {initials(user.name)}
                        </div>
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                @{user.username} · {user.role_label}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                'inline-flex rounded-full px-3 py-1.5 text-sm font-semibold capitalize',
                                statusStyle(user.status),
                            )}
                        >
                            {user.status}
                        </span>
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="bg-background/70 rounded-xl"
                        >
                            <Link href={UserController.index()}>
                                <ArrowLeft className="size-4" aria-hidden="true" />
                                Back to users
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid items-start gap-4 lg:grid-cols-3">
                    <section className={cn(card, 'lg:col-span-2')}>
                        <header className="px-5 pt-4 pb-3">
                            <h2 className="text-sm font-semibold">Details</h2>
                        </header>
                        <Form
                            {...UserController.update.form(user.id)}
                            options={{ preserveScroll: true }}
                            className="space-y-5 px-5 pb-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={user.name}
                                            required
                                            className="rounded-xl"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            defaultValue={user.email ?? ''}
                                            className="rounded-xl"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <select
                                            id="role"
                                            name="role"
                                            defaultValue={user.role ?? ''}
                                            disabled={!can.changeRole}
                                            className={selectClass}
                                        >
                                            {roles.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {!can.changeRole && (
                                            <p className="text-muted-foreground text-xs">
                                                You cannot change your own role.
                                            </p>
                                        )}
                                        <InputError message={errors.role} />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl"
                                    >
                                        Save changes
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>

                    <div className="space-y-4">
                        <section className={card}>
                            <header className="flex items-center gap-2 px-5 pt-4 pb-3">
                                <ShieldCheck
                                    aria-hidden="true"
                                    className="text-muted-foreground size-4"
                                />
                                <h2 className="text-sm font-semibold">Access</h2>
                            </header>
                            <div className="space-y-4 px-5 pb-5">
                                <p className="text-muted-foreground text-xs">
                                    Inactive and suspended users cannot sign in, and their
                                    active sessions and trusted devices are revoked.
                                </p>
                                <Form
                                    {...UserController.updateStatus.form(user.id)}
                                    options={{ preserveScroll: true }}
                                    className="space-y-3"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="status">Status</Label>
                                                <select
                                                    id="status"
                                                    name="status"
                                                    defaultValue={user.status ?? 'active'}
                                                    disabled={!can.changeStatus}
                                                    className={cn(selectClass, 'capitalize')}
                                                >
                                                    {statuses.map((value) => (
                                                        <option key={value} value={value}>
                                                            {value}
                                                        </option>
                                                    ))}
                                                </select>
                                                <InputError message={errors.status} />
                                            </div>
                                            <Button
                                                type="submit"
                                                variant="secondary"
                                                disabled={processing || !can.changeStatus}
                                                className="rounded-xl"
                                            >
                                                Update status
                                            </Button>
                                        </>
                                    )}
                                </Form>
                                {!can.changeStatus && (
                                    <p className="text-muted-foreground text-xs">
                                        You cannot change your own status.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                </div>

                {can.resetPassword && (
                    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <span
                                aria-hidden="true"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            >
                                <KeyRound className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-sm font-semibold">Reset password</h2>
                                <p className="text-muted-foreground text-sm">
                                    Generates a new temporary password, shown once. The user
                                    must change it at next login and is signed out everywhere.
                                </p>
                            </div>
                        </div>
                        <Form
                            {...UserController.resetPassword.form(user.id)}
                            options={{ preserveScroll: true }}
                            onBefore={() =>
                                window.confirm(
                                    `Reset the password for ${user.name}? Their current password will stop working.`,
                                )
                            }
                        >
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={processing}
                                    className="rounded-xl"
                                >
                                    Reset password
                                </Button>
                            )}
                        </Form>
                    </section>
                )}
            </div>
        </>
    );
}

UsersEdit.layout = {
    breadcrumbs: [
        { title: 'Users', href: UserController.index() },
        { title: 'Manage user', href: UserController.index() },
    ],
};