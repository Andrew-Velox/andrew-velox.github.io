'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FadeIn from '../../components/FadeIn';
import Carousel3D from '../../components/Carousel3D';
import ProjectModal, { type Project, type Category } from '../../components/ProjectModal';

const projects: Project[] = [
  {
      id: 1,
      title: 'AnimFetch',
      description: 'An animated system fetch you can work inside, written in Rust. The ASCII art stays pinned at the top of the terminal while your prompt and command output scroll below it. Ships with 18 animations (cats, foxes, planets, a black hole and more), runs on Linux and macOS with zero dependencies.',
      tags: ['Rust', 'CLI', 'Terminal', 'Linux', 'macOS'],
      category: 'tools',
      link: 'https://aur.archlinux.org/packages/animfetch-bin',
      github: 'https://github.com/Andrew-Velox/animfetch',
      image: '/images/projects/animfetch.png',
  },
  {
      id: 2,
      title: 'Ziex Devtools',
      description: "Ziex DevTools is a specialized browser extension built specifically for debugging applications made with the Ziex web framework for Zig. It integrates directly into your browser's developer console to give you a clear, real-time look into your application's state and performance",
      tags: ['Zig', 'Browser Extension', 'Debugging', 'Ziex Framework'],
      category: 'extension',
      link: 'https://chromewebstore.google.com/detail/efnedneccooengjfmahlnmicgkalnopj?utm_source=item-share-cb',
      github: 'https://github.com/ziex-dev/ziex/tree/main/ide/devtool',
      image: '/images/projects/ziex_devtool.png',
  },
  {
        id: 1,
        title: 'RAG Content Platform',
        description: 'An advanced backend system powered by RAG (Retrieval-Augmented Generation) technology. Features smart blog indexing with vector database for interactive Q&A, plus a private study assistant that summarizes documents. Built as a centralized API for seamless web and mobile integration.',
        tags: ['RAG', 'Vector DB', 'LLM', 'Python', 'REST API', 'AI/ML'],
        category: 'web',
        link: undefined,
        github: "https://github.com/Andrew-Velox/Mega-Project",
        image: '/images/projects/my_rag.png',
    },
    {
        id: 2,
        title: 'Meow Chat',
        description: 'A modern, Discord-inspired real-time chat application implemented with Django and WebSockets. It supports private messaging, group conversations, file sharing, and a polished dark-themed user interface. Demo credentials: user1 / demo1234.',
        tags: ['Django', 'Webhook', 'HTMX','n8n','AI APIs'],
        category: 'web',
        link: 'https://meow-chat-7qic.onrender.com/',
        github: 'https://github.com/Andrew-Velox/Meow-Chat',
        image: '/images/projects/discord_chat.png',
    },
    {
        id: 3,
        title: 'Mew Shop',
        description: 'A modern, responsive Next.js website featuring a comprehensive navigation bar, an engaging homepage, and an SEO-optimized structure prepared for integration with a Django backend API.',
        tags: ['Django', 'DRF', 'React', 'Next.js', 'Tailwind CSS'],
        category: 'web',
        link: 'https://mew-shop-eight.vercel.app/',
        github: 'https://github.com/Andrew-Velox/mew_shop',
        image: '/images/projects/shop.png',
    },
    {
        id: 4,
        title: 'CF Fetcher',
        description: 'A Chrome extension that retrieves accepted Codeforces submissions and compiles them into a ZIP archive containing rating-organized README.md files. The archive can be uploaded to a GitHub repository to document and showcase problem-solving accomplishments.',
        tags: ['Python', 'Java Script', 'HTML'],
        category: 'extension',
        link: 'https://chromewebstore.google.com/detail/cf-fetcher/pehfoogjijedipaehbibmjcajbcbimef',
        github: 'https://github.com/Andrew-Velox/Codeforces-Submission-Fetcher-Extension',
        image: '/images/projects/cf_fetcher_ext.png',
    },
    // {
    //     id: 5,
    //     title: 'Tiktok-Fullstack-Project',
    //     description: 'A full-stack TikTok clone implementing video uploads, likes, favorites, commenting, Shearing, realtime chat system and user authentication. The project incorporates prompt engineering techniques. ',
    //     tags: ['Django', 'DRF', 'React','Websocket'],
    //     category: 'web',
    //     link: 'https://tiktok-fullstack-project.vercel.app/',
    //     github: '#',
    //     image: '/images/projects/project4.png',
    // },
    {
        id: 6,
        title: 'GUCC Website AI Chatbot',
        description: 'Contributed a RAG-based AI chatbot assistant to my university computer club website. The club president can upload documents via Django admin panel, which are automatically indexed into a vector database. The chatbot intelligently answers queries based on the uploaded content.',
        tags: ['RAG', 'Django', 'Vector DB', 'LLM', 'Python',],
        category: 'web',
        link: 'https://gucc.green.edu.bd/',
        github: 'https://github.com/GreenUniversityComputerClub',
        image: '/images/projects/club_web_contribution.png',
    },
];

