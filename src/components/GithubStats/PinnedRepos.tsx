'use client';

import { Star, GitFork, ExternalLink, BookMarked } from 'lucide-react';
import { PINNED_REPOSITORIES, type PinnedRepo } from '../../data/repos';

export type { PinnedRepo };
export { PINNED_REPOSITORIES };

export function PinnedRepos({ repos = PINNED_REPOSITORIES }: { repos?: PinnedRepo[] }) {
  return (
    <div className="w-full space-y-3.5 sm:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <BookMarked className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-400 shrink-0" />
          <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-wider text-white uppercase font-mono">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {repos.map((repo) => (
          <a
            key={repo.repo}
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex flex-col justify-between border border-white/10 bg-[#111114]/90 p-3.5 sm:p-5 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/40 hover:bg-[#111114]/95 hover:shadow-[0_0_20px_rgba(52,211,153,0.12)]"
          >
            {/* Technical corner notches */}
            <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t border-l border-emerald-400/60 transition-colors duration-300 group-hover:border-emerald-400" />
            <span className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-emerald-400/60 transition-colors duration-300 group-hover:border-emerald-400" />

            <div>
              {/* Header: Name + External Link */}
              <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] sm:text-xs text-white/50 block truncate">
                    {repo.repo.split('/')[0]} /
                  </span>
                  <h4 className="font-mono text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors truncate tracking-tight">
                    {repo.name}
                  </h4>
                </div>
                <ExternalLink
                  size={15}
                  className="shrink-0 text-white/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-emerald-400"
                />
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed mb-3 sm:mb-4 line-clamp-2">
                {repo.description}
              </p>
            </div>

            {/* Meta: Language & Stars */}
            <div className="flex items-center justify-between pt-3 sm:pt-3.5 border-t border-white/10 font-mono text-xs sm:text-sm text-white/60">
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
