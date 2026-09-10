'use client';

import { Star, GitFork, ExternalLink, BookMarked } from 'lucide-react';

export interface PinnedRepo {
  name: string;
  repo: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks?: number;
  url: string;
}

export const PINNED_REPOSITORIES: PinnedRepo[] = [
  {
    name: 'animfetch',
    repo: 'Andrew-Velox/animfetch',
    description: 'An animated terminal system fetch you can work inside, written in Rust. Ships with 18 animations and zero dependencies.',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 150,
    forks: 7,
    url: 'https://github.com/Andrew-Velox/animfetch',
  },
  {
    name: 'ziex',
    repo: 'ziex-dev/ziex',
    description: 'Full-stack web framework for Zig. HTML syntax directly within Zig code, just like JSX but for Zig!',
    language: 'Zig',
    languageColor: '#ec915c',
    stars: 334,
    forks: 14,
    url: 'https://github.com/ziex-dev/ziex',
  },
  {
    name: 'codeforces-stats',
    repo: 'Andrew-Velox/codeforces-stats',
    description: 'Terminal-based TUI tool to track Codeforces problem solving, ratings, submissions, and contest performance.',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 25,
    forks: 3,
    url: 'https://github.com/Andrew-Velox/codeforces-stats',
  },
  {
    name: 'CF Submission Fetcher',
    repo: 'Andrew-Velox/Codeforces-Submission-Fetcher-Extension',
    description: 'Chrome extension to fetch Codeforces accepted submissions and export rating-organized READMEs for GitHub repositories.',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 20,
    forks: 2,
    url: 'https://github.com/Andrew-Velox/Codeforces-Submission-Fetcher-Extension',
  },
  {
    name: 'awesome-zig-llm',
    repo: 'Andrew-Velox/awesome-zig-llm',
    description: '⚡ Curated list of awesome Large Language Model (LLM), Machine Learning, and AI projects built with Zig.',
    language: 'Zig',
    languageColor: '#ec915c',
    stars: 13,
    forks: 1,
    url: 'https://github.com/Andrew-Velox/awesome-zig-llm',
  },
  {
    name: 'rust-user-map',
    repo: 'Andrew-Velox/rust-user-map',
    description: 'A community-driven interactive world map for Rustaceans to pin their locations and connect worldwide 🦀🗺️',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 6,
    forks: 1,
    url: 'https://github.com/Andrew-Velox/rust-user-map',
  },
];

export function PinnedRepos({ repos = PINNED_REPOSITORIES }: { repos?: PinnedRepo[] }) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <BookMarked size={18} className="text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-mono">
            Featured Repositories
          </h3>
        </div>
        <a
          href="https://github.com/Andrew-Velox?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm font-mono text-emerald-400/90 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium"
        >
          View all 52+ repos <span>↗</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repos.map((repo) => (
          <a
            key={repo.repo}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.06] hover:shadow-[0_0_20px_rgba(52,211,153,0.12)]"
          >
            {/* Technical corner notches */}
            <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t border-l border-emerald-400/60 transition-colors duration-300 group-hover:border-emerald-400" />
            <span className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-emerald-400/60 transition-colors duration-300 group-hover:border-emerald-400" />

            <div>
              {/* Header: Name + External Link */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="font-mono text-xs text-white/50 block truncate">
                    {repo.repo.split('/')[0]} /
                  </span>
                  <h4 className="font-mono text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate tracking-tight">
                    {repo.name}
                  </h4>
                </div>
                <ExternalLink
                  size={16}
                  className="shrink-0 text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400"
                />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-4 line-clamp-2">
                {repo.description}
              </p>
            </div>

            {/* Meta: Language & Stars */}
            <div className="flex items-center justify-between pt-3.5 border-t border-white/10 font-mono text-xs sm:text-sm text-white/60">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: repo.languageColor }}
                />
                <span className="text-white/90 font-medium">{repo.language}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 group-hover:text-amber-300 transition-colors">
                  <Star size={14} className="text-amber-400/80 fill-amber-400/20" />
                  <span className="font-semibold text-white/90">{repo.stars}</span>
                </span>
                {repo.forks !== undefined && repo.forks > 0 && (
                  <span className="flex items-center gap-1.5">
                    <GitFork size={14} className="text-white/40" />
                    <span>{repo.forks}</span>
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
