import { Star, Users, GitCommitHorizontal, Flame } from 'lucide-react';
import { getGithubSummary, type ContributionDay } from '../lib/github';
import ContributionHeatmap from './ContributionHeatmap';

const fmt = (n: number) => n.toLocaleString('en-US');

// Consecutive days with at least one contribution, ending today. Like GitHub,
// an empty "today" doesn't break the streak (the day may not be over yet).
function currentStreak(days: ContributionDay[]) {
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let streak = 0;
  for (; i >= 0 && days[i].count > 0; i--) streak++;
  return streak;
}

export default async function GithubActivity({ user }: { user: string }) {
  const { stars, followers, commits, ranges } = await getGithubSummary(user);

  const streak = currentStreak(ranges.find((r) => r.key === 'last')?.days ?? []);

  const tiles = [
    { label: 'Stars', value: fmt(stars), icon: Star },
    { label: 'Followers', value: fmt(followers), icon: Users },
    { label: 'Commits', value: fmt(commits), icon: GitCommitHorizontal },
    ...(ranges.length > 0
      ? [{ label: 'Current streak', value: `${streak} ${streak === 1 ? 'day' : 'days'}`, icon: Flame }]
      : []),
  ];

  return (
    <div>
      {ranges.length > 0 && <ContributionHeatmap user={user} ranges={ranges} />}

      <ul className={`flex flex-wrap gap-3 ${ranges.length > 0 ? 'mt-5' : ''}`}>
        {tiles.map(({ label, value, icon: Icon }) => (
          <li
            key={label}
            className="flex items-center justify-between gap-5 rounded-lg border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/30 hover:bg-black/30"
          >
            <span className="flex items-center gap-2 text-sm text-white/60">
              <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              {label}
            </span>
            <span className="font-mono text-sm sm:text-base font-semibold text-white">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
