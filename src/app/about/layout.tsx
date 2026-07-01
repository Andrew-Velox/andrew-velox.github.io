import { Metadata } from 'next';
import Navbar from "../../components/Navbar";

export const metadata: Metadata = {
  title: 'About - Mohabbat',
  description: 'Learn more about Mohabbat - Computer Science student',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden">
      <main className="h-full overflow-y-auto px-4 py-8 pb-24">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 z-20">
          <Navbar />
          {children}
        </div>
      </main>
    </div>
  );
}
