'use client';
import { useState } from 'react';
import Image from 'next/image';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
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
        link: undefined,
        github: "https://github.com/Andrew-Velox/Mega-Project",
        image: '/projects_img/project5.png',
    },
    {
        id: 2,
        title: 'Meow Chat',
        description: 'A modern, Discord-inspired real-time chat application implemented with Django and WebSockets. It supports private messaging, group conversations, file sharing, and a polished dark-themed user interface. Demo credentials: user1 / demo1234.',
        tags: ['Django', 'Webhook', 'HTMX','n8n','AI APIs'],
        link: 'https://mew-shop-eight.vercel.app/',
        github: 'https://github.com/Andrew-Velox/Meow-Chat',
        image: '/projects_img/project1.png',
    },
    {
        id: 3,
        title: 'Mew Shop',
        description: 'A modern, responsive Next.js website featuring a comprehensive navigation bar, an engaging homepage, and an SEO-optimized structure prepared for integration with a Django backend API.',
        tags: ['Django', 'DRF', 'React', 'Next.js', 'Telwind CSS'],
        link: 'https://mew-shop-eight.vercel.app/',
        github: 'https://github.com/Andrew-Velox/mew_shop',
        image: '/projects_img/project2.png',
    },
    {
        id: 4,
        title: 'CF Fetcher',
        description: 'A Chrome extension that retrieves accepted Codeforces submissions and compiles them into a ZIP archive containing rating-organized README.md files. The archive can be uploaded to a GitHub repository to document and showcase problem-solving accomplishments.',
        tags: ['Python', 'Java Script', 'HTML'],
        link: 'https://chromewebstore.google.com/detail/cf-fetcher/pehfoogjijedipaehbibmjcajbcbimef',
        github: 'https://github.com/Andrew-Velox/Codeforces-Submission-Fetcher-Extension',
        image: '/projects_img/project3.png',
    },
    {
        id: 5,
        title: 'Tiktok-Fullstack-Project',
        description: 'A full-stack TikTok clone implementing video uploads, likes, favorites, commenting, Shearing, realtime chat system and user authentication. The project incorporates prompt engineering techniques. ',
        tags: ['Django', 'DRF', 'React','Websocket'],
        link: 'https://tiktok-fullstack-project.vercel.app/',
        github: '#',
        image: '/projects_img/project4.png',
    },
    {
        id: 6,
        title: 'GUCC Website AI Chatbot',
        description: 'Contributed a RAG-based AI chatbot assistant to my university computer club website. The club president can upload documents via Django admin panel, which are automatically indexed into a vector database. The chatbot intelligently answers queries based on the uploaded content.',
        tags: ['RAG', 'Django', 'Vector DB', 'LLM', 'Python',],
        link: undefined,
        github: 'https://github.com/GreenUniversityComputerClub',
        image: '/projects_img/club_web_contribution.png',
    },
];

export default function ProjectsPage() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-20 max-w-6xl">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Some of my recent work
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg">
                {/* Project Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 overflow-hidden">
                  {project.image ? (
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-gray-300 dark:text-gray-700">
                        0{project.id}
                      </span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Project Content */}
                <div className="p-8">
                  {/* Project Number */}
                  {/* <div className="text-sm font-mono text-gray-400 dark:text-gray-600 mb-4">
                    0{project.id}
                  </div> */}

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h2>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex gap-4 items-center">
                    {project.link && (
                      <a
                        href={project.link}
                        className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                        aria-label="View Live Project"
                      >
                        <svg
                          className="w-6 h-6"
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
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1"
                        aria-label="GitHub"
                      >
                        <svg
                          className="w-6 h-6"
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
                </div>
              </div>

              {/* Hover Effect Line */}
              <div
                className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ${
                  hoveredId === project.id ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
