// Server-only GitHub summary. Runs at build time (the site is a static export),
// so visitors never wait on it and the browser never calls the GitHub API.
// If a request fails during the build, the last-known numbers below are used.

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  level: number; // 0–4
  count: number;
}

export interface ContributionRange {
  key: string; // 'last' or a year like '2025'
  label: string;
  total: number;
  days: ContributionDay[];
}

export type ActivityKind =
  | 'push' | 'pr' | 'merge' | 'star' | 'fork' | 'comment' | 'issue' | 'review' | 'create';

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  repo: string;
  text: string;
  tag: string;
  at: string; // ISO timestamp
}

export interface GithubSummary {
  repos: number;
  stars: number;
  followers: number;
  commits: number;
  prs: number;
  prsMerged: number;
  ranges: ContributionRange[];
  activity: ActivityItem[];
}

const FALLBACK: GithubSummary = {
  repos: 59,
  stars: 255,
  followers: 77,
  commits: 2073,
  prs: 54,
  prsMerged: 45,
  ranges: [],
  activity: [],
};

// In `next dev` a 24h fetch cache would keep showing yesterday's data; keep it short there.
const REVALIDATE = process.env.NODE_ENV === 'development' ? 60 : 86_400;

const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000), next: { revalidate: REVALIDATE } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Turn a raw public event into one readable line. Newer GitHub payloads no longer
// include commit messages for pushes, so those read "Pushed to <branch>".
function mapEvent(e: any): (Omit<ActivityItem, 'id'> & { key: string }) | null {
  const repo: string = e.repo?.name ?? '';
  const p = e.payload ?? {};
  const at: string = e.created_at;
  const clip = (t: string) => (t.length > 90 ? `${t.slice(0, 87)}…` : t);
  switch (e.type) {
    case 'PushEvent': {
      const branch = String(p.ref ?? '').replace('refs/heads/', '');
      return { kind: 'push', repo, text: `Pushed to ${branch}`, tag: branch, at, key: `push:${repo}:${branch}` };
    }
    case 'PullRequestEvent': {
      const pr = p.pull_request ?? {};
      const merged = p.action === 'closed' && pr.merged;
      const verb = merged ? 'Merged' : p.action === 'closed' ? 'Closed' : p.action === 'reopened' ? 'Reopened' : 'Opened';
      return { kind: merged ? 'merge' : 'pr', repo, text: `${verb} PR #${p.number}: ${clip(pr.title ?? '')}`, tag: `#${p.number}`, at, key: `pr:${repo}:${p.number}` };
    }
    case 'PullRequestReviewEvent':
    case 'PullRequestReviewCommentEvent': {
      const pr = p.pull_request ?? {};
      return { kind: 'review', repo, text: `Reviewed PR #${pr.number}: ${clip(pr.title ?? '')}`, tag: 'review', at, key: `review:${repo}:${pr.number}` };
    }
    case 'IssueCommentEvent': {
      const i = p.issue ?? {};
      return { kind: 'comment', repo, text: `Commented on #${i.number}: ${clip(i.title ?? '')}`, tag: `#${i.number}`, at, key: `comment:${repo}:${i.number}` };
    }
    case 'IssuesEvent': {
      const i = p.issue ?? {};
      return { kind: 'issue', repo, text: `${p.action === 'closed' ? 'Closed' : 'Opened'} issue #${i.number}: ${clip(i.title ?? '')}`, tag: `#${i.number}`, at, key: `issue:${repo}:${i.number}` };
    }
    case 'WatchEvent':
      return { kind: 'star', repo, text: `Starred ${repo}`, tag: 'starred', at, key: `star:${repo}` };
    case 'ForkEvent':
      return { kind: 'fork', repo, text: `Forked ${repo}`, tag: 'forked', at, key: `fork:${repo}` };
    case 'CreateEvent': {
      const what = p.ref_type === 'repository' ? 'repository' : `${p.ref_type} ${p.ref ?? ''}`.trim();
      return { kind: 'create', repo, text: `Created ${what}`, tag: p.ref_type ?? 'new', at, key: `create:${repo}:${p.ref ?? ''}` };
    }
    default:
      return null;
  }
}

// GitHub's public events feed can lag by many hours, so the newest pushes would be missing.
// Repo `pushed_at` and the commits endpoint are real-time, so recent pushes come from there
// (and carry the actual commit message).
async function getRecentPushes(user: string): Promise<ActivityItem[]> {
  const repos = await getJson<any[]>(
    `https://api.github.com/users/${user}/repos?sort=pushed&direction=desc&per_page=4&type=owner`
  );
  const items = await Promise.all(
    repos.map(async (r): Promise<ActivityItem | null> => {
      try {
        const commits = await getJson<any[]>(
          `https://api.github.com/repos/${r.full_name}/commits?per_page=1&sha=${encodeURIComponent(r.default_branch)}`
        );
        const msg = String(commits[0]?.commit?.message ?? '').split('\n')[0];
        return {
          id: `push:${r.full_name}:${commits[0]?.sha ?? r.pushed_at}`,
          kind: 'push',
          repo: r.full_name,
          text: msg ? (msg.length > 90 ? `${msg.slice(0, 87)}…` : msg) : `Pushed to ${r.default_branch}`,
          tag: r.default_branch,
          at: r.pushed_at,
        };
      } catch {
        return null;
      }
    })
  );
  return items.filter((i): i is ActivityItem => i !== null);
}

