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
} from 'react-icons/si';
import Link from 'next/link';
import ProfileCard from '../components/ProfileCard';
import GithubActivity from '../components/GithubActivity';
import ProjectsCarousel from '../components/ProjectsCarousel';
import { Download, Globe, Mail } from 'lucide-react';
import AchievementsTimeline from '../components/AchievementsTimeline';
import { projects } from '../data/projects';

const GITHUB_USER = 'Andrew-Velox';

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl sm:text-3xl font-semibold text-white">{children}</h2>
      <div className="flex-1 border-t border-dashed border-white/20" />
    </div>
  );
}

const experience = [
  {
    role: 'Software Developer (Core Contributor)',
    org: 'Ziex',
    orgNote: 'Full-stack web framework for Zig',
    url: 'https://github.com/ziex-dev/ziex',
    logo: 'https://github.com/ziex-dev.png?size=96',
    current: true,
    period: 'Jan 2026 – Present',
    location: 'Remote',
    tags: [
      { label: 'Zig', icon: <SiZig />, color: '#F7A41D' },
      { label: 'JSX' },
      { label: 'AST' },
      { label: 'DevTools' },
      { label: 'Windows' },
      { label: 'Linux', icon: <SiLinux />, color: '#FCC624' },
    ] as { label: string; icon?: React.ReactNode; color?: string }[],
    points: [
      'Spearheaded the development of a full-stack web framework, enabling declarative JSX-pattern UI components compiled to memory-safe, efficient code.',
      'Engineered custom IDE DevTools for real-time component inspection and port-based data fetching, reducing estimated debugging time by 40% for framework users.',
      'Optimized the core ‘zx’ formatter by resolving 15+ critical AST parsing bugs, ensuring 100% cross-platform consistency for Windows and Linux exports.',
    ],
  },
];

// Brand colours from simpleicons.org (same as the About page ticker).
// Only things that appear in your projects / About ticker; AI items come from your project tags.
const skillGroups: {
  title: string;
  items: { label: string; icon?: React.ReactNode; color?: string }[];
}[] = [
  {
    title: 'Languages',
    items: [
      { label: 'Rust', icon: <SiRust />, color: '#CE412B' },
      { label: 'Zig', icon: <SiZig />, color: '#F7A41D' },
      { label: 'Python', icon: <SiPython />, color: '#3776AB' },
      { label: 'TypeScript', icon: <SiTypescript />, color: '#3178C6' },
      { label: 'JavaScript', icon: <SiJavascript />, color: '#F7DF1E' },
    ],
  },
  {
    title: 'Frontend',
    items: [
      { label: 'React', icon: <SiReact />, color: '#61DAFB' },
      { label: 'Next.js', icon: <SiNextdotjs />, color: '#FFFFFF' },
      { label: 'Tailwind CSS', icon: <SiTailwindcss />, color: '#06B6D4' },
    ],
  },
  {
    title: 'Backend',
    items: [
      { label: 'Django', icon: <SiDjango />, color: '#44B78B' },
      { label: 'REST APIs' },
      { label: 'WebSockets' },
    ],
  },
  {
    title: 'Database',
    items: [
      { label: 'PostgreSQL', icon: <SiPostgresql />, color: '#4169E1' },
      { label: 'Vector DB' },
    ],
  },
  {
    title: 'AI',
    items: [{ label: 'RAG' }, { label: 'LLMs' }],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Docker', icon: <SiDocker />, color: '#2496ED' },
      { label: 'GitHub', icon: <SiGithub />, color: '#FFFFFF' },
      { label: 'Linux', icon: <SiLinux />, color: '#FCC624' },
    ],
  },
];

const contributions = [
  {
    repo: 'ziex-dev/ziex',
    url: 'https://github.com/ziex-dev/ziex',
    description:
      'Full-stack web framework for Zig. HTML syntax directly within Zig code, just like JSX but for Zig!',
    language: 'Zig',
    languageColor: '#ec915c',
    role: 'Core contributor',
  },
];

