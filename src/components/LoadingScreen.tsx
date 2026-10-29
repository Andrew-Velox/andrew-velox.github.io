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
      className={`loader fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-300 ${
        hide ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Cat (bounces straight up and down, no tilt) */}
      <div className="relative z-10 loader-cat">
        <img
          src="/images/mascots/cat_laoding.gif"
          alt="Loading cat"
          width={220}
          height={220}
          className="select-none"
          draggable={false}
        />
      </div>

      {/* Caption + progress bar, centred and level */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center">
        <h1 className="loader-text text-3xl sm:text-4xl font-bold tracking-wide">Loading the menu 🍽️</h1>
        <div className="loader-track mt-3 h-[2px] w-40 overflow-hidden rounded-full">
          <div className="loader-bar h-full w-1/3 loader-slide" />
        </div>
      </div>

    </div>
  );
}
