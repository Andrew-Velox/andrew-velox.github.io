import Navbar from '../components/Navbar';
import TypingText from '../components/TypingText';
import ProfileImage from '../components/ProfileImage';
import Link from 'next/link';
import { QuoteCard, ClockCard } from '../components/HomeWidgets';

const navTiles = [
  {
    href: '/',
    label: 'Home',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'About',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    href: '/projects',
    label: 'Projects',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    href: '/achievements',
    label: 'Achievements',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4M6.5 4h11v6.5a5.5 5.5 0 11-11 0V4zM6.5 6H4a2 2 0 100 4h2.5M17.5 6H20a2 2 0 110 4h-2.5" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <>
      <main className="w-full max-w-4xl lg:max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-8 lg:gap-24 relative z-20 touch-none -mt-20 sm:mt-0">
        {/* Hamburger nav — small screens only; desktop uses the glass tiles */}
        <div className="lg:hidden">
          <Navbar />
        </div>

        {/* Hero — stacked & centered on mobile, avatar + name side by side on
            desktop with the welcome line underneath the pair */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 lg:items-start lg:shrink-0">
          <div className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row">
            <ProfileImage
              src="/Fin2.webm"
              alt="Ken"
              className="w-[230px] h-[230px] sm:w-[300px] sm:h-[300px] lg:w-[190px] lg:h-[190px] rounded-full object-cover border-4 border-white/30 dark:border-white/20 backdrop-blur-sm mx-auto lg:mx-0 shadow-2xl pointer-events-none shrink-0"
            />

            <div className="flex flex-col items-center text-center lg:items-start lg:text-left touch-none select-none">
              {/* Mobile name — unchanged pixel style */}
              <h1
                className="lg:hidden text-3xl sm:text-5xl font-normal text-white tracking-wide select-none"
                style={{
                  fontFamily: 'var(--font-press-start)',
                  letterSpacing: '0.02em',
                }}
              >
                Mohabbat
              </h1>

              {/* Desktop name — big handwritten name with small suffix */}
              <h1
                className="hidden lg:flex items-baseline gap-2 select-none drop-shadow-lg whitespace-nowrap"
                style={{ fontFamily: 'var(--font-kalam)' }}
              >
                <span className="text-5xl xl:text-6xl text-[#eef3e8]/95 leading-none">
                  Mohabbat
                </span>
                <span className="text-lg xl:text-xl text-[#eef3e8]/80">
                  &apos;s Portfolio
                </span>
              </h1>
            </div>
          </div>

          <h2 className="text-lg sm:text-2xl lg:text-lg xl:text-xl font-medium text-white/90 drop-shadow-lg touch-none select-none">
            <TypingText
              text="Welcome To My Portfolio [>_<]"
              speed={100}
              className="font-semibold text-white/80 drop-shadow-lg"
              style={{
                fontFamily: 'var(--font-audiowide)',
              }}
            />
          </h2>
        </div>

        {/* Glass dashboard — desktop only, middle right */}
        <div className="hidden lg:flex flex-col gap-16 lg:flex-1 max-w-xl">
          {/* Quote + date/clock cards */}
          <div className="grid grid-cols-2 gap-5">
            <QuoteCard />
            <ClockCard />
          </div>

          {/* Nav tiles */}
          <nav aria-label="Main navigation" className="grid grid-cols-2 gap-5">
            {navTiles.map((tile) => (
              <Link
                key={tile.href}
                href={tile.href}
                className="group flex items-center justify-center gap-4 rounded-md bg-black/25 backdrop-blur-md px-6 py-10 shadow-lg transition-all duration-300 hover:bg-black/40 hover:-translate-y-1"
              >
                <span className="text-white/90 shrink-0 transition-transform duration-300 group-hover:scale-110">
                  {tile.icon}
                </span>
                <span className="text-white/90 font-medium tracking-wide">
                  {tile.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}
