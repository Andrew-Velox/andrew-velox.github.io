'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// A real hanging pull-cord: a Verlet rope (gravity, damping, distance constraints) with the
// handle at the free end. Grab the handle and pull; the cord swings and bounces back like a
// pendulum when you let go. The top end is fixed to the navbar and never moves; the cord itself is
// slightly elastic, so a hard pull stretches it and it springs back. Pulling it far enough "clicks" and flips light/dark mode — only a
// pull does that (a plain click does nothing; Enter/Space still work for keyboard users).
// Light mode is the `light` class on <html> (see globals.css) and is remembered.

const N = 10; // rope points
const LEN = 58; // resting cord length, px
const SEG = LEN / (N - 1);
const GRAVITY = 0.42;
const DAMPING = 0.985;
const ITER = 10;
const MAX_REACH = LEN + 34; // how far the handle can be pulled from the anchor
const CLICK_STRETCH = 14; // the cord must be stretched this far (px) past its length to "click"
const STIFFNESS = 0.55; // < 1 makes the cord a little elastic
const AX = 12; // anchor x (container is w-6)

type P = { x: number; y: number; px: number; py: number };

export default function ThemeSwitch() {
  const [light, setLight] = useState(false);
  const pts = useRef<P[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const drag = useRef<{ id: number; dx: number; dy: number; armed: boolean } | null>(null);
  const target = useRef({ x: AX, y: LEN });
  const calm = useRef(0);

  const toggle = () => {
    const next = !document.documentElement.classList.contains('light');
    document.documentElement.classList.toggle('light', next);
    setLight(next);
    try {
      localStorage.setItem('theme', next ? 'light' : 'dark');
    } catch {}
  };

  const draw = () => {
    const p = pts.current;
    if (!p.length || !pathRef.current || !handleRef.current) return;
    // Smooth curve through the points (midpoint quadratic segments)
    let d = `M ${p[0].x.toFixed(2)} ${p[0].y.toFixed(2)}`;
    for (let i = 1; i < N - 1; i++) {
      const mx = (p[i].x + p[i + 1].x) / 2;
      const my = (p[i].y + p[i + 1].y) / 2;
      d += ` Q ${p[i].x.toFixed(2)} ${p[i].y.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
    }
    d += ` L ${p[N - 1].x.toFixed(2)} ${p[N - 1].y.toFixed(2)}`;
    pathRef.current.setAttribute('d', d);

    const e = p[N - 1];
    const q = p[N - 3];
    const angle = (Math.atan2(e.x - q.x, e.y - q.y) * 180) / Math.PI;
    handleRef.current.style.transform = `translate(${(e.x - 12).toFixed(2)}px, ${(e.y - 3).toFixed(2)}px) rotate(${(-angle).toFixed(2)}deg)`;
  };

  const step = () => {
    const p = pts.current;
    const d = drag.current;

    // Integrate (Verlet)
    for (let i = 0; i < N; i++) {
      const a = p[i];
      const vx = (a.x - a.px) * DAMPING;
      const vy = (a.y - a.py) * DAMPING;
      a.px = a.x;
      a.py = a.y;
      a.x += vx;
      a.y += vy + GRAVITY;
    }

    // The top end is fixed to the navbar — it never moves
    p[0].x = p[0].px = AX;
    p[0].y = p[0].py = 0;

    // The handle follows the pointer while grabbed
    if (d) {
      const last = p[N - 1];
      last.x = last.px = target.current.x;
      last.y = last.py = target.current.y;
    }

    // Keep neighbouring points one segment apart
    for (let k = 0; k < ITER; k++) {
      for (let i = 0; i < N - 1; i++) {
        const a = p[i];
        const b = p[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const diff = ((dist - SEG) / dist) * STIFFNESS;
        const pinA = i === 0; // fixed anchor
        const pinB = !!d && i + 1 === N - 1; // handle held by the pointer
        const wa = pinA ? 0 : pinB ? 1 : 0.5;
        const wb = pinB ? 0 : pinA ? 1 : 0.5;
        a.x += dx * diff * wa;
        a.y += dy * diff * wa;
        b.x -= dx * diff * wb;
        b.y -= dy * diff * wb;
      }
    }

    // Pull far enough → "click" once per pull
    if (d && d.armed && Math.hypot(p[N - 1].x - AX, p[N - 1].y) > LEN + CLICK_STRETCH) {
      d.armed = false;
      toggle();
    }

    draw();

    // Stop the loop once everything has come to rest
    let energy = 0;
    for (const a of p) energy += Math.abs(a.x - a.px) + Math.abs(a.y - a.py);
    calm.current = !d && energy < 0.6 ? calm.current + 1 : 0;
    raf.current = calm.current > 40 ? null : requestAnimationFrame(step);
  };

  const wake = () => {
    calm.current = 0;
    if (raf.current === null) raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    pts.current = Array.from({ length: N }, (_, i) => ({ x: AX, y: i * SEG, px: AX, py: i * SEG }));
    setLight(document.documentElement.classList.contains('light'));
    draw();
    // A small nudge after load so it visibly swings and invites a pull
    const t = window.setTimeout(() => {
      for (let i = 1; i < N; i++) pts.current[i].px -= (i / N) * 2.2;
      wake();
    }, 1400);
    return () => {
      window.clearTimeout(t);
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      raf.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toLocal = (e: React.PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clampReach = (x: number, y: number) => {
    const dx = x - AX;
    const dist = Math.hypot(dx, y);
    if (dist <= MAX_REACH) return { x, y };
    const k = MAX_REACH / dist;
    return { x: AX + dx * k, y: y * k };
  };

  return (
    <div ref={boxRef} className="pointer-events-none absolute right-5 top-0 h-0 w-6 sm:right-8">
      <svg aria-hidden className="absolute left-0 top-0 h-px w-6 overflow-visible">
        <path ref={pathRef} d="" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" className="text-white/55" />
      </svg>

      <button
        ref={handleRef}
        type="button"
        role="switch"
        aria-checked={light}
        aria-label={light ? 'Pull to switch to dark mode' : 'Pull to switch to light mode'}
        onPointerDown={(e) => {
          const l = toLocal(e);
          const end = pts.current[N - 1];
          drag.current = { id: e.pointerId, dx: end.x - l.x, dy: end.y - l.y, armed: true };
          target.current = { x: end.x, y: end.y };
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          wake();
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const l = toLocal(e);
          target.current = clampReach(l.x + d.dx, l.y + d.dy);
        }}
        onPointerUp={(e) => {
          if (drag.current?.id === e.pointerId) drag.current = null;
          wake();
        }}
        onPointerCancel={() => {
          drag.current = null;
          wake();
        }}
        onClick={(e) => {
          // Mouse/touch clicks do nothing — only pulling works. detail===0 means keyboard.
          if (e.detail === 0) toggle();
        }}
        style={{ touchAction: 'none', transformOrigin: '12px 3px', transform: `translate(${AX - 12}px, ${LEN - 3}px)` }}
        className="pointer-events-auto absolute left-0 top-0 flex h-9 w-6 cursor-grab items-center justify-center rounded-full bg-white text-black shadow-[0_4px_14px_rgba(0,0,0,0.45)] ring-1 ring-black/10 active:cursor-grabbing"
      >
        {light ? <Moon className="h-3.5 w-3.5" aria-hidden /> : <Sun className="h-3.5 w-3.5" aria-hidden />}
      </button>
    </div>
  );
}
