import { Form, Head } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { useState } from 'react';
import OtpChallengeController from '@/actions/App/Http/Controllers/Auth/OtpChallengeController';
import InputError from '@/components/input-error';
import OtpInput from '@/components/otp-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { formatCountdown, useResendCooldown } from '@/hooks/use-resend-cooldown';

type Props = {
    email: string;
    status?: string;
    resend_available_at: number;
};

export default function OtpChallenge({ email, status, resend_available_at }: Props) {
    const [attempt, setAttempt] = useState(0);
    const cooldown = useResendCooldown(resend_available_at);

    return (
        <>
            <Head title="Verification code" />

            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <span
                    aria-hidden="true"
                    className="flex size-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400"
                >
                    <MailCheck className="size-6" />
                </span>
                <p className="text-sm text-muted-foreground">
                    We sent a 6-digit code to{' '}
                    <span className="font-medium text-foreground">{email}</span>.
                    It expires in 5 minutes.
                </p>
            </div>

            {status && (
                <div className="mb-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    {status}
                </div>
            )}

            <Form
                {...OtpChallengeController.verify.form()}
                onError={() => setAttempt((n) => n + 1)}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-3">
                            <Label htmlFor="code" className="justify-center">
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

            <Form {...OtpChallengeController.resend.form()} className="mt-2 text-center">
                {({ processing, errors }) => (
                    <>
                        <Button type="submit" variant="link" disabled={processing || cooldown > 0}>
                            {cooldown > 0
                                ? `Send a new code in ${formatCountdown(cooldown)}`
                                : 'Send a new code'}
                        </Button>
                    </>
                )}
            </Form>

            <div className="mt-2 text-center text-sm">
                <TextLink href="/login">Back to login</TextLink>
            </div>
        </>
    );
}

OtpChallenge.layout = {
    title: 'Check your email',
    description: 'Enter the verification code to finish logging in',
};