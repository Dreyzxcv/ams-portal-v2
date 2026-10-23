import { useEffect, useState } from 'react';

export function useResendCooldown(availableAt: number): number {
    const calc = () => Math.max(0, availableAt - Math.floor(Date.now() / 1000));
    const [remaining, setRemaining] = useState(calc);

    useEffect(() => {
        setRemaining(calc());
        const timer = window.setInterval(() => setRemaining(calc()), 1000);

        return () => window.clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [availableAt]);

    return remaining;
}

export function formatCountdown(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}