'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Activity, Briefcase, GitMerge, Layers, Mail, Sparkles, Trophy } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';

// Order matches the sections on the home page; ids are set on those <section>s.
const LINKS = [
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'open-source', label: 'Open Source', icon: GitMerge },
  { id: 'projects', label: 'Projects', icon: Layers },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'github', label: 'GitHub', icon: Activity },
];

const COLLAPSED_W = 232;
const EXPANDED_W = 392;
const EDGE = 'rgba(255,255,255,0.3)'; // outline colour around the notch
const EAR = 16; // size of the concave "ear" corners that blend the notch into the screen edge

// The notch's rounded-off edge, drawn as a quarter-circle cut-out
const ear = (side: 'left' | 'right') => ({
  width: EAR,
  height: EAR,
  // transparent page → 1px outline → black fill, so the outline follows the curve on the outside
  background: `radial-gradient(circle at ${side === 'left' ? '0' : '100%'} 100%, transparent ${EAR - 1.5}px, ${EDGE} ${EAR - 1}px, ${EDGE} ${EAR}px, #000 ${EAR + 0.01}px)`,
});

export default function SiteNavbar() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // expanded notch
  const [vw, setVw] = useState(1024);
  const boxRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Close on route change, Escape, or a tap outside
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Scroll progress (0–1), drawn as the ring in the collapsed notch
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  // Scroll-spy: the active section is the last one whose top has scrolled up past the navbar line.
  // (An observer band in the middle of the screen picks the *next* section when you jump to a
  // short one like Open Source, because that section sits at the top and the next one is mid-screen.)
  useEffect(() => {
    if (!onHome) {
      setActive(null);
      return;
    }
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const LINE = 110; // px from the top: scroll-mt (64px) plus some slack
    let frame = 0;
    const update = () => {
      frame = 0;
      if (window.scrollY < 200) return setActive(null); // back at the profile header
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current: string | null = null;
      for (const el of els) if (el.getBoundingClientRect().top <= LINE) current = el.id;
      setActive(atBottom ? els[els.length - 1]?.id ?? current : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [onHome]);

  const width = open ? Math.min(EXPANDED_W, vw - 16) : Math.min(COLLAPSED_W, vw - 16);
  const label = pathname === '/contact' ? 'Contact' : LINKS.find((l) => l.id === active)?.label ?? 'Mohabbat';

  // Mouse: expand on hover (with a short grace period). Touch/pen: expand on tap of the label.
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    setOpen(true);
  };
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    leaveTimer.current = window.setTimeout(() => setOpen(false), 180);
  };

  return (
    <>
      <header className="theme-flip pointer-events-none fixed inset-x-0 top-0 z-[55] flex justify-center">
        {/* Theme pull-cord: hangs from the top-right corner of the screen (before the notch, so an open notch overlaps it) */}
        <ThemeSwitch />

        <motion.div
          ref={boxRef}
          initial={{ y: -60, opacity: 0, width: COLLAPSED_W }}
          animate={{ y: 0, opacity: 1, width }}
          transition={{
            y: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
            opacity: { duration: 0.4, delay: 0.2 },
            width: { type: 'spring', stiffness: 320, damping: 30 },
          }}
          className="pointer-events-auto relative"
        >
          {/* Concave ears that melt the notch into the top edge of the screen */}
          <span aria-hidden className="absolute top-0" style={{ ...ear('left'), left: -EAR }} />
          <span aria-hidden className="absolute top-0" style={{ ...ear('right'), right: -EAR }} />

          {/* Hover handlers live on the notch body only — the pull-cord below it must not open it */}
          <nav
            aria-label="Main"
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            className={`overflow-hidden bg-black shadow-[0_14px_44px_rgba(0,0,0,0.55)] transition-[border-radius] duration-300 ${
              open ? 'rounded-b-[2rem]' : 'rounded-b-[1.4rem]'
            }`}
          >
            {/* Header: logo · identity · glanceable status (scroll ring → Contact when open) */}
            <div className="flex items-center gap-2.5 px-3 py-2">
              <Link
                href="/"
                onClick={(e) => {
                  if (onHome) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                aria-label="Home"
                className={`block shrink-0 overflow-hidden rounded-full ring-1 ring-white/25 transition-all duration-300 hover:scale-105 ${
                  open ? 'h-10 w-10' : 'h-8 w-8'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/profile/prof.png" alt="Mohabbat" width={40} height={40} className="h-full w-full object-cover" draggable={false} />
              </Link>

              <button
                type="button"
                aria-expanded={open}
                aria-controls="notch-links"
                onClick={() => setOpen((o) => !o)}
                className="min-w-0 flex-1 text-left"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.span
                      key="identity"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <span className="block truncate text-sm font-semibold leading-tight text-white">Mohabbat</span>
                      <span className="block truncate text-xs leading-tight text-white/50">Software Engineer</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block truncate text-[13px] font-medium text-white/90"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div
                    key="contact"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Link
                      href="/contact"
                      onClick={() => setOpen(false)}
                      className={`flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                        pathname === '/contact' ? 'bg-white text-black' : 'bg-white text-black hover:bg-white/85'
                      }`}
                    >
                      <Mail className="h-3.5 w-3.5" aria-hidden />
                      Contact
                    </Link>
                  </motion.div>
                ) : (
                  <motion.svg
                    key="ring"
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-6 w-6 shrink-0 -rotate-90"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
                    <motion.circle
                      cx="12"
                      cy="12"
                      r="9"
                      fill="none"
                      stroke="#e5b84b"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ pathLength: progress }}
                    />
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>

            {/* Expanded: app-icon style tiles, like an iPhone home screen */}
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id="notch-links"
                  key="links"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ul className="grid grid-cols-3 gap-2 px-3 pb-3 pt-1.5">
                    {LINKS.map((l, i) => {
                      const on = active === l.id;
                      const Icon = l.icon;
                      return (
                        <motion.li
                          key={l.id}
                          initial={{ opacity: 0, y: 10, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.04 + i * 0.035, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <Link
                            href={`/#${l.id}`}
                            onClick={() => setOpen(false)}
                            className={`flex h-[4.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl text-[11px] font-medium transition-colors ${
                              on
                                ? 'bg-white text-black'
                                : 'bg-white/[0.08] text-white/75 hover:bg-white/[0.16] hover:text-white'
                            }`}
                          >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                            {l.label}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Outline drawn OUTSIDE the black shape (a ring, not an inner border), so it follows the
              curves cleanly. The top 16px are clipped away so it starts exactly where the ears end. */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.3)] transition-[border-radius] duration-300 ${
              open ? 'rounded-b-[2rem]' : 'rounded-b-[1.4rem]'
            }`}
            style={{ clipPath: `inset(${EAR}px -2px -2px -2px)` }}
          />
        </motion.div>
      </header>
    </>
  );
}
