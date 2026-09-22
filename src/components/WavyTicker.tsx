'use client';

import {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

export type WavyTickerItem = {
  label: string;
  svg?: ReactNode;
  color?: string;
};

export interface WavyTickerProps {
  items: WavyTickerItem[];
  amplitude?: number;
  wavelength?: number;
  speed?: number;
  direction?: 'left' | 'right';
  className?: string;
}

const DEFAULT_AMPLITUDE = 24;
const DEFAULT_WAVELENGTH = 200;
const DEFAULT_SPEED = 80;

// Hoisted to module scope so React doesn't see a fresh object each render.
const MASK_STYLE = {
  maskImage:
    'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
  WebkitMaskImage:
    'linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%)',
} as const;

export default function WavyTicker({
  items,
  amplitude = DEFAULT_AMPLITUDE,
  wavelength = DEFAULT_WAVELENGTH,
  speed = DEFAULT_SPEED,
  direction = 'left',
  className,
}: WavyTickerProps) {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const halfWidthRef = useRef(1);
  const phaseRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const isVisibleRef = useRef(false);

  // The list is rendered twice in the JSX below; total rendered = items.length * 2.
  const totalItems = items.length * 2;

  // Keep ref array sized to match rendered children, defensively trimmed.
  if (itemRefs.current.length !== totalItems) {
    itemRefs.current.length = totalItems;
  }

  // Loop keeps running while hidden so resume is seamless.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '50px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Cache track scrollWidth so the hot rAF path doesn't trigger layout reads.
  // useLayoutEffect so the first measured value lands before the rAF loop starts —
  // otherwise baseX would compute against `halfWidthRef.current = 1` for one frame
  // and the loop math would drift, breaking the seamless wrap.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      if (totalItems <= 0) return;
      halfWidthRef.current = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [totalItems]);

  useEffect(() => {
    let raf = 0;
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (isVisibleRef.current) phaseRef.current += dt;

      const track = trackRef.current;
      if (track) {
        const halfWidth = halfWidthRef.current || 1;
        const dirSign = direction === 'left' ? -1 : 1;
        const pxPerSec = halfWidth / speed;
        // Modulo keeps track translation bounded to one copy's width — `translate3d`
        // handles large values fine but bounded values are friendlier to devtools.
        const rawBaseX = phaseRef.current * pxPerSec * dirSign;
        const baseX = ((rawBaseX % halfWidth) + halfWidth) % halfWidth;
        track.style.transform = `translate3d(${-baseX}px, 0, 0)`;

        const itemWidth = halfWidth / totalItems || 1;
        const twoPiOverWavelength = (Math.PI * 2) / wavelength;
        // Modulo the wave phase too — `Math.sin` loses precision past ~2^20.
        const phasePerX = ((baseX / wavelength) * Math.PI * 2) % (Math.PI * 2);
        for (let i = 0; i < itemRefs.current.length; i++) {
          const el = itemRefs.current[i];
          if (!el) continue;
          const x = i * itemWidth;
          const y = Math.sin(x * twoPiOverWavelength - phasePerX) * amplitude;
          el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [amplitude, wavelength, speed, direction, totalItems]);

  const containerClass = [
    'relative w-screen left-1/2 -translate-x-1/2 overflow-hidden',
    'py-10 sm:py-14 border-y border-white/10',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section
      ref={containerRef}
      aria-label="Technology stack ticker"
      className={containerClass}
    >
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={MASK_STYLE}
      />

      <div
        ref={trackRef}
        className="flex items-center gap-16 whitespace-nowrap will-change-transform"
      >
        {/* Render the list twice in two sibling flex boxes so the inter-item gap
            (gap-16 inside each box) is identical to the inter-copy gap (gap-16
            on the track flex). Without this, copy-1's last item butts directly
            against copy-2's first item and the wrap point bunches up. */}
        {[0, 1].map((copyIdx) => (
          <div
            key={copyIdx}
            className="flex items-center gap-16"
            aria-hidden={copyIdx === 1}
          >
            {items.map((item, i) => (
              <div
                key={`${item.label}-${copyIdx}-${i}`}
                ref={(el) => {
                  itemRefs.current[copyIdx * items.length + i] = el;
                }}
                className="inline-flex items-center gap-3 px-4 py-2 will-change-transform"
              >
                <span
                  className="inline-flex items-center justify-center [&_svg]:w-8 [&_svg]:h-8"
                  style={item.color ? { color: item.color } : undefined}
                >
                  {item.svg ?? null}
                </span>
                <span className="font-mono text-sm uppercase tracking-widest text-emerald-300/80">
                  {item.label}
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