const filters: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'tools', label: 'Tools' },
  { value: 'extension', label: 'Extensions' },
];

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const update = () => setIsSmall(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cardW = isSmall ? 320 : 520;
  const cardH = isSmall ? 160 : 260;
  const radius = isSmall ? 380 : 620;

  const visibleProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  const { carouselImages, imageToProject } = useMemo(() => {
    const map = new Map<string, Project>();
    const images: string[] = [];
    for (const p of visibleProjects) {
      if (p.image) {
        if (!map.has(p.image)) map.set(p.image, p);
        images.push(p.image);
      }
    }
    return { carouselImages: images, imageToProject: map };
  }, [visibleProjects]);

  const openProject = useCallback(
    (carouselIndex: number) => {
      const project = imageToProject.get(carouselImages[carouselIndex]);
      if (project) setSelectedProject(project);
    },
    [carouselImages, imageToProject]
  );

  const closeProject = useCallback(() => setSelectedProject(null), []);

  return (
    <div className="h-screen relative overflow-hidden flex items-center justify-center bg-[#181818]">
      <style>{`html, body { overflow: hidden !important; }`}</style>
      <div className="container mx-auto px-4 lg:px-8 pt-1 pb-0 lg:-mt-4 lg:pb-0 max-w-[1600px] w-full relative">
        {/* Page header — sits above the window */}
        <div className="mb-4 lg:mb-6">
          <FadeIn>
            <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-1 lg:pb-2">
              <div className="flex items-start gap-5 min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="h-px w-10 bg-red-600" />
                    <span className="text-xs tracking-[0.35em] text-gray-300 font-mono uppercase">
                      Selected Works
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight">
                    Projects
                  </h1>
                </div>
              </div>

              {/* Record count */}
              <div className="relative shrink-0 hidden md:flex flex-col items-center justify-center w-[3.5rem] h-[3.5rem] border-2 border-red-600/80 text-red-500 rotate-2 select-none">
                <span className="text-xl font-bold leading-none font-mono">
                  {String(visibleProjects.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={60}>
            <div className="mt-3 lg:mt-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                {filters.map((f) => {
                  const isActive = activeFilter === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setActiveFilter(f.value)}
                      className={`group/filter relative pb-2 text-xs font-mono uppercase tracking-[0.35em] transition-colors duration-300 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white'
                      }`}
                      aria-pressed={isActive}
                    >
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

              <p className="text-[0.7rem] tracking-[0.25em] text-gray-400 font-mono uppercase hidden md:block">
                Drag · Click an image to view details
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Window — contains only the 3D carousel */}
        {carouselImages.length > 0 && (
          <FadeIn delay={120}>
            <div className="relative border border-white/15 bg-white/[0.03] overflow-hidden">
              <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40 pointer-events-none" />
              <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40 pointer-events-none" />
              <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40 pointer-events-none" />
              <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40 pointer-events-none" />

              <div className="relative w-full h-[calc(100vh-280px)] sm:h-[calc(100vh-260px)] md:h-[460px] lg:h-[580px] min-h-[300px] min-w-0 overflow-hidden">
                <Carousel3D
                  images={carouselImages}
                  cardW={cardW}
                  cardH={cardH}
                  radius={radius}
                  onCardClick={openProject}
                />
              </div>
            </div>
          </FadeIn>
        )}

        <ProjectModal project={selectedProject} onClose={closeProject} />
      </div>
    </div>
  );
}
