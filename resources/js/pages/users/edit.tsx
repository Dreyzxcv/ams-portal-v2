import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CredentialsDialog from '@/components/users/credentials-dialog';
import type { RoleOption, UserRow } from '@/types/users';

type Props = {
    user: UserRow;
    roles: RoleOption[];
    statuses: string[];
    can: { changeRole: boolean; changeStatus: boolean; resetPassword: boolean };
};

const selectClass =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50';

export default function UsersEdit({ user, roles, statuses, can }: Props) {
    return (
        <>
            <Head title={`Manage ${user.name}`} />
            <CredentialsDialog />

            <div className="max-w-xl space-y-10 p-4">
                <div className="flex items-start justify-between gap-4">
                    <Heading title={user.name} description={`Username: ${user.username}`} />
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status}
                    </Badge>
                </div>

                <section className="space-y-4">
                    <h2 className="text-base font-medium">Details</h2>
                    <Form
                        {...UserController.update.form(user.id)}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full name</Label>
                                    <Input id="name" name="name" defaultValue={user.name} required />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" defaultValue={user.email ?? ''} />
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
                                        <p className="text-muted-foreground text-sm">
                                            You cannot change your own role.
                                        </p>
                                    )}
                                    <InputError message={errors.role} />
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button type="submit" disabled={processing}>
                                        Save changes
                                    </Button>
                                    <Button asChild variant="ghost">
                                        <Link href={UserController.index()}>Back to users</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </section>

                <section className="space-y-4">
                    <h2 className="text-base font-medium">Access</h2>
                    <p className="text-muted-foreground text-sm">
                        Inactive and suspended users cannot sign in, and their active sessions and trusted devices are revoked.
                    </p>
                    <Form
                        {...UserController.updateStatus.form(user.id)}
                        options={{ preserveScroll: true }}
                        className="flex flex-wrap items-end gap-3"
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
                                        className={selectClass}
                                    >
                                        {statuses.map((value) => (
                                            <option key={value} value={value}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.status} />
                                </div>
                                <Button type="submit" variant="secondary" disabled={processing || !can.changeStatus}>
                                    Update status
                                </Button>
                            </>
                        )}
                    </Form>
                    {!can.changeStatus && (
                        <p className="text-muted-foreground text-sm">
                            You cannot change your own status.
                        </p>
                    )}
                </section>

                {can.resetPassword && (
                    <section className="space-y-4">
                        <h2 className="text-base font-medium">Password</h2>
                        <p className="text-muted-foreground text-sm">
                            Generates a new temporary password, shown once. The user must change it at next login and is signed out everywhere.
                        </p>
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
                                <Button type="submit" variant="destructive" disabled={processing}>
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