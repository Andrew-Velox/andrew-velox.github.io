import { NOISE_CELLS } from './noiseTexture';

// Shader from codemure-official/ink-bleed-theme-changer (MIT), reduced to the coverage mask:
// instead of blending two page snapshots it outputs the ink coverage as alpha, used as a CSS mask.

/** Fullscreen triangle generated from gl_VertexID — no buffers needed. */
export const FULLSCREEN_VERT = /* glsl */ `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * Ink bleed between two full-document snapshots.
 *
 * Coordinate spaces:
 *  - device px:  gl_FragCoord, flipped to top-left origin
 *  - CSS px:     device px / uCanvasScale (viewport-relative)
 *  - texture px: device px * map.x + map.yz (scale ratio + scroll offset in whole texels);
 *                map.w = 1 flips Y for framebuffer-rendered sources (the frozen composite)
 *  - noise space: (CSS px - click) / uRef, so the pattern scales with the viewport
 *
 * The mask is a signed field f in CSS px (f < 0 = inked):
 *   f = d - R * reach(p)  - tendrils(p)  + fibre(p)  - cleanup
 *  reach    : domain-warped fbm (big irregular blob) + direction-only fbm (anisotropic
 *             lobes, so the drop is irregular even while tiny)
 *  tendrils : ridged fbm sampled on the unit direction, offset by distance so the
 *             ridges curl and branch as they travel outward
 *  fibre    : static screen-space noise (paper fibres) that feathers the frontier
 *  cleanup  : guarantees full coverage as progress -> 1
 */
export const INK_FRAG = /* glsl */ `#version 300 es
precision highp float;
precision highp int;

uniform float uCanvasScale; // device px per CSS px
uniform vec2 uRes;          // canvas device px

uniform vec2 uCenter;       // CSS px, viewport-relative
uniform float uRadius;      // CSS px, eased base radius
uniform float uCleanup;     // CSS px, extra uniform reach that guarantees full coverage at the end
uniform float uTime;        // seconds since click (scaled by slow-mo)
uniform float uRef;         // CSS px, noise reference length (max viewport side)
uniform vec2 uSeed;
uniform mat2 uSeedRot;

uniform float uTendril;     // tendril intensity, 0..2
uniform float uNoiseScale;  // noise frequency multiplier
uniform float uSoftness;    // frontier half-width, CSS px
uniform float uDrift;       // time evolution speed

out vec4 outColor;

// Shape budget: how far (relative to R) the blob may lead / lag the base circle.
const float A_LOBE = 0.22;
const float A_BLOB = 0.20;
const float A_SUM = A_LOBE + A_BLOB;
const float TENDRIL_REACH = 0.24; // x R x uTendril
const float FIBRE_PX = 1.8;
const float THIN_MAX_PX = 26.0;
const float SPECK_PX = 18.0;
const float HAZE_PX = 16.0; // must stay <= SPECK_PX (outer bound)

// ---------- noise ----------

// Precomputed tileable gradient noise (see noiseTexture.ts): one lattice unit per
// 1/NOISE_CELLS of the texture. textureLod keeps sampling independent of derivatives,
// which are undefined inside the early-out branches above.
uniform sampler2D uNoise;
const float INV_CELLS = 1.0 / ${NOISE_CELLS.toFixed(1)};

// Gradient noise, roughly [-1, 1].
float gnoise(vec2 p) {
  return textureLod(uNoise, p * INV_CELLS, 0.0).r * 2.0 - 1.0;
}

// Second, decorrelated channel (fibres, speckles).
float gnoise2(vec2 p) {
  return textureLod(uNoise, p * INV_CELLS, 0.0).g * 2.0 - 1.0;
}

const mat2 OCT = mat2(0.8, 0.6, -0.6, 0.8) * 2.03;

float fbm3(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) { s += a * gnoise(p); p = OCT * p + 17.13; a *= 0.5; }
  return s / 0.875;
}

float fbm4(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * gnoise(p); p = OCT * p + 17.13; a *= 0.5; }
  return s / 0.9375;
}

float fbm5(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { s += a * gnoise(p); p = OCT * p + 17.13; a *= 0.5; }
  return s / 0.96875;
}

