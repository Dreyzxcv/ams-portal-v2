import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Award,
    CalendarClock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    GraduationCap,
    Layers,
    Megaphone,
    Menu,
    MessageCircle,
    Package,
    ShieldCheck,
    Stethoscope,
    Star,
    Target,
    X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboard, login } from '@/routes';
import heroImage from '../../images/landing-page-1.png';
import amsLogo from '../../images/ams-logo.png';
import type { IntakeBanner } from '@/types/intake';

// Hero image. Swap the file at resources/images/landing-page-1.png anytime.
const HERO_IMAGE: string | null = heroImage;

// Add more imports here for the About slideshow.
const ABOUT_SLIDES: string[] = [heroImage];

const DISCORD = 'https://discord.gg/kvemgFZ8Xa';
const REQUEST_ACCOUNT =
    'https://discord.com/channels/1447466128006844418/1513112222757552239';

type Tone = 'sky' | 'violet' | 'emerald' | 'amber' | 'teal' | 'rose';

const tones: Record<Tone, string> = {
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const stats: { icon: LucideIcon; tone: Tone; value: string; label: string }[] = [
    { icon: GraduationCap, tone: 'sky', value: '9+', label: 'Graduated batches' },
    { icon: Layers, tone: 'violet', value: '5 + FE', label: 'Training phases' },
    { icon: Stethoscope, tone: 'emerald', value: 'AMC', label: 'Philippine Army' },
    { icon: Target, tone: 'amber', value: '100%', label: 'Mission readiness' },
    { icon: CalendarClock, tone: 'teal', value: '24/7', label: 'Portal access' },
];

const programs: {
    icon: LucideIcon;
    tone: Tone;
    title: string;
    tag: string;
    text: string;
}[] = [
    {
        icon: Stethoscope,
        tone: 'sky',
        title: 'Medical Trainee',
        tag: 'MT',
        text: 'Enlisted personnel undergoing the full AMS curriculum across four phases, assessed on medical knowledge, fieldcraft, and conduct.',
    },
    {
        icon: ClipboardList,
        tone: 'violet',
        title: 'Medical Instructor',
        tag: 'MI',
        text: 'Officers and NCOs responsible for classroom and field instruction, facilitating phase evaluations and mentoring trainee development.',
    },
    {
        icon: Star,
        tone: 'amber',
        title: 'Senior Medical Instructor',
        tag: 'SMI',
        text: 'Senior faculty responsible for curriculum planning, phase design, and quality assurance across all AMS instruction.',
    },
    {
        icon: Package,
        tone: 'teal',
        title: 'Head Logistics Officer',
        tag: 'HLO',
        text: "Oversees supply chain, administrative logistics, and resource allocation for AMS operations, coordinating with the Dean's office.",
    },
    {
        icon: ShieldCheck,
        tone: 'emerald',
        title: 'Deputy Dean of Medicine',
        tag: 'DDM',
        text: "Assists the Dean in all academic and administrative functions, acting as Officer-in-Charge in the Dean's absence.",
    },
    {
        icon: Award,
        tone: 'rose',
        title: 'Dean of Medicine',
        tag: 'Dean',
        text: 'Highest academic authority at AMS: manages institutional policy, personnel decisions, and serves as liaison to the Surgeon General.',
    },
];

const aboutPoints = [
    'Structured four-phase training program covering medical doctrine, fieldcraft, and leadership.',
    'Academic oversight by the Dean of Medicine, with faculty composed of experienced Army Medical Corps officers.',
    'Formalized batch system that tracks trainee progress from enrollment through graduation.',
    'Digital AMS Portal for centralized grade management, certificate issuance, and personnel records.',
];

const navLinks = [
    { label: 'About AMS', href: '#about' },
    { label: 'Programs', href: '#programs' },
    { label: 'Announcements', href: '#announcements' },
];

const card = 'bg-card rounded-2xl border shadow-xs';

function IconChip({
    icon: Icon,
    tone,
    className,
}: {
    icon: LucideIcon;
    tone: Tone;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl',
                tones[tone],
                className,
            )}
        >
            <Icon aria-hidden="true" className="size-5" />
        </span>
    );
}

function SectionHeading({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-8 space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {title}
            </h2>
            {description && (
                <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                    {description}
                </p>
            )}
        </div>
    );
}

