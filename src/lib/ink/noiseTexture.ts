/**
 * Tileable gradient-noise texture, so the shader pays one bilinear fetch per octave
 * instead of four hashes + dot products.
 *
 * Layout: SIZE×SIZE texels, CELLS×CELLS lattice cells (one noise unit = SIZE/CELLS
 * texels, comfortably smooth under bilinear filtering). Four decorrelated channels.
 * Values are mapped from [-1, 1] to [0, 255].
 */
export const NOISE_SIZE = 256;
export const NOISE_CELLS = 32;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function channel(rand: () => number): Float32Array {
  const gx = new Float32Array(NOISE_CELLS * NOISE_CELLS);
  const gy = new Float32Array(NOISE_CELLS * NOISE_CELLS);
  for (let i = 0; i < gx.length; i++) {
    const a = rand() * Math.PI * 2;
    gx[i] = Math.cos(a);
    gy[i] = Math.sin(a);
  }
  const texelsPerCell = NOISE_SIZE / NOISE_CELLS;
  const out = new Float32Array(NOISE_SIZE * NOISE_SIZE);
  const fade = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
  const at = (cx: number, cy: number): number =>
    ((cy + NOISE_CELLS) % NOISE_CELLS) * NOISE_CELLS + ((cx + NOISE_CELLS) % NOISE_CELLS);

  for (let y = 0; y < NOISE_SIZE; y++) {
    // Texel centres, so bilinear sampling reproduces the continuous function.
    const py = (y + 0.5) / texelsPerCell;
    const cy = Math.floor(py);
    const fy = py - cy;
    const v = fade(fy);
    for (let x = 0; x < NOISE_SIZE; x++) {
      const px = (x + 0.5) / texelsPerCell;
      const cx = Math.floor(px);
      const fx = px - cx;
      const u = fade(fx);
      const i00 = at(cx, cy);
      const i10 = at(cx + 1, cy);
      const i01 = at(cx, cy + 1);
      const i11 = at(cx + 1, cy + 1);
      const n00 = gx[i00]! * fx + gy[i00]! * fy;
      const n10 = gx[i10]! * (fx - 1) + gy[i10]! * fy;
      const n01 = gx[i01]! * fx + gy[i01]! * (fy - 1);
      const n11 = gx[i11]! * (fx - 1) + gy[i11]! * (fy - 1);
      const nx0 = n00 + (n10 - n00) * u;
      const nx1 = n01 + (n11 - n01) * u;
      out[y * NOISE_SIZE + x] = nx0 + (nx1 - nx0) * v;
    }
  }
  // Normalise to roughly [-1, 1] (2D Perlin peaks near ±0.7).
  for (let i = 0; i < out.length; i++) out[i] = Math.max(-1, Math.min(1, out[i]! * 1.45));
  return out;
}

export function createNoiseTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const rand = mulberry32(0x1b1eed); // fixed: per-click variety comes from uSeed
  const channels = [channel(rand), channel(rand), channel(rand), channel(rand)];
  const data = new Uint8Array(NOISE_SIZE * NOISE_SIZE * 4);
  for (let i = 0; i < NOISE_SIZE * NOISE_SIZE; i++) {
    for (let c = 0; c < 4; c++) {
      data[i * 4 + c] = Math.round((channels[c]![i]! * 0.5 + 0.5) * 255);
    }
  }
  const tex = gl.createTexture();
  if (!tex) throw new Error('createTexture failed');
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, NOISE_SIZE, NOISE_SIZE, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  return tex;
}
