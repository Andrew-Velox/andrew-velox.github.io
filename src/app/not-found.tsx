import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#000000' }}
    >
      {/* Faint stars (matches LoadingScreen) */}
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

      {/* Soft violet halo behind the cat (matches LoadingScreen) */}
      <div
        className="pointer-events-none absolute rounded-full blur-3xl"
        style={{
          width: 380,
          height: 380,
          background:
            'radial-gradient(circle, rgba(0, 0, 0, 0.45) 0%, rgba(139,92,246,0) 70%)',
        }}
      />

      {/* Big 404 mark + cat — visually echoes the loading screen */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-[catBounce_1.4s_ease-in-out_infinite]">
          <img
            src="/projects_img/cat_laoding.gif"
            alt="404 cat"
            width={220}
            height={220}
            className="select-none"
            draggable={false}
          />
        </div>

        <h1
          className="mt-2 text-6xl sm:text-7xl font-bold text-white tracking-wide"
          style={{
            fontFamily: 'var(--font-permanent-marker)',
            transform: 'rotate(-2deg)',
            // textShadow: '0 4px 24px rgba(139,92,246,0.45)',
          }}
        >
          404
        </h1>
      </div>

      {/* Brand + caption */}
      <div className="relative z-10 mt-6 flex flex-col items-center gap-2 text-center px-6">
        
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-white/70 animate-pulse">
          Page Not Found
        </p>
        <p className="mt-1 max-w-md text-sm text-white/50">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Go Home button styled like the loading-screen progress bar */}
        <Link
          href="/"
          className="mt-5 inline-block px-6 py-2 rounded-full bg-white/10 hover:bg-white/20
                     border border-white/20 hover:border-white/40 text-white text-sm
                     font-medium uppercase tracking-[0.25em] transition-all duration-300
                     hover:scale-105 active:scale-95"
        >
          Go Home
        </Link>
      </div>

      <style>{`
        @keyframes catBounce {
          0%,
          100% {
            transform: translateY(0) rotate(-1deg);
          }
          50% {
            transform: translateY(-10px) rotate(1deg);
          }
        }
      `}</style>
    </div>
  );
}
