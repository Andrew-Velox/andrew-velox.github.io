'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    updateDarkMode();
    const observer = new MutationObserver(updateDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDarkMode);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateDarkMode);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/about', label: 'ABOUT' },
    { href: '/projects', label: 'PROJECTS' },
    { href: '/achievements', label: 'ACHIEVEMENTS' },
  ];

  // Punchy anime-HUD palette: bold accent, near-black/white bases —
  // deliberately higher contrast than a soft glass panel.
  const accent = '#ff2d55';
  const palette = isDarkMode
    ? { base: 'rgba(17, 17, 20, 0.9)', text: '#f2f2f2', subtext: '#8a8a8f', border: 'rgba(255,255,255,0.12)' }
    : { base: 'rgba(255, 255, 255, 0.92)', text: '#161616', subtext: '#8a8a8f', border: 'rgba(0,0,0,0.1)' };

  return (
    <div ref={navRef}>
      {/* Hamburger Menu Button — unchanged */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 right-6 z-50 p-2 transition-colors drop-shadow-lg text-white hover:text-white/70`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 rotate-45 translate-y-1.5' : 'w-6'}`}></div>
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 opacity-0' : 'w-5'}`}></div>
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 -rotate-45 -translate-y-1.5' : 'w-4'}`}></div>
        </div>
      </button>

      {/* Dropdown — angular HUD-style cards, each fully separate, sliding
          in from the right with a decisive "slam" ease and a diagonal cut
          on the trailing edge. Hover inverts to the accent color. */}
      <div className="fixed top-20 right-6 z-40 flex flex-col items-end gap-2.5">
        {navLinks.map((link, i) => {
          const isHovered = hovered === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => setHovered(link.href)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex items-stretch overflow-hidden shadow-lg"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0% 100%)',
                backgroundColor: isHovered ? accent : palette.base,
                border: `1px solid ${isHovered ? accent : palette.border}`,
                minWidth: 190,
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateX(0)' : 'translateX(40px)',
                transition: isOpen
                  ? `opacity 260ms cubic-bezier(0.16, 1, 0.3, 1), transform 320ms cubic-bezier(0.16, 1, 0.3, 1), background-color 120ms ease, border-color 120ms ease`
                  : `opacity 160ms ease-in, transform 160ms ease-in`,
                transitionDelay: isOpen ? `${i * 50}ms` : '0ms',
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
            >
              {/* Accent bar */}
              <span
                className="w-1.5 shrink-0"
                style={{ backgroundColor: isHovered ? palette.base : accent, transition: 'background-color 120ms ease' }}
              />

              <span className="flex items-center gap-3 px-4 py-3">
                <span
                  className="text-[10px] font-bold tracking-widest"
                  style={{ color: isHovered ? palette.base : accent, transition: 'color 120ms ease' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-sm font-extrabold tracking-wide italic"
                  style={{ color: isHovered ? '#ffffff' : palette.text, transition: 'color 120ms ease' }}
                >
                  {link.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}