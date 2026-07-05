'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    let mounted = true;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    // Hide the loader as soon as the page reports it's fully loaded,
    // with a small floor so the cat gif is visible long enough to register.
    const FADE_MS = 350;
    const MIN_VISIBLE_MS = 700;
    const SAFETY_MS = 4000; // hard cap so it can never get stuck

    const finish = () => {
      if (!mounted) return;
      setHide(true);
      // Remove from DOM after the CSS fade completes.
      window.setTimeout(() => mounted && setIsLoading(false), FADE_MS);
    };

    const start = performance.now();

    const onLoad = () => {
      const elapsed = performance.now() - start;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
      window.setTimeout(finish, remaining);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad, { once: true });
    }

    // Safety cap in case 'load' never fires (rare network/CORS edge cases).
    safetyTimer = setTimeout(finish, SAFETY_MS);

    return () => {
      mounted = false;
      if (safetyTimer) clearTimeout(safetyTimer);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
        hide ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#000000',
      }}
    >
      {/* Faint stars (CSS only, decorative) */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        {Array.from({ length: 40 }).map((_, i) => {
          const top = `${(i * 37) % 100}%`;
          const left = `${(i * 53) % 100}%`;
          const size = (i % 3) + 1;
          const delay = (i % 7) * 0.2;
          return (
            <span
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                top,
                left,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${1.4 + (i % 5) * 0.3}s`,
                opacity: 0.5 + (i % 5) * 0.1,
              }}
            />
          );
        })}
      </div>

      {/* Soft violet halo behind the cat */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 380,
          height: 380,
          background:
            'radial-gradient(circle, rgba(0, 0, 0, 0.45) 0%, rgba(139,92,246,0) 70%)',
        }}
      />

      {/* Cat */}
      <div className="relative z-10 animate-[catBounce_1.4s_ease-in-out_infinite]">
        <img
          src="/projects_img/cat_laoding.gif"
          alt="Loading cat"
          width={220}
          height={220}
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Brand + caption */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center">
        <h1
          className="text-3xl sm:text-4xl font-bold text-white tracking-wide"
          style={{
            fontFamily: 'var(--font-permanent-marker)',
            transform: 'rotate(-2deg)',
          }}
        >
          Mohabbat
        </h1>
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em]  animate-pulse">
          Loading the menu…
        </p>

        {/* Tiny progress bar */}
        <div className="mt-3 h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[barSlide_1.2s_ease-in-out_infinite] bg-gray-400/80" />
        </div>
      </div>

      <style jsx>{`
        @keyframes catBounce {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
        @keyframes barSlide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(300%);
          }
        }
      `}</style>
    </div>
  );
}
