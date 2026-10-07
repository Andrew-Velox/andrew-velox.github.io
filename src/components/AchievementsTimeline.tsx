'use client';

import { motion } from 'framer-motion';
import { achievementsData } from '../data/achievements';

type Item = { title: string; link?: string; rank?: string; date?: string; place?: string; note?: string };

const ease = [0.22, 1, 0.36, 1] as const;

export default function AchievementsTimeline() {
  return (
    <div className="mt-4 space-y-8">
      {achievementsData
        // Skip placeholder-only groups (no rank/date on any item)
        .filter((g) => g.items.some((it) => 'rank' in it || 'date' in it))
        .map((group) => (
          <div key={group.section}>
            <motion.h3
              className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/40"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease }}
            >
              {group.section}
            </motion.h3>

            <ul className="relative mt-5 ml-1.5">
              {/* The line draws itself down as the group scrolls into view */}
              <motion.span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-px origin-top bg-white/15"
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.9, ease }}
              />

              {/* A soft light that travels up the line, bottom to top, on loop */}
              <span aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 w-px overflow-hidden">
                {/* Full-height strip with a soft band in the middle, moved with a GPU
                    transform (translateY) instead of animating layout properties. */}
                <motion.span
                  className="absolute inset-0 will-change-transform"
                  style={{
                    background:
                      'linear-gradient(to bottom, transparent 0%, transparent 38%, rgba(255,255,255,0.9) 50%, transparent 62%, transparent 100%)',
                  }}
                  initial={{ y: '100%' }}
                  animate={{ y: ['100%', '-100%'] }}
                  transition={{ duration: 3.2, ease: 'linear', repeat: Infinity, repeatDelay: 0.6, delay: 1 }}
                />
              </span>

              {group.items.map((it, i) => {
                const item = it as Item;
                const top = /champion|finalist/i.test(item.rank ?? '');
                const label = /^\d+$/.test(item.rank ?? '') ? `#${item.rank}` : item.rank;
                const meta = [item.place, item.date, item.note].filter(Boolean).join(' · ');
                return (
                  <motion.li
                    key={item.title}
                    className="relative pb-7 pl-6 last:pb-0"
                    initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease }}
                  >
                    {/* Node pops in */}
                    <motion.span
                      aria-hidden
                      className={`absolute -left-[5px] top-[7px] h-2.5 w-2.5 rounded-full border ${
                        top ? 'border-white bg-white' : 'border-white/50 bg-[#0b0b10]'
                      }`}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.2 + i * 0.08 }}
                    />

                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h4 className="min-w-0 text-sm sm:text-base text-white/90">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline-offset-4 decoration-white/30 hover:underline"
                          >
                            {item.title}
                          </a>
                        ) : (
                          item.title
                        )}
                      </h4>
                      <span className={`shrink-0 font-mono text-xs sm:text-sm ${top ? 'text-white' : 'text-white/50'}`}>
                        {label}
                      </span>
                    </div>
                    {meta && <p className="mt-1 text-xs text-white/40">{meta}</p>}
                  </motion.li>
                );
              })}
            </ul>
          </div>
        ))}
    </div>
  );
}
