'use client';

import { useEffect, useRef } from 'react';

// --- Lightweight 2D Perlin noise (classic, seeded) ---
class Perlin {
  private perm: Uint8Array;

  constructor(seed = 1337) {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    // simple deterministic shuffle
    let s = seed;
    const rand = () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  private fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  private lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  private grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
  }

  noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const p = this.perm;
    const aa = p[p[X] + Y];
    const ab = p[p[X] + Y + 1];
    const ba = p[p[X + 1] + Y];
    const bb = p[p[X + 1] + Y + 1];
    const res = this.lerp(
      this.lerp(this.grad(aa, x, y), this.grad(ba, x - 1, y), u),
      this.lerp(this.grad(ab, x, y - 1), this.grad(bb, x - 1, y - 1), u),
      v
    );
    return res; // roughly -1..1
  }

  // Fractal Brownian Motion: layered octaves for natural cloud detail
  fbm(x: number, y: number, octaves = 4): number {
    let total = 0;
    let amp = 0.5;
    let freq = 1;
    let maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * freq, y * freq) * amp;
      maxAmp += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return total / maxAmp; // normalized -1..1
  }
}

export default function SmokeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const perlin = new Perlin(2024);

    // Offscreen low-res buffer: we compute noise at low resolution then
    // upscale with smoothing, which is both fast and gives a naturally soft look.
    const buffer = document.createElement('canvas');
    const bctx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bctx) return;

    const BUFFER_SCALE = 0.14; // fraction of full res for the noise buffer
    let bw = 0;
    let bh = 0;
    let imageData: ImageData;

    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      bw = Math.max(64, Math.floor(w * BUFFER_SCALE));
      bh = Math.max(36, Math.floor(h * BUFFER_SCALE));
      buffer.width = bw;
      buffer.height = bh;
      imageData = bctx.createImageData(bw, bh);
    };

    let t = 0;
    const step = () => {
      t += 0.0016; // slow evolution speed

      const data = imageData.data;
      const noiseScaleX = 2.2; // horizontal frequency of the cloud pattern
      const noiseScaleY = 2.6; // vertical frequency

      for (let y = 0; y < bh; y++) {
        const ny = y / bh; // 0 (top) .. 1 (bottom)

        // Density profile: near-zero at top, ramping up toward the bottom,
        // matching the reference (clear sky at top, thick smoke at bottom).
        const verticalMask = Math.pow(ny, 1.4);

        for (let x = 0; x < bw; x++) {
          const nx = x / bw;

          // Slow upward scroll (y decreases over time) + gentle horizontal drift
          const sampleX = nx * noiseScaleX + t * 0.4;
          const sampleY = ny * noiseScaleY - t * 0.6;

          const n = perlin.fbm(sampleX, sampleY, 5); // -1..1
          const n01 = (n + 1) * 0.5; // 0..1

          // Combine noise with vertical density mask, then bias contrast
          // so we get distinct wisps rather than uniform haze.
          let density = n01 * verticalMask;
          density = Math.pow(density, 1.3);
          density = Math.min(1, density * 1.6);

          // const grey = 90 + Math.floor(n01 * 50); // darker grey smoke tone
          const alpha = Math.floor(density * 255);

          const idx = (y * bw + x) * 4;
          // data[idx] = grey;
          // data[idx + 1] = grey;
          // data[idx + 2] = grey;
          // data[idx + 3] = alpha;

          const base = 70 + Math.floor(n01 * 45);
          data[idx] = base + 20;         // R — boosted
          data[idx + 1] = base + 8;      // G
          data[idx + 2] = base;          // B
          data[idx + 3] = alpha;
        }
      }
      bctx.putImageData(imageData, 0, 0);

      // Base dark fill
      ctx.fillStyle = '#181818';
      ctx.fillRect(0, 0, w, h);

      // Upscale the noise buffer with smoothing for a soft, blurred cloud look
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.globalCompositeOperation = 'lighten';
      ctx.drawImage(buffer, 0, 0, bw, bh, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';

      rafRef.current = requestAnimationFrame(step);
    };

    resize();
    step();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
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