export default function NewHome() {
  return (
    <main className="self-start w-full max-w-6xl max-xl:max-w-none mx-auto px-0 xl:px-3 pt-0 pb-0 relative z-20 transition-[padding] duration-500 ease-out">
      <ProfileCard
        banner="/images/backgrounds/wing-shadow.webp"
        bannerLight="/images/backgrounds/pixel-cat.gif"
        bio="I’m Mohabbat. I’m currently pursuing my BSc in Computer Science and Engineering at Green University of Bangladesh."
      >
        <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
          {/* Served from public/ */}
          <a
            href="/Mohabbat_s_Resume_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
          >
            <Download className="h-4 w-4" aria-hidden />
            Resume / CV
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 hover:border-white/40"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Contact
          </Link>
        </div>

        <section id="experience" className="mt-8 scroll-mt-16">
          <SectionHeading>Experience</SectionHeading>
          <div className="mt-5 space-y-10">
            {experience.map((e, i) => (
              <article key={i}>
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                  <div className="flex min-w-0 items-center gap-4">
                    {/* Logo: letter tile underneath, remote avatar on top — if the image fails, the tile shows */}
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-xl font-semibold text-white ring-1 ring-white/15">
                      {e.org[0]}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={e.logo} alt="" loading="lazy" decoding="async" width={56} height={56} className="absolute inset-0 h-full w-full object-cover" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-semibold text-white">{e.org}</h3>
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${e.org} on GitHub`}
                          className="text-white/40 transition-colors hover:text-white"
                        >
                          <Globe className="h-4 w-4" aria-hidden />
                        </a>
                        {e.current && (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Working
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm sm:text-base text-white/80">{e.role}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-sm sm:text-base text-white/50">
                    <p>{e.period}</p>
                    <p className="mt-1">{e.location}</p>
                  </div>
                </div>

                <h4 className="mt-6 text-sm sm:text-base font-semibold text-white">Technologies</h4>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {e.tags.map((t) => (
                    <li
                      key={t.label}
                      className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      {t.icon && (
                        <span className="text-base" style={{ color: t.color }}>
                          {t.icon}
                        </span>
                      )}
                      {t.label}
                    </li>
                  ))}
                </ul>

                <ul className="mt-6 space-y-1 text-sm sm:text-base leading-relaxed text-white/60">
                  {e.points.map((pt, j) => (
                    <li key={j} className="flex gap-2">
                      <span aria-hidden className="text-white/40">▪</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="open-source" className="mt-8 scroll-mt-16">
          <SectionHeading>Open Source Contributions</SectionHeading>
          <div className="mt-4 divide-y divide-dotted divide-white/20">
            {contributions.map((c) => (
              <a
                key={c.repo}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block py-5 first:pt-2 last:pb-0"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="min-w-0 text-base sm:text-lg text-white group-hover:underline underline-offset-4">
                    {c.repo}
                    <span aria-hidden className="ml-2 text-white/40 transition-transform inline-block group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                  </h3>
                  <span className="shrink-0 font-mono text-xs sm:text-sm text-white/50">{c.role}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-2 font-mono text-xs text-white/60">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.languageColor }} />
                  {c.language}
                </span>
              </a>
            ))}
          </div>
        </section>

        <section id="projects" className="mt-8 scroll-mt-16">
          <SectionHeading>Projects</SectionHeading>
          <div className="mt-4">
            <ProjectsCarousel projects={projects} />
          </div>
        </section>

        <section id="skills" className="mt-8 scroll-mt-16">
          <SectionHeading>Skills</SectionHeading>
          <div className="mt-4 divide-y divide-dotted divide-white/20">
            {skillGroups.map((g) => (
              <div key={g.title} className="py-5 first:pt-2 last:pb-0 sm:flex sm:items-start sm:gap-6">
                <h3 className="mb-3 sm:mb-0 sm:w-32 sm:shrink-0 sm:pt-1.5 font-mono text-xs sm:text-sm uppercase tracking-widest text-white/50">
                  {g.title}
                </h3>
                <ul className="flex flex-wrap gap-2.5">
                  {g.items.map((it) => (
                    <li
                      key={it.label}
                      className="group flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {it.icon && (
                        <span className="text-base transition-transform group-hover:scale-110" style={{ color: it.color }}>
                          {it.icon}
                        </span>
                      )}
                      {it.label}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="achievements" className="mt-8 scroll-mt-16">
          <SectionHeading>Achievements</SectionHeading>
          <AchievementsTimeline />
        </section>

        {/* GitHub activity — numbers and the heatmap are fetched once at build
            time (static export), so visitors never wait on GitHub. */}
        <section id="github" className="mt-12 scroll-mt-16">
          <div>
            <GithubActivity user={GITHUB_USER} />
          </div>
        </section>
      </ProfileCard>
    </main>
  );
}
