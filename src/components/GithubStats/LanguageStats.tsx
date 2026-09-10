'use client';

import { Code2 } from 'lucide-react';

export interface LanguageStat {
  name: string;
  percentage: number;
  color: string;
}

export const DEFAULT_LANGUAGES: LanguageStat[] = [
  { name: 'Rust', percentage: 42, color: '#dea584' },
  { name: 'Zig', percentage: 26, color: '#ec915c' },
  { name: 'Python', percentage: 18, color: '#3572A5' },
  { name: 'JavaScript / TS', percentage: 10, color: '#f1e05a' },
  { name: 'Other', percentage: 4, color: '#6e7681' },
];

export function LanguageStats({ languages = DEFAULT_LANGUAGES }: { languages?: LanguageStat[] }) {
  return (
    <div className="relative border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm space-y-3.5">
      {/* Technical corner notches */}
      <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t border-l border-emerald-400/60" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-emerald-400/60" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Code2 size={18} className="text-emerald-400" />
          <h4 className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-mono">
            Language Distribution
          </h4>
        </div>
        <span className="text-xs font-mono text-white/50 uppercase font-medium">Top Tech Stack</span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="flex h-3.5 w-full overflow-hidden rounded-[3px] bg-white/[0.05] p-[2px] gap-[2px]">
        {languages.map((lang) => (
          <div
            key={lang.name}
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: lang.color,
            }}
            title={`${lang.name}: ${lang.percentage}%`}
            className="h-full rounded-[2px] transition-all duration-500 hover:brightness-125 cursor-pointer"
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 font-mono text-xs sm:text-sm">
        {languages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-white/90 font-medium">{lang.name}</span>
            <span className="text-white/50 text-xs">{lang.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
