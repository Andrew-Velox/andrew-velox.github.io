'use client';

import { useEffect, useRef } from 'react';

interface GalaxyStar {
  u: number;           // normalized distance from black hole, 1 = spawn edge, 0 = event horizon
  angle: number;       // current angle around center
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

// Accretion disk / black hole controls
const NUM_ARMS = 3;
const ARM_SPREAD = 0.5;
const ELLIPSE_TILT = 0.55;     // flattens the disk into a tilted ellipse
const EVENT_HORIZON_U = 0.035; // fraction of maxRadius where a particle is consumed
const FALL_RATE = 0.16;        // how fast particles spiral inward (per second, scales with proximity)
const SPIN_RATE = 0.55;        // angular speed scale (radians/sec, scales with proximity)
const STREAK_U = 0.28;         // below this, particles render as motion-blur wisps instead of dots
const DIM_ZONE = EVENT_HORIZON_U * 9; // wider fade-out band so nothing brightens right at the void

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
    let maxRadius = 0;
    const TILT = 0.15; // mouse parallax strength for far stars

    // Spawns a particle either scattered across the whole disk (initial fill,
    // biased denser toward the outer edge to mimic a real accretion disk's
    // density profile) or fresh at the outer edge (after being consumed).
    const spawnGalaxyStar = (initial: boolean): GalaxyStar => {
      const u = initial ? Math.sqrt(Math.random()) : 0.92 + Math.random() * 0.08;
      const radius = u * maxRadius;
      const arm = Math.floor(Math.random() * NUM_ARMS);
      const armOffset = (arm / NUM_ARMS) * Math.PI * 2;
      const spiralAngle = radius * 0.012;
      const scatter = (Math.random() - 0.5) * ARM_SPREAD * (1 + (1 - u) * 2);
      const angle = armOffset + spiralAngle + scatter;
      const z = Math.random();

      return {
        u,
        angle,
        z,
        r: (1 - z) * 1.5 + z * 0.4 + Math.random() * 0.4,
        twinkleSpeed: 0.4 + Math.random() * 1.6,
        twinklePhase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.85 ? 0 : [210, 270, 45][Math.floor(Math.random() * 3)],
      };
    };

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
      cy: h * 0.34 + offsetRef.current.y * 30,
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
      maxRadius = Math.max(w, h) * 0.72;

      // Particles feeding into the black hole: initial fill is scattered
      // across the whole disk; from then on they spiral inward, get
      // consumed at the event horizon, and respawn back at the outer edge.
      const galaxyCount = Math.min(1900, Math.max(700, Math.floor(area / 800)));
      galaxyStars = Array.from({ length: galaxyCount }, () => spawnGalaxyStar(true));

      // Distant uniform background stars, unaffected by galaxy rotation
      const farCount = Math.min(900, Math.max(300, Math.floor(area / 2200)));
      farStars = Array.from({ length: farCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.3,
        twinkleSpeed: 0.3 + Math.random() * 1.2,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    };

    const drawBackground = (w: number, h: number) => {
      // Base: solid black
      ctx.fillStyle = '#000000';
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
      nebula.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      nebula.addColorStop(1, 'rgba(120, 90, 200, 0)');
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
      nebula2.addColorStop(1, 'rgba(220, 130, 170, 0)');
      ctx.fillStyle = nebula2;
      ctx.fillRect(0, 0, w, h);
    };

    // A perfectly empty void — flat black, no rim, no glow. It should read
    // as pure absence, blending seamlessly with the background, the way it
    // does in a real photo of a vortex/accretion disk.
    const drawBlackHole = (w: number, h: number) => {
      const { cx, cy } = getCenter(w, h);
      const rx = Math.min(w, h) * 0.022;
      const ry = rx * ELLIPSE_TILT;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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
        ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.55})`;
        ctx.beginPath();
        ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Particles spiraling into the black hole: fall inward and spin
      // faster the closer they get, then get consumed and respawn at
      // the outer edge to feed the disk again.
      for (let i = 0; i < galaxyStars.length; i++) {
        const s = galaxyStars[i];

        s.u -= FALL_RATE * (1.3 - s.u) * dt;
        const angSpeed = SPIN_RATE / (s.u + 0.05);
        s.angle += angSpeed * dt;
        s.twinklePhase += s.twinkleSpeed * dt;

        if (s.u <= EVENT_HORIZON_U) {
          galaxyStars[i] = spawnGalaxyStar(false);
          continue;
        }

        const radius = s.u * maxRadius;
        const sx = cx + Math.cos(s.angle) * radius;
        const sy = cy + Math.sin(s.angle) * radius * ELLIPSE_TILT;

        const twinkle = 0.6 + 0.4 * Math.sin(t * s.twinkleSpeed + s.twinklePhase);
        // Dim smoothly over a wide band as a particle nears the horizon —
        // no brightening right around the void, just a fade to black.
        const fade = Math.min(1, s.u / DIM_ZONE);

        if (s.u < STREAK_U) {
          // Close to the void: render as a short tangential motion-blur
          // wisp instead of a dot, so the spiral reads as flowing streaks
          // rather than scattered points near the center.
          const dirX = -Math.sin(s.angle);
          const dirY = Math.cos(s.angle) * ELLIPSE_TILT;
          const mag = Math.hypot(dirX, dirY) || 1;
          const ux = dirX / mag;
          const uy = dirY / mag;

          const closeness = 1 - s.u / STREAK_U; // 0 at threshold, 1 at horizon
          const streakLen = 4 + closeness * 22;
          const tailX = sx - ux * streakLen;
          const tailY = sy - uy * streakLen;

          // No brightening as it approaches the void — fade is the only
          // thing controlling alpha here, so it just quietly dims out.
          const alpha = twinkle * fade;
          const grad = ctx.createLinearGradient(tailX, tailY, sx, sy);
          grad.addColorStop(0, 'rgba(255,255,255,0)');
          grad.addColorStop(1, `rgba(230,230,235,${alpha})`);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.6, s.r * 0.9);
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else if (s.r > 1.4 && s.hue !== 0) {
          const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, s.r * 6);
          const color = `hsla(${s.hue}, 80%, 70%, ${0.35 * twinkle * fade})`;
          halo.addColorStop(0, color);
          halo.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r * 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(255,255,255,${twinkle * fade})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const a = twinkle * (0.5 + (1 - s.z) * 0.4) * fade;
          ctx.fillStyle = `rgba(255,255,255,${a})`;
          ctx.beginPath();
          ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw the black hole on top so infalling particles vanish behind it
      drawBlackHole(w, h);

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