import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number;
}

interface Shooting {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef({ x: 0, y: 0 });
  const resizeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let stars: Star[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = 1.5 + Math.random() * 3;
    const TILT = 0.15;

    const spawnShooting = (w: number) => {
      const fromLeft = Math.random() > 0.5;
      const angle = fromLeft ? Math.PI * 0.22 : Math.PI - Math.PI * 0.22;
      const speed = 13 + Math.random() * 10;
      shooting = {
        x: fromLeft ? Math.random() * w * 0.35 : w - Math.random() * w * 0.35,
        y: Math.random() * window.innerHeight * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.9 + Math.random() * 0.5,
        len: 90 + Math.random() * 110,
      };
    };

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shooting = null;
      nextShoot = 1.5 + Math.random() * 3;

      const area = w * h;
      const target = Math.min(900, Math.max(300, Math.floor(area / 1800)));
      stars = Array.from({ length: target }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          r: (1 - z) * 1.6 + z * 0.4 + Math.random() * 0.4,
          twinkleSpeed: 0.4 + Math.random() * 1.6,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.85 ? 0 : [210, 270, 45][Math.floor(Math.random() * 3)],
        };
      });
    };
    resizeRef.current = resize;

    const drawBackground = (w: number, h: number) => {
      const cx = w * 0.5 + offsetRef.current.x * 30;
      const cy = h * 0.55 + offsetRef.current.y * 30;
      const radius = Math.max(w, h) * 0.9;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, '#181818');
      grad.addColorStop(0.35, '#181818');
      grad.addColorStop(0.7, '#181818');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const nebula = ctx.createRadialGradient(
        w * 0.7 + offsetRef.current.x * 20,
        h * 0.3 + offsetRef.current.y * 20,
        0,
        w * 0.7,
        h * 0.3,
        Math.min(w, h) * 0.6
      );
      nebula.addColorStop(0, 'rgba(0, 0, 0, 0.18)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      const nebula2 = ctx.createRadialGradient(
        w * 0.25 + offsetRef.current.x * 15,
        h * 0.75 + offsetRef.current.y * 15,
        0,
        w * 0.25,
        h * 0.75,
        Math.min(w, h) * 0.55
      );
      nebula2.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      nebula2.addColorStop(1, 'rgba(220, 60, 60, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);
    };

    let t = 0;
    const step = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      t += 0.016;
      const dt = 0.016;

      drawBackground(w, h);

      nextShoot -= dt;
      if (nextShoot <= 0) {
        spawnShooting(w);
        nextShoot = 1.5 + Math.random() * 3;
      }
      if (shooting) {
        shooting.x += shooting.vx;
        shooting.y += shooting.vy;
        shooting.life += dt;
        const lifeFrac = shooting.life / shooting.maxLife;
        let alpha = 1;
        if (lifeFrac > 0.65) alpha = Math.max(0, 1 - (lifeFrac - 0.65) / 0.35);

        const tailX = shooting.x - shooting.vx / Math.hypot(shooting.vx, shooting.vy) * shooting.len;
        const tailY = shooting.y - shooting.vy / Math.hypot(shooting.vx, shooting.vy) * shooting.len;
        const grad = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
        grad.addColorStop(0, `rgba(135,206,235,${alpha})`);
        grad.addColorStop(0.3, `rgba(135,206,235,${0.6 * alpha})`);
        grad.addColorStop(1, 'rgba(135,206,235,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        const headGrad = ctx.createRadialGradient(shooting.x, shooting.y, 0, shooting.x, shooting.y, 5);
        headGrad.addColorStop(0, `rgba(135,206,235,${alpha})`);
        headGrad.addColorStop(1, 'rgba(135,206,235,0)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(shooting.x, shooting.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (shooting.life > shooting.maxLife || shooting.x < -50 || shooting.x > w + 50 || shooting.y > h + 50) {
          shooting = null;
        }
      }

      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;

      for (const s of stars) {
        s.x += (0.05 + (1 - s.z) * 0.12) * Math.cos(s.twinklePhase);
        s.y += (0.03 + (1 - s.z) * 0.06);
        let sx = ((s.x % w) + w) % w + ox * (1 - s.z) * 60 * TILT * 4;
        let sy = ((s.y % h) + h) % h + oy * (1 - s.z) * 60 * TILT * 4;
        sx = ((sx % w) + w) % w;
        sy = ((sy % h) + h) % h;

        const twinkle = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);

        if (s.r > 1.4 && s.hue !== 0) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
          halo.addColorStop(0, `rgba(135,206,235,${0.35 * twinkle})`);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(135,206,235,${twinkle})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = twinkle * (0.5 + (1 - s.z) * 0.4);
          ctx.fillStyle = `rgba(135,206,235,${a})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(step);
    };

    const onMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      offsetRef.current.x += (nx - offsetRef.current.x) * 0.05;
      offsetRef.current.y += (ny - offsetRef.current.y) * 0.05;
    };

    // Re-bind on View Transitions swaps (the persisted canvas survives, but
    // viewport dimensions may have changed via scroll restoration).
    const onAfterSwap = () => {
      if (resizeRef.current) resizeRef.current();
    };
    document.addEventListener('astro:after-swap', onAfterSwap);

    resize();
    step();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('astro:after-swap', onAfterSwap);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
    />
  );
}