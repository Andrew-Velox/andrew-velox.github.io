import { Star } from 'lucide-react';
import { getGithubSummary, type ContributionDay } from '../lib/github';
import ContributionHeatmap from './ContributionHeatmap';
import RecentActivity from './RecentActivity';
import PanelHeading from './PanelHeading';

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
  const { repos, stars, followers, commits, prs, prsMerged, ranges, activity } = await getGithubSummary(user);

  const streak = currentStreak(ranges.find((r) => r.key === 'last')?.days ?? []);

  const stats = [
    { label: 'Stars', value: fmt(stars), note: `across ${fmt(repos)} repositories` },
    { label: 'Followers', value: fmt(followers), note: 'on GitHub' },
    { label: 'Commits', value: fmt(commits), note: 'public, all time' },
    { label: 'Pull requests', value: fmt(prs), note: `${fmt(prsMerged)} merged` },
  ];

  return (
    <div>
      {ranges.length > 0 && <ContributionHeatmap user={user} ranges={ranges} streak={streak} />}

      <div className={`grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] ${ranges.length > 0 ? 'mt-10' : ''}`}>
        {activity.length > 0 && <RecentActivity items={activity} />}

        <div className={activity.length === 0 ? 'lg:col-span-2' : ''}>
          <PanelHeading icon={Star}>Overview</PanelHeading>
          <div className="mt-5 space-y-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-black/25 px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">{s.label}</p>
                <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
                <p className="text-[11px] text-white/40">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
