import { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    length?: number;
    disabled?: boolean;
    invalid?: boolean;
};

/**
 * N single-digit boxes that submit the parent form as one hidden field
 * once every box is filled. Supports typing, backspace, arrow keys,
 * paste, and one-time-code autofill.
 */
export default function OtpInput({
    name,
    length = 6,
    disabled,
    invalid,
}: Props) {
    const [digits, setDigits] = useState<string[]>(() =>
        Array(length).fill(''),
    );
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const root = useRef<HTMLDivElement>(null);
    const submitted = useRef(false);

    const code = digits.join('');

    // Runs after render, so the hidden input already holds the full code.
    useEffect(() => {
        if (code.length === length && !submitted.current) {
            submitted.current = true;
            root.current?.closest('form')?.requestSubmit();
        }
    }, [code, length]);

    function focusBox(index: number) {
        const box = inputs.current[Math.min(Math.max(index, 0), length - 1)];
        box?.focus();
        box?.select();
    }

    function fillFrom(index: number, raw: string) {
        const chars = raw.replace(/\D/g, '').slice(0, length - index).split('');

        if (chars.length === 0) {
            return;
        }

        setDigits((prev) => {
            const next = [...prev];
            chars.forEach((c, i) => {
                next[index + i] = c;
            });

            return next;
        });

        focusBox(index + chars.length);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
        if (event.key === 'Backspace') {
            event.preventDefault();

            if (digits[index] !== '') {
                setDigits((prev) => prev.map((d, i) => (i === index ? '' : d)));
            } else if (index > 0) {
                setDigits((prev) =>
                    prev.map((d, i) => (i === index - 1 ? '' : d)),
                );
                focusBox(index - 1);
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusBox(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusBox(index + 1);
        }
    }

    function onPaste(event: ClipboardEvent<HTMLInputElement>, index: number) {
        event.preventDefault();
        fillFrom(index, event.clipboardData.getData('text'));
    }

    return (
        <div ref={root} className="flex justify-center gap-2 sm:gap-3">
            <input type="hidden" name={name} value={code} />

            {digits.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputs.current[index] = el;
                    }}
                    value={digit}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    // Lets email/SMS autofill drop the whole code into the first box.
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    autoFocus={index === 0}
                    disabled={disabled}
                    aria-label={`Digit ${index + 1} of ${length}`}
                    aria-invalid={invalid || undefined}
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, '');

                        if (value === '') {
                            setDigits((prev) =>
                                prev.map((d, i) => (i === index ? '' : d)),
                            );

                            return;
                        }

                        fillFrom(index, value);
                    }}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    onPaste={(event) => onPaste(event, index)}
                    className={cn(
                        'size-11 rounded-xl border bg-background text-center font-mono text-xl font-semibold shadow-xs transition-[color,box-shadow] outline-none sm:size-12 sm:text-2xl',
                        'focus-visible:border-sky-500 focus-visible:ring-[3px] focus-visible:ring-sky-500/30',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        digit !== '' && 'border-sky-500/60 bg-sky-500/5',
                        invalid &&
                            'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
                    )}
                />
            ))}
        </div>
    );
}