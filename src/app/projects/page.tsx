'use client';
import { useState } from 'react';
import Image from 'next/image';
import FadeIn from '../../components/FadeIn';

type Category = 'web' | 'tools';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  category: Category;
  link?: string;
  github?: string;
  image?: string;
}

const projects: Project[] = [
    {
        id: 1,
        title: 'RAG Content Platform',
        description: 'An advanced backend system powered by RAG (Retrieval-Augmented Generation) technology. Features smart blog indexing with vector database for interactive Q&A, plus a private study assistant that summarizes documents. Built as a centralized API for seamless web and mobile integration.',
        tags: ['RAG', 'Vector DB', 'LLM', 'Python', 'REST API', 'AI/ML'],
        category: 'web',
        link: undefined,
        github: "https://github.com/Andrew-Velox/Mega-Project",
        image: '/images/projects/project5.png',
    },
    {
        id: 2,
        title: 'Meow Chat',
        description: 'A modern, Discord-inspired real-time chat application implemented with Django and WebSockets. It supports private messaging, group conversations, file sharing, and a polished dark-themed user interface. Demo credentials: user1 / demo1234.',
        tags: ['Django', 'Webhook', 'HTMX','n8n','AI APIs'],
        category: 'web',
        link: 'https://mew-shop-eight.vercel.app/',
        github: 'https://github.com/Andrew-Velox/Meow-Chat',
        image: '/images/projects/project1.png',
    },
    {
        id: 3,
        title: 'Mew Shop',
        description: 'A modern, responsive Next.js website featuring a comprehensive navigation bar, an engaging homepage, and an SEO-optimized structure prepared for integration with a Django backend API.',
        tags: ['Django', 'DRF', 'React', 'Next.js', 'Telwind CSS'],
        category: 'web',
        link: 'https://mew-shop-eight.vercel.app/',
        github: 'https://github.com/Andrew-Velox/mew_shop',
        image: '/images/projects/project2.png',
    },
    {
        id: 4,
        title: 'CF Fetcher',
        description: 'A Chrome extension that retrieves accepted Codeforces submissions and compiles them into a ZIP archive containing rating-organized README.md files. The archive can be uploaded to a GitHub repository to document and showcase problem-solving accomplishments.',
        tags: ['Python', 'Java Script', 'HTML'],
        category: 'tools',
        link: 'https://chromewebstore.google.com/detail/cf-fetcher/pehfoogjijedipaehbibmjcajbcbimef',
        github: 'https://github.com/Andrew-Velox/Codeforces-Submission-Fetcher-Extension',
        image: '/images/projects/project3.png',
    },
    {
        id: 5,
        title: 'Tiktok-Fullstack-Project',
        description: 'A full-stack TikTok clone implementing video uploads, likes, favorites, commenting, Shearing, realtime chat system and user authentication. The project incorporates prompt engineering techniques. ',
        tags: ['Django', 'DRF', 'React','Websocket'],
        category: 'web',
        link: 'https://tiktok-fullstack-project.vercel.app/',
        github: '#',
        image: '/images/projects/project4.png',
    },
    {
        id: 6,
        title: 'GUCC Website AI Chatbot',
        description: 'Contributed a RAG-based AI chatbot assistant to my university computer club website. The club president can upload documents via Django admin panel, which are automatically indexed into a vector database. The chatbot intelligently answers queries based on the uploaded content.',
        tags: ['RAG', 'Django', 'Vector DB', 'LLM', 'Python',],
        category: 'web',
        link: undefined,
        github: 'https://github.com/GreenUniversityComputerClub',
        image: '/images/projects/club_web_contribution.png',
    },
    {
        id: 7,
        title: 'AnimFetch',
        description: 'An animated system fetch you can work inside, written in Rust. The ASCII art stays pinned at the top of the terminal while your prompt and command output scroll below it. Ships with 18 animations (cats, foxes, planets, a black hole and more), runs on Linux and macOS with zero dependencies.',
        tags: ['Rust', 'CLI', 'Terminal', 'Linux', 'macOS'],
        category: 'tools',
        link: undefined,
        github: 'https://github.com/Andrew-Velox/animfetch',
        image: '/images/projects/animfetch.png',
    },
];

// Formal kanji numerals — the style used on official documents & seals
const kanjiNumerals = ['壱', '弐', '参', '四', '伍', '六', '七', '八', '九', '拾'];