export default function Welcome({ intake }: { intake: IntakeBanner | null }) {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [slide, setSlide] = useState(0);

    const portalHref = auth.user ? dashboard() : login();
    const portalLabel = auth.user ? 'Go to dashboard' : 'Access AMS Portal';

    useEffect(() => {
        if (ABOUT_SLIDES.length <= 1) {
            return;
        }

        const t = setInterval(
            () => setSlide((s) => (s + 1) % ABOUT_SLIDES.length),
            4000,
        );

        return () => clearInterval(t);
    }, [slide]);

    const go = (n: number) =>
        setSlide((n + ABOUT_SLIDES.length) % ABOUT_SLIDES.length);

    return (
        <>
            <Head title="Army Medical School" />

            <div className="bg-background text-foreground min-h-screen scroll-smooth">
                {/* Header */}
                <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
                    <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-3">
                            <img src={amsLogo} alt="AMS logo" className="size-12 shrink-0 object-contain" />
                            <span className="leading-tight">
                                <span className="block text-base font-semibold tracking-tight">
                                    AMS Portal
                                </span>
                                <span className="text-muted-foreground block text-xs">
                                    Army Medical School
                                </span>
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-1 md:flex">
                            {navLinks.map((l) => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-3.5 py-2 text-sm font-medium transition-colors"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <a
                                href={DISCORD}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-3.5 py-2 text-sm font-medium transition-colors"
                            >
                                Discord
                            </a>
                            <Button
                                asChild
                                className="ml-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
                            >
                                <Link href={portalHref}>{portalLabel}</Link>
                            </Button>
                        </nav>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Toggle menu"
                            onClick={() => setMenuOpen((o) => !o)}
                            className="rounded-xl md:hidden"
                        >
                            {menuOpen ? <X /> : <Menu />}
                        </Button>
                    </div>

                    {menuOpen && (
                        <div className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
                            {navLinks.map((l) => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl px-3 py-2.5 text-sm font-medium"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <Button
                                asChild
                                className="mt-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
                            >
                                <Link href={portalHref}>{portalLabel}</Link>
                            </Button>
                        </div>
                    )}
                </header>

                <main className="mx-auto w-full max-w-7xl space-y-16 px-4 py-6 sm:px-6 sm:py-8">
                    {/* Hero */}
                    <section className="relative isolate overflow-hidden rounded-3xl border bg-sky-500/10">
                        {HERO_IMAGE && (
                            <>
                                <img
                                    src={HERO_IMAGE}
                                    alt=""
                                    aria-hidden="true"
                                    className="absolute inset-0 -z-20 h-full w-full object-cover"
                                />
                                <div className="from-background via-background/85 to-background/30 absolute inset-0 -z-10 bg-gradient-to-r" />
                            </>
                        )}

                        <div className="max-w-2xl space-y-6 p-6 py-16 sm:p-12 sm:py-24">
                            {intake && (
                                <span className="bg-background/70 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                                    <span
                                        className={cn(
                                            'size-2 rounded-full',
                                            intake.status === 'open' ? 'bg-emerald-500' : 'bg-amber-500',
                                        )}
                                    />
                                    {intake.message}
                                </span>
                            )}

                            <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
                                Army Medical School
                            </h1>

                            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed sm:text-base">
                                The premier military medical education
                                institution of the Philippine Army. Committed
                                to forming skilled, disciplined, and
                                mission-ready Army Medical Corps personnel
                                through rigorous training and academic
                                excellence.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
                                >
                                    <Link href={portalHref}>
                                        {portalLabel}
                                        <ArrowRight />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="bg-background/70 rounded-xl"
                                >
                                    <a href="#announcements">
                                        View announcements
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Stats */}
                    <section
                        aria-label="School at a glance"
                        className="grid grid-cols-2 gap-4 lg:grid-cols-5"
                    >
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className={cn(
                                    card,
                                    'p-5 last:col-span-2 lg:last:col-span-1',
                                )}
                            >
                                <IconChip icon={s.icon} tone={s.tone} />
                                <div className="mt-4 text-3xl leading-none font-semibold tracking-tight tabular-nums">
                                    {s.value}
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* About */}
                    <section id="about" className="scroll-mt-24">
                        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                            <div className="bg-muted relative h-[340px] overflow-hidden rounded-3xl border sm:h-[400px]">
                                <img
                                    src={ABOUT_SLIDES[slide]}
                                    alt="AMS training"
                                    className="h-full w-full object-cover"
                                />
                                <div className="bg-background/80 absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs backdrop-blur">
                                    <Stethoscope
                                        aria-hidden="true"
                                        className="size-4 text-sky-600 dark:text-sky-400"
                                    />
                                    Army Medical Corps, Philippine Army
                                </div>

                                {ABOUT_SLIDES.length > 1 && (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            aria-label="Previous slide"
                                            onClick={() => go(slide - 1)}
                                            className="bg-background/80 absolute top-1/2 left-3 size-8 -translate-y-1/2 rounded-xl"
                                        >
                                            <ChevronLeft />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            aria-label="Next slide"
                                            onClick={() => go(slide + 1)}
                                            className="bg-background/80 absolute top-1/2 right-3 size-8 -translate-y-1/2 rounded-xl"
                                        >
                                            <ChevronRight />
                                        </Button>
                                        <div className="absolute top-3 right-3 flex gap-1.5">
                                            {ABOUT_SLIDES.map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    aria-label={`Slide ${i + 1}`}
                                                    onClick={() => go(i)}
                                                    className={cn(
                                                        'size-2 rounded-full border',
                                                        i === slide
                                                            ? 'border-sky-500 bg-sky-500'
                                                            : 'bg-background/70',
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <SectionHeading
                                    title="Forged in service, built for medicine"
                                    description="The Army Medical School operates under the Army Medical Corps of the Philippine Army, dedicated to producing highly capable medical personnel who embody the values of discipline, integrity, and service."
                                />
                                <ul className="space-y-3">
                                    {aboutPoints.map((p) => (
                                        <li
                                            key={p}
                                            className={cn(
                                                card,
                                                'flex items-start gap-3 p-4 text-sm leading-relaxed',
                                            )}
                                        >
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                                            />
                                            <span className="text-muted-foreground">
                                                {p}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Programs */}
                    <section id="programs" className="scroll-mt-24">
                        <SectionHeading
                            title="Training tracks and roles"
                            description="AMS trains personnel across medical instruction, logistics, and operational roles, each with defined responsibilities and a clear path to advancement."
                        />
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {programs.map((p) => (
                                <article
                                    key={p.tag}
                                    className={cn(
                                        card,
                                        'hover:border-foreground/20 flex flex-col p-5 transition hover:shadow-md',
                                    )}
                                >
                                    <div className="flex items-start justify-between">
                                        <IconChip icon={p.icon} tone={p.tone} />
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
                                                tones[p.tone],
                                            )}
                                        >
                                            {p.tag}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-base font-semibold tracking-tight">
                                        {p.title}
                                    </h3>
                                    <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                                        {p.text}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Announcements */}
                    <section id="announcements" className="scroll-mt-24">
                        <SectionHeading
                            title="Announcements"
                            description="Official notices, school orders, and phase updates from the Office of the Dean of Medicine."
                        />
                        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 px-6 py-12 text-center">
                            <IconChip
                                icon={Megaphone}
                                tone="amber"
                                className="size-12"
                            />
                            <p className="text-base font-semibold">
                                Coming soon
                            </p>
                            <p className="text-muted-foreground max-w-sm text-sm">
                                Announcements will show up here once the Office
                                of the Dean posts them.
                            </p>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="flex flex-wrap items-center justify-between gap-8 rounded-3xl border bg-sky-500/10 p-6 sm:p-10">
                        <div className="max-w-xl space-y-3">
                            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                Your academic records, one login away
                            </h2>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                The AMS Portal provides secure, role-based
                                access to grades, training records,
                                certificates, and personnel information.
                                Request an account through the
                                #portal-account-request channel on Discord.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25 hover:bg-sky-700"
                            >
                                <Link href={portalHref}>
                                    Access portal
                                    <ArrowRight />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="bg-background/70 rounded-xl"
                            >
                                <a
                                    href={REQUEST_ACCOUNT}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <MessageCircle />
                                    Request account
                                </a>
                            </Button>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t">
                    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
                        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <img src={amsLogo} alt="AMS logo" className="size-10 shrink-0 object-contain" />
                                    <span className="text-base font-semibold tracking-tight">
                                        Army Medical School
                                    </span>
                                </div>
                                <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                                    Operating under the Army Medical Corps,
                                    Philippine Army. Committed to excellence in
                                    military medical education and training.
                                </p>
                            </div>
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">
                                    Navigation
                                </h4>
                                <ul className="text-muted-foreground space-y-2 text-sm">
                                    {navLinks.map((l) => (
                                        <li key={l.label}>
                                            <a
                                                href={l.href}
                                                className="hover:text-foreground transition-colors"
                                            >
                                                {l.label}
                                            </a>
                                        </li>
                                    ))}
                                    <li>
                                        <Link
                                            href={portalHref}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            AMS Portal
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-3 text-sm font-semibold">
                                    Offices
                                </h4>
                                <ul className="text-muted-foreground space-y-2 text-sm">
                                    <li>Office of the Dean</li>
                                    <li>Office of the Deputy Dean</li>
                                    <li>Head Instructor</li>
                                    <li>Head Logistics Officer</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-muted-foreground mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs">
                            <p>
                                © 2026 Army Medical School, Philippine Army,
                                Army Medical Corps
                            </p>
                            <p>Made by Kasokeeee</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}