async function getActivity(user: string): Promise<ActivityItem[]> {
  const [events, pushes] = await Promise.allSettled([
    getJson<any[]>(`https://api.github.com/users/${user}/events/public?per_page=50`),
    getRecentPushes(user),
  ]);
  const pushed = pushes.status === 'fulfilled' ? pushes.value : [];
  const pushedRepos = new Set(pushed.map((p) => p.repo));

  const fromEvents: ActivityItem[] = [];
  const seen = new Set<string>();
  for (const e of events.status === 'fulfilled' ? events.value : []) {
    const m = mapEvent(e);
    if (!m || seen.has(m.key)) continue; // newest first; keep one entry per thing
    seen.add(m.key);
    // Pushes to repos we already read in real time would be stale duplicates
    if (m.kind === 'push' && pushedRepos.has(m.repo)) continue;
    const { key: _key, ...rest } = m;
    fromEvents.push({ id: String(e.id), ...rest });
  }

  return [...pushed, ...fromEvents]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);
}

async function getStars(user: string): Promise<number> {
  let total = 0;
  for (let page = 1; page <= 5; page++) {
    const repos = await getJson<{ stargazers_count: number }[]>(
      `https://api.github.com/users/${user}/repos?per_page=100&type=owner&page=${page}`
    );
    total += repos.reduce((n, r) => n + r.stargazers_count, 0);
    if (repos.length < 100) break;
  }
  return total;
}

// GitHub's own (public, unauthenticated) contributions fragment: one <td> per
// day with its level, plus a screen-reader tooltip holding the exact count.
async function getContributions(user: string, query = ''): Promise<{ total: number; days: ContributionDay[] }> {
  const res = await fetch(`https://github.com/users/${user}/contributions${query}`, {
    signal: AbortSignal.timeout(15_000),
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`contributions${query} → ${res.status}`);
  const html = await res.text();

  const counts = new Map<string, number>();
  for (const m of html.matchAll(/for="(contribution-day-component-\d+-\d+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    counts.set(m[1], /^No contributions/i.test(m[2]) ? 0 : parseInt(m[2], 10) || 0);
  }
  const days = [...html.matchAll(/<td[^>]*?data-date="(\d{4}-\d{2}-\d{2})"[^>]*?id="(contribution-day-component-\d+-\d+)"[^>]*?data-level="(\d)"/g)]
    .map((m) => ({ date: m[1], level: Number(m[3]), count: counts.get(m[2]) ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (days.length === 0) throw new Error('no contribution cells found');
  return { total: days.reduce((n, d) => n + d.count, 0), days };
}

async function getRanges(user: string, createdYear: number): Promise<ContributionRange[]> {
  const thisYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = thisYear; y >= createdYear; y--) years.push(y);

  const results = await Promise.allSettled([
    getContributions(user),
    ...years.map((y) => getContributions(user, `?from=${y}-01-01&to=${y}-12-31`)),
  ]);
  const ranges: ContributionRange[] = [];
  if (results[0].status === 'fulfilled') {
    ranges.push({ key: 'last', label: 'Last year', ...results[0].value });
  }
  years.forEach((y, i) => {
    const r = results[i + 1];
    if (r.status === 'fulfilled') ranges.push({ key: String(y), label: String(y), ...r.value });
  });
  return ranges;
}

export async function getGithubSummary(user: string): Promise<GithubSummary> {
  const [profile, stars, commits, prs, prsMerged, activity] = await Promise.allSettled([
    getJson<{ public_repos: number; followers: number; created_at: string }>(`https://api.github.com/users/${user}`),
    getStars(user),
    getJson<{ total_count: number }>(`https://api.github.com/search/commits?q=author:${user}&per_page=1`),
    getJson<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${user}+type:pr&per_page=1`),
    getJson<{ total_count: number }>(`https://api.github.com/search/issues?q=author:${user}+type:pr+is:merged&per_page=1`),
    getActivity(user),
  ]);
  const createdYear = profile.status === 'fulfilled' ? new Date(profile.value.created_at).getFullYear() : 2022;
  const ranges = await getRanges(user, createdYear).catch(() => []);
  return {
    repos: profile.status === 'fulfilled' ? profile.value.public_repos : FALLBACK.repos,
    followers: profile.status === 'fulfilled' ? profile.value.followers : FALLBACK.followers,
    stars: stars.status === 'fulfilled' ? stars.value : FALLBACK.stars,
    commits: commits.status === 'fulfilled' ? commits.value.total_count : FALLBACK.commits,
    prs: prs.status === 'fulfilled' ? prs.value.total_count : FALLBACK.prs,
    prsMerged: prsMerged.status === 'fulfilled' ? prsMerged.value.total_count : FALLBACK.prsMerged,
    ranges,
    activity: activity.status === 'fulfilled' ? activity.value : FALLBACK.activity,
  };
}
