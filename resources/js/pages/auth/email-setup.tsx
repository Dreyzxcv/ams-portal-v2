import { Form, Head } from '@inertiajs/react';
import { Mail, MailCheck } from 'lucide-react';
import { useState } from 'react';
import EmailSetupController from '@/actions/App/Http/Controllers/Auth/EmailSetupController';
import InputError from '@/components/input-error';
import OtpInput from '@/components/otp-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatCountdown, useResendCooldown } from '@/hooks/use-resend-cooldown';


type Props = {
    email: string | null;
    resend_available_in: number;
    status?: string;
};

export default function EmailSetup({ email, status, resend_available_in }: Props) {
    const [attempt, setAttempt] = useState(0);
    const cooldown = useResendCooldown(resend_available_in);

    return (
        <>
            <Head title="Add your email" />

            {email === null ? (
                <>
                    <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <span
                            aria-hidden="true"
                            className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        >
                            <Mail className="size-6" />
                        </span>
                        <p className="text-sm text-muted-foreground">
                            Your account has no email yet. Enter one and we
                            will send you a 6-digit code to verify it.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {status}
                        </div>
                    )}

                    <Form
                        {...EmailSetupController.store.form()}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
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
                                        className="h-11 rounded-xl"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
                                    disabled={processing || cooldown > 0}
                                >
                                    {processing && <Spinner />}
                                    {cooldown > 0 ? `Send code in ${formatCountdown(cooldown)}` : 'Send code'}
                                </Button>
                            </>
                        )}
                    </Form>
                </>
            ) : (
                <>
                    <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <span
                            aria-hidden="true"
                            className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        >
                            <MailCheck className="size-6" />
                        </span>
                        <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to{' '}
                            <span className="font-medium text-foreground">
                                {email}
                            </span>
                            . It expires in 5 minutes.
                        </p>
                    </div>

                    {status && (
                        <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                            {status}
                        </div>
                    )}

                    <Form
                        {...EmailSetupController.verify.form()}
                        onError={() => setAttempt((n) => n + 1)}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-3">
                                    <Label
                                        htmlFor="code"
                                        className="justify-center"
                                    >
                                        Verification code
                                    </Label>
                                    <OtpInput
                                        key={attempt}
                                        name="code"
                                        disabled={processing}
                                        invalid={Boolean(errors.code)}
                                    />
                                    <InputError
                                        message={errors.code}
                                        className="text-center"
                                    />
                                </div>

                                <div className="flex items-center justify-center space-x-3">
                                    <Checkbox id="trust" name="trust" />
                                    <Label
                                        htmlFor="trust"
                                        className="font-normal text-muted-foreground"
                                    >
                                        Trust this device for 30 days
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="h-11 w-full rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Verify and log in
                                </Button>
                            </>
                        )}
                    </Form>

                    <div className="mt-2 flex flex-col items-center">
                        <Form {...EmailSetupController.resend.form()}>
                            {({ processing }) => (
                                <Button type="submit" variant="link" disabled={processing || cooldown > 0}>
                                    {cooldown > 0
                                        ? `Send a new code in ${formatCountdown(cooldown)}`
                                        : 'Send a new code'}
                                </Button>
                            )}
                        </Form>

                        <Form {...EmailSetupController.change.form()}>
                            {({ processing }) => (
                                <Button
                                    type="submit"
                                    variant="link"
                                    disabled={processing}
                                >
                                    Use a different email
                                </Button>
                            )}
                        </Form>
                    </div>
                </>
            )}

            <div className="mt-2 text-center text-sm">
                <TextLink href="/login">Back to login</TextLink>
            </div>
        </>
    );
}

EmailSetup.layout = {
    title: 'Add your email',
    description: 'Verify an email address to finish logging in',
};