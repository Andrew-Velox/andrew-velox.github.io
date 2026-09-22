'use client';

import { useState, useEffect } from 'react';
import PixelJellyAvatar from "../../components/PixelJellyAvatar";
import FadeIn from "../../components/FadeIn";
import GithubStatsSection from "../../components/GithubStats";
import WavyTicker from "../../components/WavyTicker";
import {
  SiRust,
  SiZig,
  SiPython,
  SiDjango,
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiDocker,
  SiPostgresql,
  SiGithub,
  SiLinux,
  SiJavascript,
} from "react-icons/si";

// Brand colors from simpleicons.org so each icon stays in its native palette.
const tickerItems = [
  { label: 'Rust',         svg: <SiRust />,         color: '#CE412B' },
  { label: 'Zig',          svg: <SiZig />,          color: '#F7A41D' },
  { label: 'Python',       svg: <SiPython />,       color: '#3776AB' },
  { label: 'Django',       svg: <SiDjango />,       color: '#44B78B' },
  { label: 'Next.js',      svg: <SiNextdotjs />,    color: '#FFFFFF' },
  { label: 'React',        svg: <SiReact />,        color: '#61DAFB' },
  { label: 'TypeScript',   svg: <SiTypescript />,   color: '#3178C6' },
  { label: 'Tailwind CSS', svg: <SiTailwindcss />,  color: '#06B6D4' },
  { label: 'Docker',       svg: <SiDocker />,       color: '#2496ED' },
  { label: 'PostgreSQL',   svg: <SiPostgresql />,   color: '#4169E1' },
  { label: 'GitHub',       svg: <SiGithub />,       color: '#FFFFFF' },
  { label: 'Linux',        svg: <SiLinux />,        color: '#FCC624' },
  { label: 'JavaScript',   svg: <SiJavascript />,   color: '#F7DF1E' },
];

// const likesSkills: string[] = [
//   'Clouds',
//   'Pixel Art',
//   'Designing',
//   'Programming',
//   'System Development',
//   'Computer Science',
//   'Computer Graphics',
//   'Game Development',
//   'Competitive Programming',
// ];

export default function About() {
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const onReplay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.path === '/about') {
        setReplayKey((k) => k + 1);
      }
    };
    window.addEventListener('replay-animations', onReplay);
    return () => window.removeEventListener('replay-animations', onReplay);
  }, []);

  return (
    <>
      <div key={replayKey} className="w-full flex flex-col items-center">
        <div className="flex flex-col items-start justify-start gap-8 sm:gap-14 mt-4 sm:mt-8 text-white w-full max-w-4xl">
      {/* Profile row: image (left) + bio (right) */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 w-full">
        {/* Interactive Pixel Avatar (drops in with jelly bounce) */}
        <div className="flex-shrink-0">
          <PixelJellyAvatar src="/images/profile/prof.png" size={180} />
        </div>

        {/* Profile text */}
        <div className="space-y-3 sm:space-y-3.5 text-center sm:text-left min-w-0 w-full">
          <FadeIn direction="left" delay={150} duration={700}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">Profile</h2>
          </FadeIn>
          <FadeIn direction="left" delay={250} duration={700}>
            <p className="text-base sm:text-lg md:text-xl text-white/95">
              <span className="font-semibold text-emerald-400">mohabbat</span>
            </p>
          </FadeIn>
          <FadeIn direction="left" delay={350} duration={700}>
            <p className="text-sm sm:text-lg md:text-xl text-white/90 leading-relaxed font-mono">
              I code something. {"[>_<]"}
            </p>
          </FadeIn>
          <FadeIn direction="left" delay={450} duration={700}>
            <p className="text-sm sm:text-base md:text-lg text-white/90 leading-relaxed pt-0.5 sm:pt-1">
              I’m Mohabbat. I’m currently pursuing my BSc in Computer Science and Engineering at{' '}
              <a
                href="https://www.green.edu.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/50 hover:decoration-emerald-400 transition-colors duration-200"
              >
                Green University of Bangladesh
              </a>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Likes & Skills */}
      {/* <section className="w-full">
        <FadeIn direction="left" delay={550} duration={700}>
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-8 bg-emerald-400/80" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Likes &amp; Skills
            </h3>
          </div>
        </FadeIn>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-base sm:text-lg text-white/90">
          {likesSkills.map((skill, i) => (
            <FadeIn key={skill} direction="left" delay={600 + i * 50} duration={600}>
              <li className="relative flex items-center gap-3 px-4 py-3 border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-emerald-400/40 hover:bg-white/[0.06] transition-all duration-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400/80 shrink-0" />
                <span className="font-medium text-white text-base sm:text-lg">{skill}</span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </section> */}

      {/* GitHub Section — Activity, Heatmap, Tech Stack & Pinned Repositories */}
        <section className="w-full">
          <GithubStatsSection />
        </section>
        </div>
      </div>

      <WavyTicker items={tickerItems} />
    </>
  );
}