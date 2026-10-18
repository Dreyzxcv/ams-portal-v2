import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Credentials } from '@/types/users';

type FlashShape = { flash?: { credentials?: Credentials } };

/**
 * Shows a one-time temporary password after a user is created or reset.
 * The server flashes it for a single page visit and never stores it.
 */
export default function CredentialsDialog() {
    const flash = (usePage() as unknown as FlashShape).flash;
    const incoming = flash?.credentials ?? null;
    const [credentials, setCredentials] = useState<Credentials | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (incoming) {
            setCredentials(incoming);
            setCopied(false);
        }
    }, [incoming]);

    async function copy() {
        if (!credentials) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                `Username: ${credentials.username}\nTemporary password: ${credentials.password}`,
            );
            setCopied(true);
        } catch {
            setCopied(false);
        }
    }

    return (
        <Dialog
            open={credentials !== null}
            onOpenChange={(open) => {
                if (!open) {
                    setCredentials(null);
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Temporary credentials</DialogTitle>
                    <DialogDescription>
                        This password is shown only once. Give it to the user
                        securely. They must change it at their first login.
                    </DialogDescription>
                </DialogHeader>

                {credentials && (
                    <dl className="grid gap-3 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Username</dt>
                            <dd className="font-mono">{credentials.username}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Temporary password
                            </dt>
                            <dd className="font-mono break-all">
                                {credentials.password}
                            </dd>
                        </div>
                    </dl>
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={copy}>
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button type="button" onClick={() => setCredentials(null)}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}