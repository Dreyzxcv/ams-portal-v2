import { Form, Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RoleOption } from '@/types/users';

type Props = { roles: RoleOption[] };

const selectClass =
    'border-input bg-background h-9 w-full rounded-xl border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function UsersCreate({ roles }: Props) {
    return (
        <>
            <Head title="New user" />

            <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:p-6">
                <div className="flex items-center gap-4 rounded-3xl border bg-sky-500/10 p-6">
                    <span
                        aria-hidden="true"
                        className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    >
                        <Users className="size-6" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            New user
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            A temporary password is generated and shown once after you save
                        </p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border p-6 shadow-xs">
                    <Form {...UserController.store.form()} className="space-y-5">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Display name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        autoFocus
                                        autoComplete="off"
                                        className="rounded-xl"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        required
                                        autoComplete="off"
                                        autoCapitalize="none"
                                        spellCheck={false}
                                        className="rounded-xl"
                                    />
                                    <p className="text-muted-foreground text-xs">
                                        3 to 50 characters: letters, digits, dot, underscore or
                                        hyphen. It cannot be changed later.
                                    </p>
                                    <InputError message={errors.username} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="role">Role</Label>
                                    <select
                                        id="role"
                                        name="role"
                                        required
                                        defaultValue="trainee"
                                        className={selectClass}
                                    >
                                        {roles.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.role} />
                                </div>

                                <div className="flex items-center gap-3 pt-1">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl"
                                    >
                                        Create user
                                    </Button>
                                    <Button asChild variant="ghost" className="rounded-xl">
                                        <Link href={UserController.index()}>Cancel</Link>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

UsersCreate.layout = {
    breadcrumbs: [
        { title: 'Users', href: UserController.index() },
        { title: 'New user', href: UserController.create() },
    ],
};