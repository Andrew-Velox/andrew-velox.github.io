'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Mail } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';

// Order matches the sections on the home page; ids are set on those <section>s.
const LINKS = [
  { id: 'experience', label: 'Experience' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'github', label: 'GitHub' },
];

export default function SiteNavbar() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Thin reading-progress line along the very top of the screen
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.3 });

  // Scroll-spy: the section crossing the upper-middle of the viewport is "active"
  useEffect(() => {
    if (!onHome) {
      setActive(null);
      return;
    }
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY < 200) setActive(null); // back at the profile header
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [onHome]);

  return (
    <>
      <motion.div
        aria-hidden
        className="theme-flip fixed inset-x-0 top-0 z-[56] h-[2px] origin-left bg-[#e5b84b] shadow-[0_0_10px_rgba(229,184,75,0.6)]"
        style={{ scaleX: progress }}
      />

      <header className="theme-flip pointer-events-none fixed inset-x-0 top-3 z-[55] flex justify-center sm:top-4">
        {/* Same width as the profile card below (max-w-6xl + its side padding) */}
        <div className="relative w-full max-w-6xl px-2 sm:px-3">
        <motion.nav
          aria-label="Main"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className={`pointer-events-auto flex w-full items-center justify-between gap-1 rounded-full border p-1.5 backdrop-blur-xl transition-[background-color,box-shadow,border-color] duration-300 ${
            scrolled
              ? 'border-white/20 bg-black/55 shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
              : 'border-white/15 bg-black/30 shadow-[0_6px_24px_rgba(0,0,0,0.3)]'
          }`}
        >
          <Link
            href="/"
            onClick={(e) => {
              if (onHome) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            aria-label="Home"
            className="flex h-9 shrink-0 items-center rounded-full bg-white px-3.5 font-serif text-sm font-bold tracking-tight text-black transition-transform hover:scale-105"
          >
            M<span className="text-pink-500">.</span>
          </Link>

          <ul className="no-scrollbar flex min-w-0 items-center gap-0.5 overflow-x-auto px-1">
            {LINKS.map((l) => {
              const on = active === l.id;
              return (
                <li key={l.id} className="shrink-0">
                  <Link
                    href={`/#${l.id}`}
                    className={`relative block rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                      on ? 'text-white' : 'text-white/55 hover:text-white'
                    }`}
                  >
                    {on && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Link
            href="/contact"
            aria-label="Contact"
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
              pathname === '/contact'
                ? 'bg-white text-black'
                : 'border border-white/25 bg-white/5 text-white hover:bg-white/15'
            }`}
          >
            <Mail className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden sm:inline">Contact</span>
          </Link>
        </motion.nav>
        <ThemeSwitch />
        </div>
      </header>
    </>
  );
}
