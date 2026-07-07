import Navbar from '../../components/Navbar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Achievements - Mohabbat',
  description: 'Explore my portfolio of Achievements and work.',
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-r text-white">

      <main className="min-h-screen px-2 sm:px-4 py-8 pb-24">
        <div className="w-full flex flex-col gap-6 sm:gap-8 relative z-20">
          <Navbar />
          {children}
        </div>
      </main>
    </div>
  );
}
