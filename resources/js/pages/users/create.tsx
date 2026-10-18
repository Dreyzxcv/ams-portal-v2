import { Form, Head, Link } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/Users/UserController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { RoleOption } from '@/types/users';

type Props = { roles: RoleOption[] };

const selectClass =
    'border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function UsersCreate({ roles }: Props) {
    return (
        <>
            <Head title="New user" />

            <div className="max-w-xl space-y-6 p-4">
                <Heading
                    title="New user"
                    description="A temporary password is generated and shown once after you save"
                />

                <Form {...UserController.store.form()} className="space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full name</Label>
                                <Input id="name" name="name" required autoFocus autoComplete="off" />
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
                                />
                                <p className="text-muted-foreground text-sm">
                                    3 to 50 characters: letters, digits, dot, underscore or hyphen. It cannot be changed later.
                                </p>
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email (optional)</Label>
                                <Input id="email" name="email" type="email" autoComplete="off" />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="role">Role</Label>
                                <select id="role" name="role" required defaultValue="trainee" className={selectClass}>
                                    {roles.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Button type="submit" disabled={processing}>
                                    Create user
                                </Button>
                                <Button asChild variant="ghost">
                                    <Link href={UserController.index()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
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