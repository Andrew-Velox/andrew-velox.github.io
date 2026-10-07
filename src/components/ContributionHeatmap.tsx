'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { ContributionDay, ContributionRange } from '../lib/github';

const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const CELL = 11;
const GAP = 3;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Lay days out in GitHub's grid: one column per week (Sun → Sat).
function buildWeeks(days: ContributionDay[]) {
  const weeks: (ContributionDay | null)[][] = [];
  for (const d of days) {
    const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay();
    if (weeks.length === 0 || dow === 0) weeks.push(Array(7).fill(null));
    weeks[weeks.length - 1][dow] = d;
  }
  return weeks;
}

export default function ContributionHeatmap({ user, ranges }: { user: string; ranges: ContributionRange[] }) {
  const [active, setActive] = useState(ranges[0]?.key);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const range = ranges.find((r) => r.key === active) ?? ranges[0];
  if (!range) return null;

  const weeks = buildWeeks(range.days);

  // Month label sits above the first week that starts in that month.
  let lastMonth = -1;
  const monthLabels = weeks.map((w) => {
    const first = w.find(Boolean);
    if (!first) return '';
    const m = Number(first.date.slice(5, 7)) - 1;
    if (m === lastMonth) return '';
    lastMonth = m;
    return MONTHS[m];
  });

  const heading = range.key === 'last' ? 'in the last year' : `in ${range.label}`;

  return (
    <div>
      {/* Contribution total (left) + year filter (right) */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="font-mono text-xs sm:text-sm text-white/60">
          <span className="font-semibold text-white">{range.total.toLocaleString('en-US')}</span> contributions {heading}
        </p>
        <div ref={menuRef} className="relative ml-auto">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-[8.5rem] items-center justify-between gap-3 rounded-lg border border-white/25 bg-black/30 px-4 py-2 font-mono text-sm text-white transition-colors hover:border-white/40 hover:bg-black/40"
          >
            {range.label}
            <ChevronDown
              className={`h-4 w-4 text-white/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>

          {open && (
            <ul
              role="listbox"
              aria-label="Contribution year"
              className="absolute right-0 z-30 mt-2 w-full min-w-[8.5rem] overflow-hidden rounded-lg border border-white/20 bg-[#0b0b10]/95 py-1 shadow-xl backdrop-blur-md"
            >
              {ranges.map((r) => {
                const on = r.key === range.key;
                return (
                  <li key={r.key} role="option" aria-selected={on}>
                    <button
                      type="button"
                      onClick={() => {
                        setActive(r.key);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 font-mono text-sm transition-colors hover:bg-white/10 ${
                        on ? 'text-white' : 'text-white/60'
                      }`}
                    >
                      {r.label}
                      {on && <Check className="h-3.5 w-3.5" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="w-max">
          <div
            className="grid font-mono text-[11px] text-white/50"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, ${CELL}px)`, columnGap: GAP, height: 18 }}
          >
            {monthLabels.map((m, i) => (
              <span key={i} className="overflow-visible whitespace-nowrap">
                {m}
              </span>
            ))}
          </div>
          <div
            className="grid"
            style={{
              gridAutoFlow: 'column',
              gridTemplateRows: `repeat(7, ${CELL}px)`,
              gridAutoColumns: `${CELL}px`,
              gap: GAP,
            }}
            role="img"
            aria-label={`${user}'s GitHub contribution activity ${heading}`}
          >
            {weeks.flatMap((w, wi) =>
              w.map((d, di) => (
                <span
                  key={`${range.key}-${wi}-${di}`}
                  title={d ? `${d.count} contribution${d.count === 1 ? '' : 's'} on ${d.date}` : undefined}
                  className="rounded-[2px]"
                  style={{ backgroundColor: d ? LEVEL_COLORS[d.level] : 'transparent' }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-white/10 pt-3 font-mono text-[11px] text-white/50">
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white hover:underline underline-offset-4"
        >
          @{user} ↗
        </a>
        <span className="flex items-center gap-1.5">
          Less
          {LEVEL_COLORS.map((c) => (
            <span key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
