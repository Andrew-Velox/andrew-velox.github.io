import { useState, useEffect } from 'react';

const FIRSTLOAD_KEY = '__loadingShown';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [hide, setHide] = useState(false);

  useEffect(() => {
    // Only show the loader on the first site load, not on View Transition swaps.
    if (sessionStorage.getItem(FIRSTLOAD_KEY) === '1') {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const FADE_MS = 350;
    const MIN_VISIBLE_MS = 700;
    const SAFETY_MS = 4000;

    const finish = () => {
      if (!mounted) return;
      setHide(true);
      window.setTimeout(() => mounted && setIsLoading(false), FADE_MS);
      sessionStorage.setItem(FIRSTLOAD_KEY, '1');
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
      style={{ background: '#000000' }}
    >
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

      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 380,
          height: 380,
          background: 'radial-gradient(circle, rgba(0, 0, 0, 0.45) 0%, rgba(139,92,246,0) 70%)',
        }}
      />

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

      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center">
        <h1
          className="text-3xl sm:text-4xl font-bold text-white tracking-wide"
          style={{
            fontFamily: 'var(--font-permanent-marker)',
            transform: 'rotate(-2deg)',
          }}
        >
          Loading the menu…
        </h1>
        <div className="mt-3 h-[2px] w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[barSlide_1.2s_ease-in-out_infinite] bg-gray-400/80" />
        </div>
      </div>
    </div>
  );
}