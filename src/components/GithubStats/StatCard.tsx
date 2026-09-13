'use client';

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
}

export function StatCard({ icon: Icon, label, value, subtext }: StatCardProps) {
  return (
    <div className="group relative flex flex-1 min-w-0 w-full items-center gap-2.5 sm:gap-3.5 md:gap-4 border border-white/10 bg-white/[0.03] p-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4 backdrop-blur-sm transition-all duration-300 hover:border-emerald-400/40 hover:bg-white/[0.06] hover:shadow-[0_0_18px_rgba(52,211,153,0.12)]">
      {/* Cyberpunk corner notches */}
      <span className="pointer-events-none absolute -top-px -left-px h-2.5 w-2.5 border-t border-l border-emerald-400/70 transition-colors duration-300 group-hover:border-emerald-400" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-emerald-400/70 transition-colors duration-300 group-hover:border-emerald-400" />

      <div className="flex h-9 w-9 sm:h-10 sm:w-10 md:h-11 md:w-11 shrink-0 items-center justify-center rounded border border-emerald-400/25 bg-emerald-950/50 text-emerald-400 transition-colors duration-300 group-hover:border-emerald-400/60 group-hover:bg-emerald-950/70">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-[22px] md:h-[22px] transition-transform duration-300 group-hover:scale-110" />
      </div>

      <div className="flex flex-col leading-tight min-w-0 overflow-hidden">
        <span className="font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-emerald-300 truncate">
          {value}
        </span>
        <span className="text-[10px] sm:text-xs md:text-sm uppercase tracking-wider text-white/70 font-mono font-medium truncate">
          {label}
        </span>
        {subtext && (
          <span className="text-[10px] sm:text-xs text-white/50 truncate pt-0.5">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}