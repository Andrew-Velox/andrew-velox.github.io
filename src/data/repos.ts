// Hand-picked repositories shown in the GitHub section.

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
