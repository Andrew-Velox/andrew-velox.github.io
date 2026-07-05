'use client';

import { useEffect, useRef } from 'react';

interface GalaxyStar {
  radius: number;      // distance from galaxy center
  angle: number;       // current angle around center
  angSpeed: number;     // radians/sec, differential rotation
  z: number;           // depth 0..1, used for size/brightness
  r: number;
  twinkleSpeed: number;
  twinklePhase: number;
  hue: number;          // 0 = white, else tinted
}

interface FarStar {
  x: number;
  y: number;
  r: number;
  twinkleSpeed: number;
  twinklePhase: number;
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

// Spiral galaxy shape controls
const NUM_ARMS = 3;
const ARM_SPREAD = 0.5;
const ROTATION_SPEED = 0.5; // radians/sec baseline (inner stars faster)
const ELLIPSE_TILT = 0.55;    // flattens the disk into a tilted ellipse

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let galaxyStars: GalaxyStar[] = [];
    let farStars: FarStar[] = [];
    let shooting: Shooting | null = null;
    let nextShoot = 1.5 + Math.random() * 3;
    const TILT = 0.15; // mouse parallax strength for far stars

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

    const getCenter = (w: number, h: number) => ({
      cx: w * 0.5 + offsetRef.current.x * 30,
      cy: h * 0.46 + offsetRef.current.y * 30,
    });

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
      const maxRadius = Math.max(w, h) * 0.72;

      // Galaxy disk stars: biased toward the center, arranged along spiral arms
      const galaxyCount = Math.min(1100, Math.max(400, Math.floor(area / 1400)));
      galaxyStars = Array.from({ length: galaxyCount }, () => {
        const t = Math.pow(Math.random(), 1.8); // bias toward center
        const radius = t * maxRadius;
        const arm = Math.floor(Math.random() * NUM_ARMS);
        const armOffset = (arm / NUM_ARMS) * Math.PI * 2;
        const spiralAngle = radius * 0.012;
        const scatter = (Math.random() - 0.5) * ARM_SPREAD * (1 + t * 2);
        const angle = armOffset + spiralAngle + scatter;
        const z = Math.random();

        // All stars orbit the same direction; inner stars move a little
        // faster than outer ones (differential rotation).
        const angSpeed = ROTATION_SPEED * (1.6 - Math.min(radius / maxRadius, 1) * 0.9);

        return {
          radius,
          angle,
          angSpeed,
          z,
          r: (1 - z) * 1.5 + z * 0.4 + Math.random() * 0.4 + (radius < maxRadius * 0.12 ? 0.4 : 0),
          twinkleSpeed: 0.4 + Math.random() * 1.6,
          twinklePhase: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.85 ? 0 : [210, 270, 45][Math.floor(Math.random() * 3)],
        };
      });

      // Distant uniform background stars, unaffected by galaxy rotation
      const farCount = Math.min(500, Math.max(150, Math.floor(area / 4200)));
      farStars = Array.from({ length: farCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 0.9 + 0.3,
        twinkleSpeed: 0.3 + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    };

    const drawBackground = (w: number, h: number) => {
      const { cx, cy } = getCenter(w, h);

      // Base: solid black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Warm core glow at galaxy center
      const coreRadius = Math.min(w, h) * 0.16;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      core.addColorStop(0, 'rgba(255, 244, 214, 0.30)');
      core.addColorStop(0.4, 'rgba(255, 227, 190, 0.12)');
      core.addColorStop(1, 'rgba(255, 227, 190, 0)');
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // Faint violet nebula haze off to one side
      const nebula = ctx.createRadialGradient(
        w * 0.72 + offsetRef.current.x * 20,
        h * 0.28 + offsetRef.current.y * 20,
        0,
        w * 0.72,
        h * 0.28,
        Math.min(w, h) * 0.6
      );
      nebula.addColorStop(0, 'rgba(2, 0, 5, 0.1)');
      nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, w, h);

      // Faint rose/gold nebula haze on the other side
      const nebula2 = ctx.createRadialGradient(
        w * 0.22 + offsetRef.current.x * 15,
        h * 0.78 + offsetRef.current.y * 15,
        0,
        w * 0.22,
        h * 0.78,
        Math.min(w, h) * 0.55
      );
      nebula2.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
      nebula2.addColorStop(1, 'rgba(0, 0, 0, 0)');
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

      // Shooting stars timer
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

        const mag = Math.hypot(shooting.vx, shooting.vy);
        const tailX = shooting.x - (shooting.vx / mag) * shooting.len;
        const tailY = shooting.y - (shooting.vy / mag) * shooting.len;
        const grad = ctx.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grad.addColorStop(0.3, `rgba(180,200,255,${0.6 * alpha})`);
        grad.addColorStop(1, 'rgba(120,150,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(shooting.x, shooting.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        const headGrad = ctx.createRadialGradient(shooting.x, shooting.y, 0, shooting.x, shooting.y, 5);
        headGrad.addColorStop(0, `rgba(255,255,255,${alpha})`);
        headGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(shooting.x, shooting.y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (shooting.life > shooting.maxLife || shooting.x < -50 || shooting.x > w + 50 || shooting.y > h + 50) {
          shooting = null;
        }
      }

      const { cx, cy } = getCenter(w, h);
      const ox = offsetRef.current.x;
      const oy = offsetRef.current.y;

      // Distant background field (very subtle parallax, no rotation)
      for (const s of farStars) {
        s.twinklePhase += s.twinkleSpeed * dt;
        const twinkle = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        const sx = s.x + ox * 20 * TILT;
        const sy = s.y + oy * 20 * TILT;
        ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.45})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Galaxy disk stars, orbiting the center along their spiral arm
      for (const s of galaxyStars) {
        s.angle += s.angSpeed * dt;
        const sx = cx + Math.cos(s.angle) * s.radius;
        const sy = cy + Math.sin(s.angle) * s.radius * ELLIPSE_TILT;

        const twinkle = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);

        if (s.r > 1.4 && s.hue !== 0) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
          const color = `hsla(${s.hue}, 80%, 70%, ${0.35 * twinkle})`;
          halo.addColorStop(0, color);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255,255,255,${twinkle})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = twinkle * (0.5 + (1 - s.z) * 0.4);
          ctx.fillStyle = `rgba(255,255,255,${a})`;
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

    resize();
    step();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
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