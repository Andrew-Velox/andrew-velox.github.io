'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import type { ContributionDay } from '../../hooks/useGithubStats';

const LEVEL_COLORS = [
  'bg-white/[0.04] border border-white/[0.04]',
  'bg-emerald-950 border border-emerald-900/60',
  'bg-emerald-800/90 border border-emerald-700/60',
  'bg-emerald-600 border border-emerald-500/70',
  'bg-emerald-400 border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.45)]',
];

const WEEKDAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function parseDateComponents(dateStr: string): { year: number; month: number; day: number; dayOfWeek: number } {
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return { year: parts[0], month: parts[1] - 1, day: parts[2], dayOfWeek: d.getDay() };
  }
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate(), dayOfWeek: d.getDay() };
}

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateStr;
}

function buildWeeks(days: ContributionDay[]) {
  if (days.length === 0) return [];
  const weeks: (ContributionDay | null)[][] = [];
  let currentWeek: (ContributionDay | null)[] = [];

  const firstDay = days[0];
  const { dayOfWeek: leadingGap } = parseDateComponents(firstDay.date);

  for (let i = 0; i < leadingGap; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

interface MonthMarker {
  colIndex: number;
  label: string;
}

function getMonthMarkers(weeks: (ContributionDay | null)[][]): MonthMarker[] {
  const markers: MonthMarker[] = [];
  let lastMonth = -1;

  weeks.forEach((week, colIdx) => {
    const realDay = week.find((d) => d !== null);
    if (!realDay) return;
    const { month } = parseDateComponents(realDay.date);
    if (month !== lastMonth) {
      const monthName = new Date(2026, month, 1).toLocaleString('en-US', { month: 'short' });
      markers.push({ colIndex: colIdx, label: monthName });
      lastMonth = month;
    }
  });

  return markers;
}

interface ContributionGraphProps {
  days: ContributionDay[];
  totalContributions?: number;
}

export function ContributionGraph({ days, totalContributions }: ContributionGraphProps) {
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const weeks = useMemo(() => buildWeeks(days), [days]);
  const monthMarkers = useMemo(() => getMonthMarkers(weeks), [weeks]);

  const activeTotal = useMemo(() => {
    if (typeof totalContributions === 'number') return totalContributions;
    return days.reduce((sum, d) => sum + (d.count || 0), 0);
  }, [days, totalContributions]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollToRight = () => {
      container.scrollLeft = container.scrollWidth;
    };

    scrollToRight();
    const timer = setTimeout(scrollToRight, 50);
    const rafId = requestAnimationFrame(scrollToRight);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
    };
  }, [weeks]);

  if (weeks.length === 0) {
    return (
      <div className="flex h-[130px] items-center justify-center text-sm text-white/40">
        No contribution data available
      </div>
    );
  }

  return (
    <div className="w-full select-none">
      {/* Header with Title and Total */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm sm:text-base font-bold tracking-wider text-white uppercase font-mono">
            Contributions Heatmap
          </span>
        </div>
        <div className="font-mono text-xs sm:text-sm text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded">
          {activeTotal.toLocaleString()} contributions in the last year
        </div>
      </div>

      {/* Contribution Calendar Grid */}
      <div ref={scrollContainerRef} className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="inline-flex flex-col min-w-[760px] gap-1.5 pt-1">
          {/* Month labels row */}
          <div className="relative h-5 mb-1 pl-8">
            {monthMarkers.map((m, i) => (
              <span
                key={i}
                className="absolute text-xs font-mono text-white/65 uppercase tracking-wider font-medium"
                style={{ left: `${m.colIndex * 15 + 32}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid with Weekday column + Day squares */}
          <div className="flex items-start gap-1.5">
            {/* Weekday indicators */}
            <div className="flex flex-col gap-1 pr-2 font-mono text-[11px] text-white/55 select-none font-medium">
              {WEEKDAYS.map((name, i) => (
                <div key={i} className="h-[12px] leading-[12px] w-6 text-right">
                  {name}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} className="h-[12px] w-[12px]" />;
                    }

                    const isHovered = hoveredDay?.date === day.date;

                    return (
                      <button
                        key={di}
                        type="button"
                        aria-label={`${day.count} contributions on ${day.date}`}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        onClick={() => setHoveredDay(day)}
                        className={`h-[12px] w-[12px] rounded-[2px] ${
                          LEVEL_COLORS[day.level]
                        } transition-all duration-200 cursor-pointer ${
                          isHovered ? 'scale-125 z-10 !border-white shadow-[0_0_8px_#34d399]' : ''
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Status bar & Legend */}
      <div className="mt-3.5 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 border-t border-white/10 font-mono text-sm">
        {/* Dynamic Hover Status with fixed height and consistent text size */}
        <div className="h-7 flex items-center min-w-0 overflow-hidden">
          {hoveredDay ? (
            <p className="text-sm font-mono text-white/90 truncate leading-none">
              <span className="text-emerald-400 font-bold">{hoveredDay.count}</span> contribution
              {hoveredDay.count === 1 ? '' : 's'} on{' '}
              <span className="text-white/80">{formatDateDisplay(hoveredDay.date)}</span>
            </p>
          ) : (
            <p className="text-sm font-mono text-white/50 truncate leading-none">
              Hover or tap on any cell to view daily activity
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-sm text-white/60 font-medium shrink-0">
          <span>Less</span>
          <div className="flex items-center gap-1">
            {LEVEL_COLORS.map((colorClass, idx) => (
              <div key={idx} className={`h-[11px] w-[11px] rounded-[2px] ${colorClass}`} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}