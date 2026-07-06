import { useEffect, useRef } from 'react';

type Particle = {
  x: number;
  y: number;
  color: string;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  startTime: number;
  duration: number;
};

type Circle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  lineWidth: number;
  startTime: number;
  duration: number;
};

const DEFAULT_COLORS = ['#5b21b6', '#9333ea', '#db2777'];

function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function setCanvasSize(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export default function ClickFireworks({
  colors = DEFAULT_COLORS,
  numberOfParticles = 24,
}: {
  colors?: string[];
  numberOfParticles?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const circlesRef = useRef<Circle[]>([]);
  const rafRef = useRef<number | null>(null);
  const resizeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => setCanvasSize(canvas);
    resizeRef.current = handleResize;
    handleResize();
    window.addEventListener('resize', handleResize);

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const pointerX =
        'clientX' in e
          ? e.clientX
          : (e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? 0);
      const pointerY =
        'clientY' in e
          ? e.clientY
          : (e.touches?.[0]?.clientY ?? e.changedTouches?.[0]?.clientY ?? 0);

      const rect = canvas.getBoundingClientRect();
      const x = pointerX - rect.left;
      const y = pointerY - rect.top;
      const startTime = performance.now();

      circlesRef.current.push({
        x,
        y,
        radius: 0.1,
        alpha: 0.5,
        lineWidth: 6,
        startTime,
        duration: randomInRange(1200, 1800),
      });

      for (let i = 0; i < numberOfParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = randomInRange(50, 100);
        const dir = Math.random() < 0.5 ? -1 : 1;
        const targetX = x + distance * dir * Math.cos(angle);
        const targetY = y + distance * dir * Math.sin(angle);

        const color = colors[Math.floor(Math.random() * colors.length)];
        particlesRef.current.push({
          x,
          y,
          color,
          radius: randomInRange(10, 20),
          vx: targetX - x,
          vy: targetY - y,
          alpha: randomInRange(0.4, 0.9),
          startTime,
          duration: randomInRange(900, 1500),
        });
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown, { passive: true });

    const onAfterSwap = () => {
      if (resizeRef.current) resizeRef.current();
    };
    document.addEventListener('astro:after-swap', onAfterSwap);

    const render = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        const elapsed = now - p.startTime;
        const t = Math.min(elapsed / p.duration, 1);
        if (t >= 1) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        const eased = easeOutExpo(t);
        const cx = p.x + p.vx * eased;
        const cy = p.y + p.vy * eased;
        const r = p.radius * (1 - eased) + 0.1 * eased;

        ctx.globalAlpha = p.alpha * (1 - eased * 0.5);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(r, 0.1), 0, Math.PI * 2, true);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (let i = circlesRef.current.length - 1; i >= 0; i--) {
        const c = circlesRef.current[i];
        const elapsed = now - c.startTime;
        const t = Math.min(elapsed / c.duration, 1);
        if (t >= 1) {
          circlesRef.current.splice(i, 1);
          continue;
        }
        const eased = easeOutExpo(t);
        const radius = randomInRange(50, 100) * eased;
        const lineWidth = c.lineWidth * (1 - eased);
        const alpha = c.alpha * (1 - eased);

        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(c.x, c.y, Math.max(radius, 0.1), 0, Math.PI * 2, true);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('astro:after-swap', onAfterSwap);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [colors, numberOfParticles]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}