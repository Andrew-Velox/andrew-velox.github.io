// Ink-bleed theme transition, ported from codemure-official/ink-bleed-theme-changer (MIT).
//
// The original screenshots the page in both themes (html2canvas) and blends them in a WebGL2 shader.
// html2canvas can't render CSS filters (this site's light mode is an invert filter), so here the
// browser captures both themes itself (View Transitions API) and the original shader is used only to
// produce the ink *coverage mask*, which reveals the new theme: same noise, tendrils, fibres,
// haze and speckles, same easing and timing.

import { createNoiseTexture } from './ink/noiseTexture';
import { FULLSCREEN_VERT, INK_FRAG } from './ink/shaders';

const DURATION = 2.4; // seconds
const SPREAD = { growth: 0.7, cleanupFrom: 0.45, cleanupReach: 0.4, cleanupPow: 2 };
const PARAMS = { tendril: 1, noiseScale: 1, softness: 1.4, drift: 1 };
const MASK_SCALE = 0.5; // mask pixels per CSS pixel (max)
const MASK_MAX_W = 800;
const COLS = 8;
const ROWS = 7;
const FRAMES = COLS * ROWS; // 56 frames over 2.4s ≈ 23 steps per second

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3); // power3.out

type VT = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };

class MaskRenderer {
  readonly canvas = document.createElement('canvas');
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private uniforms = new Map<string, WebGLUniformLocation | null>();
  private scale = MASK_SCALE;

