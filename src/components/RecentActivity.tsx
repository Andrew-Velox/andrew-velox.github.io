'use client';

import { useEffect, useState } from 'react';
import {
  Activity,
  CircleDot,
  Eye,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitMerge,
  GitPullRequest,
  MessageSquare,
  Star,
} from 'lucide-react';
import type { ActivityItem, ActivityKind } from '../lib/github';
import PanelHeading from './PanelHeading';

const ICONS: Record<ActivityKind, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  push: GitCommitHorizontal,
  pr: GitPullRequest,
  merge: GitMerge,
  star: Star,
  fork: GitFork,
  comment: MessageSquare,
  issue: CircleDot,
  review: Eye,
  create: GitBranch,
};

function timeAgo(iso: string, now: number) {
  const s = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [secs, name] of units) {
    if (s >= secs) {
      const n = Math.floor(s / secs);
      return `${n} ${name}${n === 1 ? '' : 's'} ago`;
    }
  }
  return 'just now';
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  // "x hours ago" is computed in the browser (from the event's real timestamp), so it
  // is right at the moment of viewing. Until then, show the date to match server HTML.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  return (
    <div>
      <PanelHeading icon={Activity}>Recent Activity</PanelHeading>

      <ul className="relative mt-6 ml-4 border-l border-white/10">
        {items.map((it) => {
          const Icon = ICONS[it.kind];
          return (
            <li key={it.id} className="relative pb-7 pl-8 last:pb-0">
              <span className="absolute -left-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#0b0b10] text-white/80">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </span>

              <div className="flex flex-wrap items-baseline gap-x-2">
                <a
                  href={`https://github.com/${it.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-white hover:underline underline-offset-4"
                >
                  {it.repo}
                </a>
                <span aria-hidden className="text-white/30">·</span>
                <time dateTime={it.at} className="text-xs text-white/40">
                  {now ? timeAgo(it.at, now) : it.at.slice(0, 10)}
                </time>
              </div>
              <p className="mt-1 text-sm text-white/60">{it.text}</p>
              <span className="mt-2 block w-fit max-w-full truncate rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/70">
                {it.tag}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
