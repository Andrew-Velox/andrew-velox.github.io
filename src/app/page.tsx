import Navbar from '../components/Navbar';
import TypingText from '../components/TypingText';
import ProfileImage from '../components/ProfileImage';
import VantaBackground from '../components/VantaBackground';

export default function Home() {
  return (
    <>
      <VantaBackground />
      <main className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-6 sm:gap-8 relative z-20 touch-none -mt-20 sm:mt-0">
        <Navbar />

        <ProfileImage
          src="/Fin2.webm"
          alt="Ken"
          className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] rounded-full object-cover border-4 border-white/30 dark:border-white/20 backdrop-blur-sm mx-auto shadow-2xl pointer-events-none"
        />

      <div className="flex flex-col gap-4 sm:gap-6 items-center text-center touch-none select-none">
        <h1
          className="text-5xl sm:text-7xl font-normal text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.4)] tracking-wide select-none"
          style={{
            fontFamily: 'var(--font-major-mono)',
            letterSpacing: '0.02em',
            transform: 'rotate(-2deg)',
          }}
        >
          Mohabbat
        </h1>
        <h2 className="text-xl sm:text-2xl font-medium text-white/90 drop-shadow-lg">
          <TypingText 
            text="Welcome To My Portfolio [>_<]" 
            speed={100}
            className="font-semibold text-white/80 drop-shadow-lg"
          />
        </h2>
        
      </div>
      
    </main>
    </>
  );
}