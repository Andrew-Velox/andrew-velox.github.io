'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import type { ContributionDay, ContributionRange } from '../lib/github';

const LEVEL_COLORS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const CELL = 11;
const GAP = 3;
const LONG_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// GitHub's tooltip wording: "3 contributions on June 22nd." / "No contributions on …"
function tooltipText(d: ContributionDay) {
  const day = Number(d.date.slice(8, 10));
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const when = `${LONG_MONTHS[Number(d.date.slice(5, 7)) - 1]} ${day}${suffix}`;
  const what = d.count === 0 ? 'No contributions' : `${d.count} contribution${d.count === 1 ? '' : 's'}`;
  return `${what} on ${when}.`;
}

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

export default function ContributionHeatmap({
  user,
  ranges,
  streak,
}: {
  user: string;
  ranges: ContributionRange[];
  streak: number;
}) {
  const [active, setActive] = useState(ranges[0]?.key);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Fixed-position tooltip (the grid scrolls horizontally on mobile, which would clip an absolute one)
  const showTip = (e: React.PointerEvent | React.MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
    if (!el) return setTip(null);
    const r = el.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top, text: el.dataset.tip! });
  };

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

  const period = range.key === 'last' ? 'the last year' : range.label;

  return (
    <div>
      {/* Header: eyebrow, title + subtitle on the left, TOTAL | STREAK on the right */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div>
          <p className="flex items-center gap-3 font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-white/70">
            <span aria-hidden className="h-px w-10 bg-white/40" />
            Activity
          </p>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">Github Activity</h2>
          <p className="mt-3 text-sm sm:text-base text-white/50">
            My contributions {range.key === 'last' ? 'over the last year' : `in ${range.label}`}.
          </p>
        </div>

        <div className="flex items-center divide-x divide-white/15">
          <div className="px-5 text-center first:pl-0 last:pr-0">
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{range.total.toLocaleString('en-US')}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Total</p>
          </div>
          <div className="px-5 text-center first:pl-0 last:pr-0">
            <p className="text-2xl sm:text-3xl font-bold leading-none text-white">{streak}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">Streak</p>
          </div>
        </div>
      </div>

      {/* Heatmap card */}
      <div className="mt-8 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6">
        <div className="flex justify-end">
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="flex min-w-[7.5rem] items-center justify-between gap-3 rounded-lg border border-white/25 bg-black/30 px-3 py-1.5 font-mono text-xs text-white transition-colors hover:border-white/40 hover:bg-black/40"
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
                className="absolute right-0 z-30 mt-2 w-full min-w-[7.5rem] overflow-hidden rounded-lg border border-white/20 bg-[#0b0b10]/95 py-1 shadow-xl backdrop-blur-md"
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
                        className={`flex w-full items-center justify-between gap-3 px-3 py-1.5 font-mono text-xs transition-colors hover:bg-white/10 ${
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

      <div className="mt-2 overflow-x-auto pb-2" onScroll={() => setTip(null)}>
        <div className="w-max">
          <div
            className="grid font-mono text-xs text-white/70"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, ${CELL}px)`, columnGap: GAP, height: 22 }}
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
            onPointerOver={showTip}
            onPointerLeave={() => setTip(null)}
            onClick={showTip}
            aria-label={`${user}'s GitHub contribution activity ${heading}`}
          >
            {weeks.flatMap((w, wi) =>
              w.map((d, di) => (
                <span
                  key={`${range.key}-${wi}-${di}`}
                  data-tip={d ? tooltipText(d) : undefined}
                  className="rounded-[2px]"
                  style={{ backgroundColor: d ? LEVEL_COLORS[d.level] : 'transparent' }}
                />
              ))
            )}
          </div>
        </div>
      </div>


        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-white/60">
          <span>{range.total.toLocaleString('en-US')} activities in {period}</span>
          <span className="flex items-center gap-1.5">
            Less
            {LEVEL_COLORS.map((c) => (
              <span key={c} className="h-[10px] w-[10px] rounded-[2px]" style={{ backgroundColor: c }} />
            ))}
            More
          </span>
        </div>
      </div>

      {tip &&
        createPortal(
        <div
          role="tooltip"
          className="theme-flip pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-[#1c2128] px-2.5 py-1.5 text-xs text-white shadow-lg ring-1 ring-white/10"
          style={{ left: tip.x, top: tip.y - 8 }}
        >
          {tip.text}
          <span aria-hidden className="absolute left-1/2 top-full -ml-1 h-2 w-2 -translate-y-1 rotate-45 bg-[#1c2128]" />
        </div>,
        // Portal to <body>: an ancestor's backdrop-filter would otherwise become the
        // containing block for `position: fixed` and offset the tooltip.
        document.body
      )}
    </div>
  );
}
