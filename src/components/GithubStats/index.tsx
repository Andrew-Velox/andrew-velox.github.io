'use client';

import { FolderGit2, Star, Users, GitCommitHorizontal, ExternalLink } from 'lucide-react';
import { useGithubStats } from '../../hooks/useGithubStats';
import { StatCard } from './StatCard';
import { ContributionGraph } from './ContributionGraph';
import { PinnedRepos } from './PinnedRepos';
// import { LanguageStats } from './LanguageStats';
import FadeIn from '../FadeIn';

export default function GithubStatsSection() {
  const { username, repos, stars, followers, contributions, calendar, loading } = useGithubStats();

  return (
    <div className="w-full space-y-10">
      {/* Section Header */}
      <FadeIn direction="up" delay={50} duration={600}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              {/* GitHub SVG Icon */}
              <svg className="w-7 h-7 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                GitHub Activity
              </h3>
              <span className="hidden sm:inline-block font-mono text-sm text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded font-medium">
                @{username}
              </span>
            </div>
            <p className="text-sm sm:text-base text-white/70 font-mono">
              Open source telemetry, contributions &amp; repositories
            </p>
          </div>

          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center self-start sm:self-auto gap-2 border border-emerald-400/40 bg-emerald-950/40 px-4 py-2 font-mono text-xs sm:text-sm text-emerald-300 font-medium transition-all duration-300 hover:border-emerald-400 hover:bg-emerald-900/50 hover:text-white hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]"
          >
            <span>GitHub Profile</span>
            <ExternalLink size={15} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </FadeIn>

      {/* Stats Cards Row */}
      <FadeIn direction="up" delay={150} duration={600}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={FolderGit2}
            label="Repositories"
            value={loading ? '—' : repos}
          />
          <StatCard
            icon={Star}
            label="Total Stars"
            value={loading ? '—' : `${stars}+`}
          />
          <StatCard
            icon={Users}
            label="Followers"
            value={loading ? '—' : followers}
          />
          <StatCard
            icon={GitCommitHorizontal}
            label="Year Commits"
            value={loading ? '—' : `${contributions.toLocaleString()}+`}
          />
        </div>
      </FadeIn>

      {/* Contribution Calendar Graph */}
      <FadeIn direction="up" delay={250} duration={600}>
        <div className="relative border border-white/10 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-sm">
          {/* Cyberpunk corner notches */}
          <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t-2 border-l-2 border-emerald-400/70" />
          <span className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b-2 border-r-2 border-emerald-400/70" />

          {loading && calendar.length === 0 ? (
            <div className="flex h-[140px] items-center justify-center font-mono text-xs text-white/40">
              <span className="inline-block animate-spin mr-2">⟳</span> Fetching contribution calendar…
            </div>
          ) : (
            <ContributionGraph days={calendar} totalContributions={contributions} />
          )}
        </div>
      </FadeIn>

      {/* Language Breakdown */}
      {/* <FadeIn direction="up" delay={320} duration={600}>
        <LanguageStats />
      </FadeIn> */}

      {/* Featured Repositories Grid */}
      <FadeIn direction="up" delay={400} duration={600}>
        <PinnedRepos />
      </FadeIn>
    </div>
  );
}