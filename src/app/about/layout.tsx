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
    <>
      <Navbar />
      <main className="w-full px-3 xs:px-4 sm:px-6 py-6 sm:py-8 pb-20 sm:pb-24 overflow-x-hidden">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8 relative z-20">
          {children}
        </div>
      </main>
    </>
  );
}