const filters: { value: 'all' | Category; label: string; kanji: string }[] = [
  { value: 'all', label: 'All', kanji: '全' },
  { value: 'web', label: 'Web', kanji: '網' },
  { value: 'tools', label: 'Tools', kanji: '具' },
];

export default function ProjectsPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');

  const visibleProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Giant watermark: 工 — "craft / engineering" */}
      <div
        className="pointer-events-none fixed -right-16 -top-10 text-[26rem] font-bold text-white/[0.025] select-none leading-none hidden lg:block"
        aria-hidden="true"
      >
        工
      </div>

      <div className="container mx-auto px-6 py-24 max-w-6xl relative">
        {/* Header */}
        <FadeIn>
          <div className="mb-20 flex items-end justify-between gap-8 border-b border-white/10 pb-10">
            <div className="flex items-start gap-5">
              <span
                className="hidden sm:block text-red-600/70 text-sm tracking-[0.6em] pt-1 select-none"
                style={{ writingMode: 'vertical-rl' }}
                aria-hidden="true"
              >
                作品集
              </span>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-px w-10 bg-red-600" />
                  <span className="text-xs tracking-[0.35em] text-gray-500 font-mono uppercase">
                    Selected Works
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                  Projects
                </h1>
              </div>
            </div>

            {/* Hanko seal — record count */}
            <div className="relative shrink-0 hidden md:flex flex-col items-center justify-center w-[4.5rem] h-[4.5rem] border-2 border-red-600/80 text-red-500 rotate-2 select-none">
              <span className="text-2xl font-bold leading-none font-mono">
                {String(visibleProjects.length).padStart(2, '0')}
              </span>
              <span className="text-[0.6rem] tracking-widest mt-1">件</span>
            </div>
          </div>
        </FadeIn>

        {/* Category filter */}
        <FadeIn delay={60}>
          <div className="mb-16 -mt-6 flex items-center gap-8">
            {filters.map((f) => {
              const isActive = activeFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setActiveFilter(f.value)}
                  className={`group/filter relative flex items-center gap-2 pb-2 text-xs font-mono uppercase tracking-[0.35em] transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                  aria-pressed={isActive}
                >
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isActive ? 'text-red-500' : 'text-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {f.kanji}
                  </span>
                  {f.label}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover/filter:w-1/3'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </FadeIn>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-20">
          {visibleProjects.map((project, i) => (
            <FadeIn key={project.id} delay={i * 80}>
              <div
                className="group relative"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Technical-drawing corner brackets */}
                <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-white/35 group-hover:border-red-600 transition-colors duration-300 z-10" />
                <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-white/35 group-hover:border-red-600 transition-colors duration-300 z-10" />

                <div className="border border-white/25 bg-white/[0.06] overflow-hidden transition-all duration-500 hover:border-white/45">
                  {/* Project Image */}
                  <div className="relative h-56 bg-[#111] overflow-hidden">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover grayscale-[10%] contrast-110 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl font-bold text-white/5 select-none">
                          {kanjiNumerals[project.id - 1] ?? project.id}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent opacity-50" />

                    {/* Hanko-style project number */}
                    <div
                      className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 border border-red-600/70 text-red-500 bg-[#181818]/70 backdrop-blur-sm text-lg font-bold select-none"
                      aria-hidden="true"
                    >
                      {kanjiNumerals[project.id - 1] ?? project.id}
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-8">
                    {/* Title */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <span className="font-mono text-xs text-red-600/80">
                        {String(project.id).padStart(2, '0')} /
                      </span>
                      <h2 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors duration-300">
                        {project.title}
                      </h2>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-[0.7rem] tracking-wide px-2.5 py-1 border border-white/25 text-gray-200 font-mono uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/15">
                      <div className="flex gap-5 items-center">
                        {project.link && (
                          <a
                            href={project.link}
                            className="text-gray-300 hover:text-red-500 transition-colors flex items-center gap-1"
                            aria-label="View Live Project"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
                            aria-label="GitHub"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                      <span className="font-mono text-[0.65rem] text-gray-600 tracking-widest select-none">
                        見る →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover effect — brush-stroke underline */}
                <div
                  className={`absolute -bottom-1 left-0 h-[3px] bg-red-600 transition-all duration-500 ease-out ${
                    hoveredId === project.id ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
