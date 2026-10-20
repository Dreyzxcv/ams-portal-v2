import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';
import heroImage from '../../images/landing-page-1.png';

// Hero background. Swap the file at resources/images/landing-page-1.png anytime.
const HERO_IMAGE: string | null = heroImage;

// Add more imports here for the About slideshow.
const ABOUT_SLIDES: string[] = [heroImage];

const DISCORD = 'https://discord.gg/kvemgFZ8Xa';
const REQUEST_ACCOUNT =
    'https://discord.com/channels/1447466128006844418/1513112222757552239';

const green = '#4F7A45';
const greenDark = '#3d6635';

const stats = [
    { num: '9+', label: 'Graduating Batches' },
    { num: '4 + FE', label: 'Training Phases' },
    { num: 'AMC', label: 'Philippine Army' },
    { num: '100%', label: 'Mission Readiness' },
    { num: '24/7', label: 'Portal Access' },
];

const programs = [
    { icon: '🩺', title: 'Medical Trainee', tag: 'MT', text: 'Enlisted personnel undergoing the full AMS curriculum across four phases, assessed on medical knowledge, fieldcraft, and conduct.' },
    { icon: '📋', title: 'Medical Instructor', tag: 'MI', text: 'Officers and NCOs responsible for classroom and field instruction, facilitating phase evaluations and mentoring trainee development.' },
    { icon: '⭐', title: 'Senior Medical Instructor', tag: 'SMI', text: 'Senior faculty responsible for curriculum planning, phase design, and quality assurance across all AMS instruction.' },
    { icon: '📦', title: 'Head Logistics Officer', tag: 'HLO', text: "Oversees supply chain, administrative logistics, and resource allocation for AMS operations, coordinating with the Dean's office." },
    { icon: '🛡️', title: 'Deputy Dean of Medicine', tag: 'DDM', text: "Assists the Dean in all academic and administrative functions, acting as Officer-in-Charge in the Dean's absence." },
    { icon: '🎓', title: 'Dean of Medicine', tag: 'Dean', text: 'Highest academic authority at AMS: manages institutional policy, personnel decisions, and serves as liaison to the Surgeon General.' },
];

const aboutPoints = [
    'Structured four-phase training program covering medical doctrine, fieldcraft, and leadership.',
    'Academic oversight by the Dean of Medicine, with faculty composed of experienced Army Medical Corps officers.',
    'Formalized batch system that tracks trainee progress from enrollment through graduation.',
    'Digital AMS Portal for centralized grade management, certificate issuance, and personnel records.',
];

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <p
            className="font-tech mb-2.5 flex items-center gap-2.5 text-[10px] tracking-[0.18em] uppercase"
            style={{ color: greenDark }}
        >
            <span className="inline-block h-px w-5" style={{ background: green }} />
            {children}
        </p>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="font-display mb-3 text-[clamp(24px,3vw,36px)] leading-[1.1] font-bold tracking-[0.03em] text-[#1a1f2e] uppercase">
            {children}
        </h2>
    );
}

const btnBase =
    'font-display inline-flex items-center gap-1.5 rounded-lg px-6 py-2.5 text-[13px] font-bold tracking-[0.08em] uppercase transition-colors cursor-pointer';

