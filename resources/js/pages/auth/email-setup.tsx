import { Form, Head } from '@inertiajs/react';
import EmailSetupController from '@/actions/App/Http/Controllers/Auth/EmailSetupController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

type Props = {
    email: string | null;
    status?: string;
};

export default function EmailSetup({ email, status }: Props) {
    return (
        <>
            <Head title="Add your email" />

            {email === null ? (
                <>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                        Your account has no email yet. Enter one and we will send you a
                        6-digit code to verify it.
                    </p>

                    <Form {...EmailSetupController.store.form()} className="flex flex-col gap-6">
                        {({ processing, errors }) => (
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        autoFocus
                                        placeholder="email@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing && <Spinner />}
                                    Send code
                                </Button>
                            </div>
                        )}
                    </Form>
                </>
            ) : (
                <>
                    <p className="text-muted-foreground mb-6 text-center text-sm">
                        We sent a 6-digit code to {email}. It expires in 5 minutes.
                    </p>

                    <Form
                        {...EmailSetupController.verify.form()}
                        resetOnSuccess={['code']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Verification code</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        pattern="[0-9]{6}"
                                        required
                                        autoFocus
                                        placeholder="123456"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox id="trust" name="trust" />
                                    <Label htmlFor="trust">Trust this device for 30 days</Label>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing && <Spinner />}
                                    Verify and log in
                                </Button>
                            </div>
                        )}
                    </Form>

                    <Form {...EmailSetupController.resend.form()} className="mt-4 text-center">
                        {({ processing }) => (
                            <Button type="submit" variant="link" disabled={processing}>
                                Send a new code
                            </Button>
                        )}
                    </Form>

                    <Form {...EmailSetupController.change.form()} className="text-center">
                        {({ processing }) => (
                            <Button type="submit" variant="link" disabled={processing}>
                                Use a different email
                            </Button>
                        )}
                    </Form>
                </>
            )}

            {status && (
                <div className="mt-2 text-center text-sm font-medium text-green-600">{status}</div>
            )}

            <div className="mt-4 text-center text-sm">
                <TextLink href="/login">Back to login</TextLink>
            </div>
        </>
    );
}

EmailSetup.layout = {
    title: 'Add your email',
    description: 'Verify an email address to finish logging in',
};