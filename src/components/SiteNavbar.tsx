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
const EAR = 20; // size of the concave "ear" corners that blend the notch into the screen edge

// The notch's concave "ear": an anti-aliased SVG quarter-circle cut-out that melts the notch into the top edge
function Ear({ side }: { side: 'left' | 'right' }) {
  const left = side === 'left';
  const o = 0.5; // overlap under the notch body to avoid a hairline seam
  const d = left
    ? `M0 0 L${EAR + o} 0 L${EAR + o} ${EAR} A${EAR} ${EAR} 0 0 0 0 0 Z`
    : `M${EAR} 0 L${-o} 0 L${-o} ${EAR} A${EAR} ${EAR} 0 0 1 ${EAR} 0 Z`;
  return (
    <svg
      aria-hidden
      width={EAR}
      height={EAR}
      viewBox={`0 0 ${EAR} ${EAR}`}
      className="absolute top-0 overflow-visible"
      style={left ? { left: -EAR } : { right: -EAR }}
    >
      <path d={d} fill="#fff" />
    </svg>
  );
}

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

  const small = vw < 640;
  const width = open
    ? Math.min(small ? 316 : EXPANDED_W, vw - 24)
    : Math.min(small ? 204 : COLLAPSED_W, vw - 24);
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
      <header className="theme-flip pointer-events-none fixed inset-x-0 top-[2px] z-[70] flex justify-center">
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
          <Ear side="left" />
          <Ear side="right" />

          {/* Hover handlers live on the notch body only — the pull-cord below it must not open it */}
          <nav
            aria-label="Main"
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            className={`overflow-hidden bg-white transition-[border-radius] duration-300 ${
              open ? 'rounded-b-[1.5rem]' : 'rounded-b-[1.0rem]'
            }`}
          >
            {/* Header: logo · identity · glanceable status (scroll ring → Contact when open) */}
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <Link
                href="/"
                onClick={(e) => {
                  if (onHome) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                aria-label="Home"
                className={`block shrink-0 overflow-hidden rounded-full ring-1 ring-black/20 transition-all duration-300 hover:scale-105 ${
                  open ? 'h-9 w-9 sm:h-10 sm:w-10' : 'h-7 w-7 sm:h-8 sm:w-8'
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
                      <span className="block truncate text-sm font-semibold leading-tight text-black">Mohabbat</span>
                      <span className="block truncate text-xs leading-tight text-black/50">Software Engineer</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block truncate text-[13px] font-medium text-black/90"
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
                        pathname === '/contact' ? 'bg-black text-white' : 'bg-black text-white hover:bg-black/85'
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
                    <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" />
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
                  <ul className="grid grid-cols-3 gap-1.5 px-2.5 pb-2.5 pt-1 sm:gap-2 sm:px-3 sm:pb-3 sm:pt-1.5">
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
                            className={`flex h-[3.4rem] flex-col items-center justify-center gap-1 rounded-xl text-[10px] sm:h-[4.25rem] sm:gap-1.5 sm:rounded-2xl sm:text-[11px] font-medium transition-colors ${
                              on
                                ? 'bg-black text-white'
                                : 'bg-black/[0.06] text-black/70 hover:bg-black/[0.12] hover:text-black'
                            }`}
                          >
                            <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" strokeWidth={1.75} aria-hidden />
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
        </motion.div>
      </header>
    </>
  );
}
