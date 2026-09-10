'use client';

import { useEffect, useState } from 'react';

export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubRepoItem {
  stargazers_count?: number;
  forks_count?: number;
  name?: string;
  description?: string;
  language?: string;
  html_url?: string;
}

export interface GithubStats {
  username: string;
  repos: number;
  stars: number;
  followers: number;
  contributions: number;
  calendar: ContributionDay[];
  loading: boolean;
  error: string | null;
}

const GITHUB_USERNAME = 'Andrew-Velox';

// Reliable baseline stats for Andrew-Velox to avoid empty states or rate-limit lockouts
const BASELINE_STATS = {
  repos: 52,
  stars: 215,
  followers: 73,
  contributions: 1313,
};

function generateFallbackCalendar(): ContributionDay[] {
  const days: ContributionDay[] = [];
  const today = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      count: 0,
      level: 0,
    });
  }
  return days;
}

export function useGithubStats(username: string = GITHUB_USERNAME): GithubStats {
  const [stats, setStats] = useState<GithubStats>({
    username,
    repos: BASELINE_STATS.repos,
    stars: BASELINE_STATS.stars,
    followers: BASELINE_STATS.followers,
    contributions: BASELINE_STATS.contributions,
    calendar: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [contribSettled, userSettled, reposSettled] = await Promise.allSettled([
          fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`).then((r) =>
            r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
          ),
          fetch(`https://api.github.com/users/${username}`).then((r) =>
            r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
          ),
          fetch(`https://api.github.com/users/${username}/repos?per_page=100`).then((r) =>
            r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
          ),
        ]);

        if (cancelled) return;

        let totalContributions = BASELINE_STATS.contributions;
        let calendar: ContributionDay[] = [];

        if (contribSettled.status === 'fulfilled' && contribSettled.value) {
          const contrib = contribSettled.value;
          totalContributions =
            contrib?.total?.lastYear ??
            contrib?.total?.[Object.keys(contrib?.total ?? {})[0]] ??
            BASELINE_STATS.contributions;
          calendar = Array.isArray(contrib?.contributions) ? contrib.contributions : [];
        }

        if (calendar.length === 0) {
          calendar = generateFallbackCalendar();
        }

        let reposCount = BASELINE_STATS.repos;
        let followersCount = BASELINE_STATS.followers;
        let starsCount = BASELINE_STATS.stars;

        if (userSettled.status === 'fulfilled' && userSettled.value) {
          const user = userSettled.value;
          if (typeof user.public_repos === 'number') reposCount = user.public_repos;
          if (typeof user.followers === 'number') followersCount = user.followers;
        }

        if (reposSettled.status === 'fulfilled' && Array.isArray(reposSettled.value)) {
          const repos: GithubRepoItem[] = reposSettled.value;
          starsCount = repos.reduce((sum: number, r: GithubRepoItem) => sum + (r.stargazers_count || 0), 0);
        }

        setStats({
          username,
          repos: reposCount,
          stars: starsCount,
          followers: followersCount,
          contributions: totalContributions,
          calendar,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) {
          setStats((prev) => ({
            ...prev,
            calendar: prev.calendar.length > 0 ? prev.calendar : generateFallbackCalendar(),
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to fetch some GitHub statistics',
          }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return stats;
}