  private constructor(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    this.gl = gl;
    this.canvas = canvas;
    const mk = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? 'shader');
      return sh;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, mk(gl.VERTEX_SHADER, FULLSCREEN_VERT));
    gl.attachShader(program, mk(gl.FRAGMENT_SHADER, INK_FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'link');
    this.program = program;
    gl.bindVertexArray(gl.createVertexArray());
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, createNoiseTexture(gl));
  }

  static create(): MaskRenderer | null {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    });
    if (!gl) return null;
    try {
      return new MaskRenderer(gl, canvas);
    } catch (err) {
      console.error('[ink]', err);
      return null;
    }
  }

  resize(w: number, h: number) {
    this.scale = Math.min(MASK_SCALE, MASK_MAX_W / w);
    const cw = Math.max(1, Math.round(w * this.scale));
    const ch = Math.max(1, Math.round(h * this.scale));
    if (this.canvas.width !== cw) this.canvas.width = cw;
    if (this.canvas.height !== ch) this.canvas.height = ch;
  }

  private u(name: string) {
    if (!this.uniforms.has(name)) this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
    return this.uniforms.get(name) ?? null;
  }

  draw(center: { x: number; y: number }, elapsed: number, maxDist: number, seed: { x: number; y: number; angle: number }) {
    const gl = this.gl;
    const lin = Math.min(1, elapsed / DURATION);
    const progress = easeOut(lin);
    const ramp = Math.max(0, (lin - SPREAD.cleanupFrom) / (1 - SPREAD.cleanupFrom));
    const cleanup = ramp ** SPREAD.cleanupPow * maxDist * SPREAD.cleanupReach + Math.max(0, (lin - 0.97) / 0.03) * maxDist;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.uniform1i(this.u('uNoise'), 2);
    gl.uniform1f(this.u('uCanvasScale'), this.scale);
    gl.uniform2f(this.u('uRes'), this.canvas.width, this.canvas.height);
    gl.uniform2f(this.u('uCenter'), center.x, center.y);
    gl.uniform1f(this.u('uRadius'), progress * maxDist * SPREAD.growth);
    gl.uniform1f(this.u('uCleanup'), cleanup);
    gl.uniform1f(this.u('uTime'), elapsed);
    gl.uniform1f(this.u('uRef'), Math.max(this.canvas.width, this.canvas.height) / this.scale);
    gl.uniform2f(this.u('uSeed'), seed.x, seed.y);
    const c = Math.cos(seed.angle);
    const s = Math.sin(seed.angle);
    gl.uniformMatrix2fv(this.u('uSeedRot'), false, [c, s, -s, c]);
    gl.uniform1f(this.u('uTendril'), PARAMS.tendril);
    gl.uniform1f(this.u('uNoiseScale'), PARAMS.noiseScale);
    gl.uniform1f(this.u('uSoftness'), PARAMS.softness);
    gl.uniform1f(this.u('uDrift'), PARAMS.drift);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

let renderer: MaskRenderer | null | undefined;

interface Sheet {
  url: string;
  img: HTMLImageElement; // kept referenced so the decoded image stays cached
  probe: HTMLElement; // hidden element that makes the style system load the mask before it is needed
  w: number;
  h: number;
}

let sheet: Sheet | null = null;
let building = false;
let getCenter: (() => { x: number; y: number }) | null = null;
let keyframesReady = false;
let resizeTimer = 0;

const pos = (i: number) => {
  const c = i % COLS;
  const r = Math.floor(i / COLS);
  return `${((c / (COLS - 1)) * 100).toFixed(3)}% ${((r / (ROWS - 1)) * 100).toFixed(3)}%`;
};

/** One keyframe per ink frame, stepped (no interpolation), so the CSS animation is a flip-book. */
function ensureKeyframes() {
  if (keyframesReady) return;
  keyframesReady = true;
  let css = '@keyframes ink-sheet {';
  for (let i = 0; i < FRAMES; i++) {
    css += `${((i / FRAMES) * 100).toFixed(3)}% { mask-position: ${pos(i)}; -webkit-mask-position: ${pos(i)}; animation-timing-function: step-end; }`;
  }
  css += `100% { mask-position: ${pos(FRAMES - 1)}; -webkit-mask-position: ${pos(FRAMES - 1)}; } }`;
  const el = document.createElement('style');
  el.textContent = css;
  document.head.append(el);
}

function dropSheet() {
  if (!sheet) return;
  sheet.probe.remove();
  URL.revokeObjectURL(sheet.url);
  sheet = null;
}

/**
 * Renders every ink frame once into a single sprite sheet (a new random ink each time) and loads it as
 * a CSS mask. Done ahead of time, in small chunks, so a pull never waits and never loads an image
 * mid-animation (swapping a mask image per frame is what made the page flicker).
 */
function buildSheet() {
  const r = renderer;
  if (building || !r || !getCenter) return;
  building = true;
  ensureKeyframes();

  const root = document.documentElement;
  const w = root.clientWidth;
  const h = root.clientHeight;
  r.resize(w, h);
  const fw = r.canvas.width;
  const fh = r.canvas.height;
  const center = getCenter();
  const maxDist = Math.max(Math.hypot(center.x, center.y), Math.hypot(w - center.x, center.y), Math.hypot(center.x, h - center.y), Math.hypot(w - center.x, h - center.y)) + 4;
  const seed = { x: Math.random() * 64 - 32, y: Math.random() * 64 - 32, angle: Math.random() * Math.PI * 2 };

  const out = document.createElement('canvas');
  out.width = fw * COLS;
  out.height = fh * ROWS;
  const ctx = out.getContext('2d');
  if (!ctx) {
    building = false;
    return;
  }

  let i = 0;
  const step = () => {
    // The viewport changed while building: this sheet is already stale, start over.
    if (root.clientWidth !== w || root.clientHeight !== h) {
      building = false;
      scheduleRebuild();
      return;
    }
    const end = Math.min(FRAMES, i + 6);
    for (; i < end; i++) {
      r.draw(center, (i / (FRAMES - 1)) * DURATION, maxDist, seed);
      ctx.drawImage(r.canvas, (i % COLS) * fw, Math.floor(i / COLS) * fh);
    }
    if (i < FRAMES) {
      setTimeout(step, 0);
      return;
    }
    out.toBlob((blob) => {
      if (!blob) {
        building = false;
        return;
      }
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.src = url;
      img
        .decode()
        .catch(() => {})
        .then(() => {
          const probe = document.createElement('div');
          probe.setAttribute('aria-hidden', 'true');
          probe.style.cssText = `position:fixed;left:0;top:0;width:1px;height:1px;opacity:0.01;pointer-events:none;mask-image:url("${url}");-webkit-mask-image:url("${url}")`;
          document.body.append(probe);
          dropSheet();
          sheet = { url, img, probe, w, h };
          building = false;
        });
    }, 'image/png');
  };
  step();
}

function scheduleRebuild(delay = 400) {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(() => {
    if (document.documentElement.classList.contains('ink-running')) return scheduleRebuild(600);
    buildSheet();
  }, delay);
}

/**
 * Create the WebGL context and pre-render the ink frames. `center` gives the point the ink spreads from
 * (the pull-cord handle), read again whenever the sheet is rebuilt.
 */
export function warmInk(center: () => { x: number; y: number }): void {
  getCenter = center;
  if (renderer === undefined) {
    renderer = MaskRenderer.create();
    window.addEventListener('resize', () => scheduleRebuild());
  }
  if (!sheet && renderer) scheduleRebuild(300);
}

/**
 * Runs `swap` (which must flip the theme synchronously) with a pre-rendered ink spread.
 * Falls back to an instant swap when View Transitions / WebGL2 are unavailable, motion is reduced,
 * or the ink frames aren't ready yet.
 */
export function inkToggle(swap: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => VT };
  const root = document.documentElement;
  const ready =
    !!doc.startViewTransition &&
    !!sheet &&
    sheet.w === root.clientWidth &&
    sheet.h === root.clientHeight &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!ready || !sheet) {
    swap();
    scheduleRebuild(600);
    return;
  }

  const used = sheet;
  root.style.setProperty('--ink-sheet', `url("${used.url}")`);
  root.style.setProperty('--ink-size', `${COLS * 100}% ${ROWS * 100}%`);
  root.style.setProperty('--ink-dur', `${DURATION}s`);
  root.classList.add('ink-running');
  const vt = doc.startViewTransition!(swap);

  let over = false;
  const cleanup = () => {
    if (over) return;
    over = true;
    root.classList.remove('ink-running');
    root.style.removeProperty('--ink-sheet');
    root.style.removeProperty('--ink-size');
    root.style.removeProperty('--ink-dur');
    // Use a fresh ink next time (and drop this sheet).
    if (sheet === used) dropSheet();
    scheduleRebuild(300);
  };
  // The transition ends by itself when the CSS animation finishes on its fully covered last frame.
  vt.finished.then(cleanup, cleanup);
}
