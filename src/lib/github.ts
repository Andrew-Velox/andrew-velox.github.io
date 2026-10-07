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

export interface GithubSummary {
  repos: number;
  stars: number;
  followers: number;
  commits: number;
  ranges: ContributionRange[];
}

const FALLBACK: GithubSummary = {
  repos: 59,
  stars: 255,
  followers: 77,
  commits: 2073,
  ranges: [],
};

const headers: HeadersInit = {
  Accept: 'application/vnd.github+json',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000), next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json() as Promise<T>;
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
    next: { revalidate: 86_400 },
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
  const [profile, stars, commits] = await Promise.allSettled([
    getJson<{ public_repos: number; followers: number; created_at: string }>(`https://api.github.com/users/${user}`),
    getStars(user),
    getJson<{ total_count: number }>(`https://api.github.com/search/commits?q=author:${user}&per_page=1`),
  ]);
  const createdYear = profile.status === 'fulfilled' ? new Date(profile.value.created_at).getFullYear() : 2022;
  const ranges = await getRanges(user, createdYear).catch(() => []);
  return {
    repos: profile.status === 'fulfilled' ? profile.value.public_repos : FALLBACK.repos,
    followers: profile.status === 'fulfilled' ? profile.value.followers : FALLBACK.followers,
    stars: stars.status === 'fulfilled' ? stars.value : FALLBACK.stars,
    commits: commits.status === 'fulfilled' ? commits.value.total_count : FALLBACK.commits,
    ranges,
  };
}
