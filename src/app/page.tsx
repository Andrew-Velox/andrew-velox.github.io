import Navbar from '@/components/Navbar';
import TypingText from '@/components/TypingText';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center gap-6 sm:gap-8 relative z-20 touch-none -mt-20 sm:mt-0">
        <Navbar />

        <div className="flex-shrink-0 touch-none select-none">
        <Image
          src="/Kaneki_Ken.gif"
          alt="Nurul Huda (Apon)"
          width={300}
          height={300}
          className="w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] rounded-full object-cover border-4 border-white/30 dark:border-white/20 backdrop-blur-sm mx-auto shadow-2xl pointer-events-none"
          draggable={false}
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-4 sm:gap-6 items-center text-center touch-none select-none">
        <h1 className="text-4xl sm:text-6xl font-bold text-white drop-shadow-2xl">Andrew-Velox</h1>
        <h2 className="text-xl sm:text-2xl font-medium text-white/90 drop-shadow-lg">
          <TypingText 
            text="Welcome To My Portfolio [>_<]" 
            speed={100}
            className="font-semibold text-white/80 drop-shadow-lg"
          />
        </h2>
        {/* <div className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-h-[calc(100vh-20rem)] overflow-hidden">
          <div className="overflow-hidden">
            <span>A tech enthusiast, enrolling in Computer Science and Engineering at</span>
            <span className="font-semibold text-black dark:text-white"> Green University of Bangladesh</span> and
            working as a <span className="font-semibold text-black dark:text-white">Staff Engineer</span>
          </div>
        </div> */}
      </div>
      
    </main>
  );
}