export default function Welcome() {
    const { auth } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [slide, setSlide] = useState(0);

    const portalHref = auth.user ? dashboard() : login();
    const portalLabel = auth.user ? 'Go to Dashboard' : 'Access AMS Portal';

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

            <div className="min-h-screen scroll-smooth overflow-x-hidden bg-[#f0f2f5] text-[#1a1f2e]">
                {/* Topbar */}
                <div className="font-tech flex items-center justify-between border-b border-[#dde1e8] bg-white px-5 py-1.5 text-[11px] tracking-[0.06em] text-[#9aa0b4] md:px-10">
                    <span>
                        ARMY MEDICAL SCHOOL ·{' '}
                        <span style={{ color: greenDark }}>
                            ARMY MEDICAL CORPS · PHILIPPINE ARMY
                        </span>
                    </span>
                    <a href={DISCORD} target="_blank" rel="noreferrer" style={{ color: greenDark }}>
                        Discord
                    </a>
                </div>

                {/* Nav */}
                <header className="relative z-50 border-b border-[#dde1e8] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between px-5 md:px-10">
                        <Link href="/" className="flex items-center gap-3 py-3.5">
                            <div
                                className="flex size-11 items-center justify-center rounded-[10px] border border-[#dde1e8] text-white"
                                style={{ background: green }}
                            >
                                <AppLogoIcon className="size-6 fill-current" />
                            </div>
                            <div>
                                <div className="font-display text-base leading-tight font-bold tracking-[0.08em]">
                                    AMS PORTAL
                                </div>
                                <div className="font-tech text-[10px] tracking-[0.12em]" style={{ color: greenDark }}>
                                    Army Medical School
                                </div>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-0.5 md:flex">
                            {[
                                { label: 'About AMS', href: '#about' },
                                { label: 'Announcements', href: '#announcements' },
                            ].map((l) => (
                                <a
                                    key={l.label}
                                    href={l.href}
                                    className="font-display rounded-md border border-transparent px-3.5 py-2 text-[13px] font-semibold tracking-[0.08em] text-[#5a6480] uppercase transition hover:border-[#dde1e8] hover:bg-[#f5f7fa] hover:text-[#1a1f2e]"
                                >
                                    {l.label}
                                </a>
                            ))}
                            <Link
                                href={portalHref}
                                className="font-display rounded-md border px-3.5 py-2 text-[13px] font-semibold tracking-[0.08em] uppercase"
                                style={{
                                    color: greenDark,
                                    background: 'rgba(79,122,69,0.08)',
                                    borderColor: 'rgba(79,122,69,0.25)',
                                }}
                            >
                                Portal
                            </Link>
                        </nav>

                        <button
                            type="button"
                            aria-label="Toggle menu"
                            onClick={() => setMenuOpen((o) => !o)}
                            className="rounded-md p-2 hover:bg-[#f5f7fa] md:hidden"
                        >
                            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>

                    {menuOpen && (
                        <div className="flex flex-col gap-1 border-t border-[#dde1e8] bg-white px-5 pt-2 pb-4 md:hidden">
                            <a href="#about" onClick={() => setMenuOpen(false)} className="font-display py-2.5 text-sm font-semibold tracking-[0.08em] text-[#5a6480] uppercase">About AMS</a>
                            <a href="#announcements" onClick={() => setMenuOpen(false)} className="font-display py-2.5 text-sm font-semibold tracking-[0.08em] text-[#5a6480] uppercase">Announcements</a>
                            <Link href={portalHref} className="font-display py-2.5 text-sm font-semibold tracking-[0.08em] uppercase" style={{ color: greenDark }}>Portal</Link>
                        </div>
                    )}
                    <div
                        className="pointer-events-none absolute right-0 bottom-0 left-0 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${green}, transparent)` }}
                    />
                </header>

                {/* Hero */}
                <section className="relative flex min-h-[88vh] items-end overflow-hidden bg-[#0d1117]">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: HERO_IMAGE
                                ? `linear-gradient(105deg, rgba(13,17,23,0.95) 0%, rgba(13,17,23,0.75) 55%, rgba(13,17,23,0.4) 100%), url(${HERO_IMAGE})`
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />

                    <div
                        className="font-tech absolute top-4 right-4 rounded-md border bg-white/10 px-3.5 py-1.5 text-[10px] tracking-[0.1em] text-[#7dcf6e] backdrop-blur-md md:top-8 md:right-11 md:text-[11px]"
                        style={{ borderColor: green }}
                    >
                        ▶ NOW ACCEPTING: BATCH 10 APPLICANTS
                    </div>

                    <div className="relative max-w-[660px] px-7 pb-14 md:px-18 md:pb-20">
                        <p className="font-tech mb-4 flex items-center gap-2.5 text-[11px] tracking-[0.2em] text-[#7dcf6e] uppercase opacity-85">
                            <span className="inline-block h-px w-7" style={{ background: green }} />
                            Welcome to
                        </p>
                        <h1 className="font-display mb-5 text-[clamp(42px,5.5vw,70px)] leading-none font-bold tracking-[0.04em] text-[#e2e8f0] uppercase">
                            Army
                            <br />
                            <em className="not-italic text-[#7dcf6e]">Medical</em>
                            <br />
                            School
                        </h1>
                        <p className="mb-9 max-w-[500px] text-[14.5px] leading-[1.75] text-[#94a3b8]">
                            The premier military medical education institution of the Philippine Army. Committed to forming skilled, disciplined, and mission-ready Army Medical Corps personnel through rigorous training and academic excellence.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={portalHref}
                                className={`${btnBase} text-white hover:brightness-90`}
                                style={{ background: green }}
                            >
                                {portalLabel}
                            </Link>
                            <a
                                href="#announcements"
                                className={`${btnBase} border border-white/25 text-[#e2e8f0] hover:border-[#7dcf6e] hover:text-[#7dcf6e]`}
                            >
                                View Announcements
                            </a>
                        </div>
                    </div>
                </section>

                {/* Stat strip */}
                <div className="flex flex-wrap justify-around border-y border-[#dde1e8] bg-white px-3 md:px-10">
                    {stats.map((s, i) => (
                        <div key={s.label} className="relative px-5 py-5 text-center">
                            <div className="font-display text-[32px] leading-none font-bold" style={{ color: green }}>
                                {s.num}
                            </div>
                            <div className="font-tech mt-1.5 text-[10px] tracking-[0.1em] text-[#9aa0b4] uppercase">
                                {s.label}
                            </div>
                            {i < stats.length - 1 && (
                                <span className="absolute top-1/4 right-0 bottom-1/4 hidden w-px bg-[#dde1e8] md:block" />
                            )}
                        </div>
                    ))}
                </div>

                {/* About */}
                <section id="about" className="px-6 py-12 md:px-18 md:py-16">
                    <div className="grid items-center gap-14 md:grid-cols-2">
                        <div className="relative h-[360px] overflow-hidden rounded-xl border border-[#dde1e8] bg-[#0d1117]">
                            <img
                                src={ABOUT_SLIDES[slide]}
                                alt="AMS Training"
                                className="h-full w-full object-cover opacity-85"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0d1117]/30 to-transparent" />
                            <div
                                className="font-tech absolute right-0 bottom-0 left-0 border-t bg-[#0d1117]/80 px-4 py-2.5 text-[10px] tracking-[0.12em] text-[#7dcf6e] uppercase backdrop-blur-md"
                                style={{ borderColor: 'rgba(79,122,69,0.4)' }}
                            >
                                ▸ Est. Army Medical Corps · Philippine Army
                            </div>

                            {ABOUT_SLIDES.length > 1 && (
                                <>
                                    <button type="button" aria-label="Previous" onClick={() => go(slide - 1)} className="absolute top-1/2 left-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-black/45 text-white">
                                        <ChevronLeft className="size-4" />
                                    </button>
                                    <button type="button" aria-label="Next" onClick={() => go(slide + 1)} className="absolute top-1/2 right-2.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-black/45 text-white">
                                        <ChevronRight className="size-4" />
                                    </button>
                                    <div className="absolute top-3 right-3.5 flex gap-1.5">
                                        {ABOUT_SLIDES.map((_, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                aria-label={`Slide ${i + 1}`}
                                                onClick={() => go(i)}
                                                className="size-[7px] rounded-full border border-white/40"
                                                style={{ background: i === slide ? '#7dcf6e' : 'rgba(255,255,255,0.35)' }}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <Eyebrow>Who We Are</Eyebrow>
                            <SectionTitle>
                                Forged in Service,
                                <br />
                                Built for Medicine
                            </SectionTitle>
                            <p className="mb-5 max-w-[540px] text-sm leading-[1.75] text-[#5a6480]">
                                The Army Medical School operates under the Army Medical Corps of the Philippine Army, dedicated to producing highly capable medical personnel who embody the values of discipline, integrity, and service.
                            </p>
                            <ul className="flex flex-col gap-2.5">
                                {aboutPoints.map((p) => (
                                    <li key={p} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[#5a6480]">
                                        <span className="mt-[3px] text-[11px]" style={{ color: green }}>▸</span>
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Programs */}
                <section className="border-y border-[#dde1e8] bg-white px-6 py-12 md:px-18 md:py-16">
                    <Eyebrow>Our Programs</Eyebrow>
                    <SectionTitle>Training Tracks &amp; Roles</SectionTitle>
                    <p className="mb-11 max-w-[540px] text-sm leading-[1.75] text-[#5a6480]">
                        AMS trains personnel across medical instruction, logistics, and operational roles, each with defined responsibilities and a clear path to advancement.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {programs.map((p) => (
                            <div
                                key={p.tag}
                                className="rounded-xl border border-[#dde1e8] border-t-2 bg-[#f0f2f5] p-5 transition hover:bg-[#f5f7fa]"
                                style={{ borderTopColor: green }}
                            >
                                <div
                                    className="mb-3.5 flex size-[38px] items-center justify-center rounded-lg border text-lg"
                                    style={{ background: 'rgba(79,122,69,0.1)', borderColor: 'rgba(79,122,69,0.25)' }}
                                >
                                    {p.icon}
                                </div>
                                <h3 className="font-display mb-2 text-sm font-bold tracking-[0.06em] uppercase">{p.title}</h3>
                                <p className="text-[12.5px] leading-[1.65] text-[#5a6480]">{p.text}</p>
                                <span
                                    className="font-tech mt-3 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] tracking-[0.06em] uppercase"
                                    style={{ background: 'rgba(79,122,69,0.1)', color: '#2d5a25', borderColor: 'rgba(79,122,69,0.3)' }}
                                >
                                    {p.tag}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Announcements */}
                <section id="announcements" className="px-6 py-12 md:px-18 md:py-16">
                    <Eyebrow>Latest Updates</Eyebrow>
                    <SectionTitle>Announcements</SectionTitle>
                    <p className="mb-11 max-w-[540px] text-sm leading-[1.75] text-[#5a6480]">
                        Official notices, school orders, and phase updates from the Office of the Dean of Medicine.
                    </p>
                    <div className="rounded-xl border border-dashed border-amber-600 bg-[#fff3cd] p-8 text-center text-amber-800">
                        <div className="mb-2 text-3xl">🚧</div>
                        <div className="font-display text-lg font-bold tracking-[0.05em] uppercase">Coming soon</div>
                        <div className="font-tech mt-1.5 text-xs opacity-70">Announcements section: content pending</div>
                    </div>
                </section>

                {/* CTA */}
                <section className="border-y border-[#dde1e8] bg-white px-6 py-12 md:px-18 md:py-16">
                    <div className="flex flex-wrap items-center justify-between gap-10">
                        <div>
                            <Eyebrow>AMS Portal</Eyebrow>
                            <SectionTitle>
                                Your Academic Records,
                                <br />
                                One Login Away
                            </SectionTitle>
                            <p className="mt-2 max-w-[480px] text-[13.5px] leading-[1.7] text-[#5a6480]">
                                The AMS Portal provides secure, role-based access to grades, training records, certificates, and personnel information. Request an account through the #portal-account-request channel on Discord.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            <Link href={portalHref} className={`${btnBase} text-white hover:brightness-90`} style={{ background: green }}>
                                Access Portal
                            </Link>
                            <a
                                href={REQUEST_ACCOUNT}
                                target="_blank"
                                rel="noreferrer"
                                className={`${btnBase} border border-[#dde1e8] text-[#5a6480] hover:bg-[#f5f7fa] hover:text-[#1a1f2e]`}
                            >
                                Request Account
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-white px-6 pt-10 pb-6 md:px-18">
                    <div
                        className="mb-10 h-px"
                        style={{ background: `linear-gradient(90deg, transparent, ${green}, transparent)` }}
                    />
                    <div className="mb-8 grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
                        <div>
                            <div className="font-display text-[15px] font-bold tracking-[0.08em] uppercase">Army Medical School</div>
                            <p className="mt-2.5 text-xs leading-[1.7] text-[#9aa0b4]">
                                Operating under the Army Medical Corps, Philippine Army. Committed to excellence in military medical education and training.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-tech mb-3 text-[10px] tracking-[0.15em] uppercase" style={{ color: greenDark }}>Navigation</h4>
                            <ul className="flex flex-col gap-1.5 text-[12.5px] text-[#9aa0b4]">
                                <li><a href="#about" className="hover:text-[#3d6635]">About AMS</a></li>
                                <li><Link href={portalHref} className="hover:text-[#3d6635]">AMS Portal</Link></li>
                                <li><a href="#announcements" className="hover:text-[#3d6635]">Announcements</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-tech mb-3 text-[10px] tracking-[0.15em] uppercase" style={{ color: greenDark }}>Offices</h4>
                            <ul className="flex flex-col gap-1.5 text-[12.5px] text-[#9aa0b4]">
                                <li>Office of the Dean</li>
                                <li>Office of the Deputy Dean</li>
                                <li>Head Instructor</li>
                                <li>Head Logistics Officer</li>
                            </ul>
                        </div>
                    </div>
                    <div className="font-tech flex flex-wrap items-center justify-between gap-2 border-t border-[#dde1e8] pt-4 text-[10.5px] tracking-[0.04em] text-[#9aa0b4]">
                        <div>© 2026 <span style={{ color: greenDark }}>Army Medical School</span> · Philippine Army · Army Medical Corps</div>
                        <div>Made by <span style={{ color: greenDark }}>Kasokeeee</span></div>
                    </div>
                </footer>
            </div>
        </>
    );
}