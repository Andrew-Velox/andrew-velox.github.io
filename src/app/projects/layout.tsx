import { Metadata } from 'next';
import Navbar from "../../components/Navbar";

export const metadata: Metadata = {
  title: 'Projects - Mohabbat',
  description: 'Explore my portfolio of projects and work.',
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
