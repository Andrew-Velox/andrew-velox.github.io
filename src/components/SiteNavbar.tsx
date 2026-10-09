'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Activity, Briefcase, GitMerge, Layers, LayoutGrid, Sparkles, Trophy } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';
import MusicPanel, { WaveIcon } from './MusicPlayer';

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
  const [page, setPage] = useState<0 | 1>(0); // 0 = menu, 1 = music player
  const [playing, setPlaying] = useState(false);
  const [playerOn, setPlayerOn] = useState(false); // player is created the first time its page is shown
  const [menuH, setMenuH] = useState(150);
  const [playerH, setPlayerH] = useState(400);
  const menuRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const wheelLock = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Measure both pages so the notch can animate its height to whichever one is showing
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (menuRef.current) setMenuH(menuRef.current.offsetHeight);
      if (playerRef.current) setPlayerH(playerRef.current.offsetHeight);
    });
    if (menuRef.current) ro.observe(menuRef.current);
    if (playerRef.current) ro.observe(playerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (open && page === 1) setPlayerOn(true);
  }, [open, page]);

  // Always reopen on the menu page (the player keeps playing in the background)
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => setPage(0), 350);
    return () => window.clearTimeout(t);
  }, [open]);

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
    : Math.min(small ? 224 : COLLAPSED_W, vw - 24);
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

  // Swipe (touch, pen or mouse drag) or horizontal trackpad scroll slides between the menu and the player
  const slide = (dir: 'next' | 'prev') => {
    if (!open) {
      setPage(1);
      setOpen(true);
    } else if (dir === 'next' && page === 0) setPage(1);
    else if (dir === 'prev' && page === 1) setPage(0);
  };
  const onSwipeDown = (e: React.PointerEvent) => {
    swiped.current = false;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onSwipeUp = (e: React.PointerEvent) => {
    const s0 = swipe.current;
    swipe.current = null;
    if (!s0) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      swiped.current = true; // swallow the click that follows a swipe
      slide(dx < 0 ? 'next' : 'prev');
    }
  };
  const onWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) < 24 || Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    const now = Date.now();
    if (now - wheelLock.current < 600) return;
    wheelLock.current = now;
    slide(e.deltaX > 0 ? 'next' : 'prev');
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
          <motion.nav
            aria-label="Main"
            onPointerEnter={onEnter}
            onPointerLeave={onLeave}
            onPointerDown={onSwipeDown}
            onPointerUp={onSwipeUp}
            onPointerCancel={() => (swipe.current = null)}
            onWheel={onWheel}
            onClickCapture={(e) => {
              if (swiped.current) {
                swiped.current = false;
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            className={`touch-pan-y select-none overflow-clip bg-white transition-[border-radius] duration-300 ${
              open ? 'rounded-b-[1.5rem]' : 'rounded-b-[1.0rem]'
            }`}
          >
            {/* Header: logo · identity · glanceable status (waveform + scroll ring → Contact / Menu when open) */}
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
                      key={page === 1 ? 'music' : 'identity'}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className="block"
                    >
                      <span className="block truncate text-sm font-semibold leading-tight text-black">
                        {page === 1 ? 'Music' : 'Mohabbat'}
                      </span>
                      <span className="block truncate text-xs leading-tight text-black/50">
                        {page === 1 ? (playing ? 'Now playing' : 'Spotify playlist') : 'Software Engineer'}
                      </span>
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
                    key={page === 1 ? 'menu-btn' : 'music-btn'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {page === 1 ? (
                      <button
                        type="button"
                        onClick={() => setPage(0)}
                        className="flex h-8 items-center gap-1.5 rounded-full bg-black px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black/85"
                      >
                        <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                        Menu
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPage(1)}
                        className="flex h-8 items-center gap-1.5 rounded-full bg-black px-3.5 text-xs font-semibold text-white transition-colors hover:bg-black/85"
                      >
                        <WaveIcon playing={playing} className="h-3.5 w-3.5" />
                        Music
                      </button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="status"
                    className="flex shrink-0 items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Like an iPhone live activity: the glyph bounces while music plays; tap to open the player */}
                    <button
                      type="button"
                      aria-label={playing ? 'Music playing — open player' : 'Open music player'}
                      onClick={() => {
                        setPage(1);
                        setOpen(true);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-black/80 transition-transform hover:scale-110 hover:text-black"
                    >
                      <WaveIcon playing={playing} className="h-4 w-4" />
                    </button>
                    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6 shrink-0 -rotate-90">
                      <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="2.5" />
                      <motion.circle
                        cx="12"
                        cy="12"
                        r="9"
                        fill="none"
                        stroke="#0073ff"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        style={{ pathLength: progress }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Body: two pages (menu tiles · music player) that slide sideways; height follows the visible page */}
            <motion.div
              id="notch-links"
              initial={false}
              animate={{ height: open ? (page === 1 ? playerH : menuH) + 18 : 0, opacity: open ? 1 : 0 }}
              transition={{ height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2 } }}
              className="relative overflow-clip"
            >
              {/* CSS transform (not framer): a % offset must keep tracking the notch while its width animates */}
              <div
                className="flex w-[200%] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: page === 1 ? 'translateX(-50%)' : 'translateX(0)' }}
              >
                <div className="w-1/2 shrink-0" inert={!open || page !== 0}>
                  <div ref={menuRef}>
                    {/* App-icon style tiles, like an iPhone home screen */}
                    <ul className="grid grid-cols-3 gap-1.5 px-2.5 pt-1 sm:gap-2 sm:px-3 sm:pt-1.5">
                      {LINKS.map((l) => {
                        const on = active === l.id;
                        const Icon = l.icon;
                        return (
                          <li key={l.id}>
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
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <div className="w-1/2 shrink-0" inert={!open || page !== 1}>
                  <div ref={playerRef} className="px-2.5 pt-1 sm:px-3 sm:pt-1.5">
                    <MusicPanel enabled={playerOn} onPlayingChange={setPlaying} />
                  </div>
                </div>
              </div>

              {/* Page dots */}
              <div className="absolute inset-x-0 bottom-0 flex h-[18px] items-center justify-center gap-1.5" role="tablist" aria-label="Notch pages">
                {(['Menu', 'Music'] as const).map((name, i) => (
                  <button
                    key={name}
                    type="button"
                    role="tab"
                    aria-selected={page === i}
                    aria-label={name}
                    onClick={() => setPage(i as 0 | 1)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      page === i ? 'w-4 bg-black/70' : 'w-1.5 bg-black/20 hover:bg-black/35'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.nav>
        </motion.div>
      </header>
    </>
  );
}