void main() {
  vec2 devPx = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 css = devPx / uCanvasScale;
  vec2 rel = css - uCenter;
  float d = length(rel);
  float R = uRadius;
  float cleanup = uCleanup;

  // Conservative bounds on f: skip the noise entirely far from the frontier.
  float inner = R * (1.0 - A_SUM) + cleanup - FIBRE_PX - THIN_MAX_PX - uSoftness * 2.0;
  float outer = R * (1.0 + A_SUM) * (1.0 + TENDRIL_REACH * uTendril) + cleanup + FIBRE_PX + SPECK_PX + uSoftness * 2.0;
  if (d < inner) {
    outColor = vec4(1.0);
    return;
  }
  if (d > outer) {
    outColor = vec4(0.0);
    return;
  }

  float t = uTime * uDrift;
  vec2 p = rel / uRef;
  vec2 dir = uSeedRot * (rel / max(d, 1e-3));
  float ns = uNoiseScale;

  // Domain warp, evolving over time so the edge boils rather than scales.
  vec2 q = p * (2.4 * ns) + uSeed;
  vec2 w = vec2(
    fbm3(q + vec2(0.0, 0.31 * t)),
    fbm3(q + vec2(5.2, 1.3) - vec2(0.27 * t, 0.0))
  );

  // Large irregular blob (warped fbm in page space: lazy at small radii, rich at large)
  // + smooth direction-only lobes so even a tiny drop is lopsided (anisotropy).
  float blob = fbm5(q + 2.3 * w + vec2(0.12 * t, -0.08 * t));
  vec2 lq = dir * 0.9 + uSeed.yx * 0.37 + vec2(0.06 * t);
  float lobes = gnoise(lq) * 0.75 + gnoise(lq * 2.1 + 9.1) * 0.25;
  float reach = clamp(1.0 + A_LOBE * 1.6 * lobes + A_BLOB * 1.5 * blob, 1.0 - A_SUM, 1.0 + A_SUM);
  float f = d - R * reach;

  // Tendrils: thin filaments along the zero-lines of an fbm sampled on the direction
  // circle. The distance term shifts the lines sideways as they extend (curl), the warp
  // bends them, and the fbm octaves make them fork. Each filament has a length (varying
  // per direction) and a width that tapers to a point at the tip.
  float gate = smoothstep(-0.35, 0.4, fbm3(dir * 1.6 + uSeed * 0.61 + 3.7));
  vec2 tq = dir * (2.2 * ns) + (d / uRef) * vec2(2.6, -1.9) * ns + 1.2 * w + uSeed * 1.7 + vec2(0.0, 0.18 * t);
  float n = fbm4(tq);
  float ridgePx = abs(n) * max(d, 24.0) / (4.0 * ns); // ~px distance to the filament's spine
  float lenN = gnoise(dir * 3.1 + uSeed * 0.43 + vec2(0.1 * t)) * 0.5 + 0.5;
  float L = uTendril * TENDRIL_REACH * R * gate * (0.35 + 0.65 * lenN);
  float along = clamp(f / max(L, 1.0), 0.0, 1.0); // 0 at the blob edge, 1 at the tip
  float width = clamp(R * 0.022, 1.5, 9.0) * (1.0 - along * along) * gate;
  float ft = max(f - L, ridgePx - width);
  // Smooth union: filaments flare into the blob instead of meeting it at a crease.
  float k = 6.0;
  float hh = clamp(0.5 + 0.5 * (ft - f) / k, 0.0, 1.0);
  f = mix(ft, f, hh) - k * hh * (1.0 - hh);

  // Paper fibres: static in screen space so they don't shimmer.
  vec2 fq = css * 0.34 + uSeed * 13.0;
  float fibre = gnoise2(fq) * 0.65 + gnoise2(OCT * fq + 5.3) * 0.35; // rotated octave hides the 32-unit tile
  f += fibre * FIBRE_PX;

  f -= cleanup;

  // ---------- compositing ----------
  float soft = max(uSoftness, 0.6);
  float inked = 1.0 - smoothstep(-soft, soft, f);

  // Ink thins just behind the frontier: ~0.6 density, rising to solid. Width varies with
  // the blob noise so the band never reads as a uniform outline.
  float thinW = mix(3.0, THIN_MAX_PX, clamp(blob * 0.8 + 0.3, 0.0, 1.0));
  float density = mix(0.6, 1.0, smoothstep(0.0, thinW, -f));
  float cov = inked * density;

  // Diffusion haze: a faint translucent gradient just ahead of the hard frontier, patchy
  // (driven by the fibre noise) so it reads as pigment bleeding into wet paper.
  float hazeW = mix(4.0, HAZE_PX, clamp(0.5 + 0.5 * blob, 0.0, 1.0));
  float haze = (1.0 - smoothstep(0.0, hazeW, f)) * smoothstep(-0.3, 0.6, 0.35 * fibre + w.x);
  cov = max(cov, haze * 0.24 * step(0.0, f));

  // Speckles: isolated droplets just ahead of the frontier, rarer with distance.
  float ahead = clamp(f / SPECK_PX, 0.0, 1.0);
  if (f > 0.0 && ahead < 1.0) {
    float sn = gnoise2(css * 0.55 + uSeed * 7.0 + 41.0) * 0.5 + 0.5;
    float th = mix(0.80, 0.96, ahead);
    cov = max(cov, smoothstep(th, th + 0.04, sn) * 0.75 * (1.0 - ahead));
  }

  outColor = vec4(vec3(cov), cov); // premultiplied
}
`;
