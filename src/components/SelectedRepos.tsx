import { ArrowUpRight, GitFork, Star } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { PINNED_REPOSITORIES } from '../data/repos';
import { getRepoStats } from '../lib/github';

// Server component (no 'use client'): rendered at build time, so the numbers are fetched once per build.
export default async function SelectedRepos({ user }: { user: string }) {
  const repos = await getRepoStats(PINNED_REPOSITORIES);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">Selected repositories</h3>
        <a
          href={`https://github.com/${user}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-2 font-mono text-xs text-white/90 transition-colors hover:border-white/25 hover:bg-white/5"
        >
          <SiGithub className="h-4 w-4" aria-hidden />
          All repositories
          <ArrowUpRight className="h-3.5 w-3.5 text-white/50" aria-hidden />
        </a>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((r) => (
          <a
            key={r.repo}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 flex-col rounded-lg border border-white/10 bg-black/25 p-4 transition-colors hover:border-white/25 hover:bg-white/5"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <SiGithub className="h-4 w-4 shrink-0 text-white/70" aria-hidden />
                <span className="truncate font-mono text-sm text-white">{r.name}</span>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-white/40 transition-colors group-hover:text-white"
                aria-hidden
              />
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/60">{r.description}</p>

            <div className="mt-auto flex items-center gap-4 pt-4 font-mono text-xs text-white/50">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 shrink-0" style={{ backgroundColor: r.languageColor }} />
                {r.language}
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" aria-hidden />
                {r.stars}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" aria-hidden />
                {r.forks ?? 0}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
