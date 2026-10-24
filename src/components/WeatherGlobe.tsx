'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import createGlobe, { type Globe } from 'cobe';

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

// Dhaka first: it is home and the globe starts there.
const CITIES: City[] = [
  { name: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'London', country: 'United Kingdom', lat: 51.5072, lon: -0.1276 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.006 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
];

interface Weather {
  temp: number;
  label: string;
  icon: string;
  isDay: boolean;
}

// Same buckets as the clock widget (WMO weather codes)
function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  return 'Stormy';
}

// Emoji for the floating labels, same WMO buckets as above (plus a moon for clear nights)
function weatherIcon(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code <= 2) return isDay ? '⛅' : '☁️';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}

// The rotation (phi) that brings a longitude to the front of the globe.
const focusPhi = (lon: number) => -(lon * Math.PI) / 180 - Math.PI / 2;
const TAU = Math.PI * 2;
// Shortest signed angle from a to b
const angleDiff = (a: number, b: number) => ((((b - a) % TAU) + TAU + Math.PI) % TAU) - Math.PI;

// Tilt the globe part-way toward a city's latitude so far-north/south cities don't sit on the rim.
const focusTheta = (lat: number) => ((lat * Math.PI) / 180) * 0.5;

// cobe turns a marker id into the CSS anchor `--cobe-<id>` and a visibility variable `--cobe-visible-<id>`
const markerId = (i: number) => `city${i}`;

// How far a drag may tilt the globe before it eases back (radians)
const THETA_LIMIT = 0.4;

const BASE_MARKER = 0.035;
const ACTIVE_MARKER = 0.07;

export default function WeatherGlobe() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [weather, setWeather] = useState<Record<string, Weather>>({});
  // Where the globe should be heading; read from the animation loop, so it lives in a ref.
  const targetRef = useRef<number | null>(focusPhi(CITIES[0].lon));
  const targetThetaRef = useRef(focusTheta(CITIES[0].lat));
  const activeRef = useRef(0);

  // Live weather for every city in one request. Failure just leaves the placeholders.
  useEffect(() => {
    const ctrl = new AbortController();
    const lat = CITIES.map((c) => c.lat).join(',');
    const lon = CITIES.map((c) => c.lon).join(',');
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day`,
      { signal: ctrl.signal },
    )
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d) ? d : [d];
        const next: Record<string, Weather> = {};
        list.forEach((w, i) => {
          if (!w?.current || !CITIES[i]) return;
          next[CITIES[i].name] = {
            temp: Math.round(w.current.temperature_2m),
            label: weatherLabel(w.current.weather_code),
            icon: weatherIcon(w.current.weather_code, w.current.is_day === 1),
            isDay: w.current.is_day === 1,
          };
        });
        setWeather(next);
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  const select = useCallback((i: number) => {
    activeRef.current = i;
    targetRef.current = focusPhi(CITIES[i].lon);
    targetThetaRef.current = focusTheta(CITIES[i].lat);
    setActive(i);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // cobe wraps the canvas in a div of its own, so the canvas is created by hand
    // (React never sees it) and removed again on cleanup.
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;cursor:grab;touch-action:pan-y;';
    host.appendChild(canvas);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let globe: Globe | null = null;
    let size = 0;
    let phi = focusPhi(CITIES[0].lon);
    let theta = focusTheta(CITIES[0].lat);
    // Drag feel follows cobe's own demo: 1:1 pointer offset (x/300 for spin, y/1000 for tilt),
    // then momentum that decays while the idle spin carries on.
    let thetaOffset = 0; // tilt added by dragging, on top of the city's own tilt
    let velocity = 0; // spin momentum per frame
    let thetaVelocity = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let phiAtStart = 0;
    let thetaOffsetAtStart = 0;
    let last: { x: number; y: number; t: number } | null = null;
    let visible = false;
    let raf = 0;

    const markers = () =>
      CITIES.map((c, i) => ({
        id: markerId(i),
        location: [c.lat, c.lon] as [number, number],
        size: i === activeRef.current ? ACTIVE_MARKER : BASE_MARKER,
        color: (i === activeRef.current ? [0.4, 1, 0.6] : [1, 1, 1]) as [number, number, number],
      }));

    const build = () => {
      const w = host.clientWidth;
      if (w === 0) return;
      size = w;
      globe?.destroy();
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: w,
        height: w,
        phi,
        theta,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.3, 0.3, 0.3],
        markerColor: [1, 1, 1],
        glowColor: [0.12, 0.12, 0.12],
        markers: markers(),
        markerElevation: 0.02,
      });
    };

    const frame = () => {
      raf = 0;
      if (!globe || !visible) return;

      const moving = Math.abs(velocity) > 0.0001 || Math.abs(thetaVelocity) > 0.0001;

      if (!dragging) {
        if (targetRef.current !== null) {
          // Glide to the selected city (and let any drag tilt settle), then hand back to the idle spin
          const d = angleDiff(phi, targetRef.current);
          thetaOffset *= 0.92;
          if (Math.abs(d) < 0.002) {
            phi = targetRef.current;
            targetRef.current = null;
          } else {
            phi += d * 0.08;
          }
        } else {
          if (!reduceMotion) phi += 0.003;
          if (moving) {
            phi += velocity;
            thetaOffset += thetaVelocity;
            velocity *= 0.95;
            thetaVelocity *= 0.95;
          }
          // Soft spring back when the tilt goes past the limit
          if (thetaOffset < -THETA_LIMIT) thetaOffset += (-THETA_LIMIT - thetaOffset) * 0.1;
          else if (thetaOffset > THETA_LIMIT) thetaOffset += (THETA_LIMIT - thetaOffset) * 0.1;
        }
      }

      theta += (targetThetaRef.current - theta) * 0.08;
      globe.update({ phi, theta: theta + thetaOffset, markers: markers() });

      // Keep looping only while something is moving (or the idle spin is on)
      const settling = Math.abs(thetaOffset) > THETA_LIMIT + 0.001;
      if (!reduceMotion || dragging || targetRef.current !== null || moving || settling) {
        raf = requestAnimationFrame(frame);
      }
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };

    build();
    // Redraw once even when nothing is animating (reduced motion), and whenever the size changes
    const ro = new ResizeObserver(() => {
      if (host.clientWidth !== size) {
        build();
        kick();
      }
    });
    ro.observe(host);

    // Only render while on screen and the tab is visible
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    io.observe(host);
    const onVis = () => {
      if (document.hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else kick();
    };
    document.addEventListener('visibilitychange', onVis);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      phiAtStart = phi;
      thetaOffsetAtStart = thetaOffset;
      velocity = 0;
      thetaVelocity = 0;
      last = null;
      targetRef.current = null;
      canvas.style.cursor = 'grabbing';
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      phi = phiAtStart + (e.clientX - startX) / 300;
      thetaOffset = thetaOffsetAtStart + (e.clientY - startY) / 1000;

      // Release speed, clamped like cobe's demo
      const now = performance.now();
      if (last) {
        const dt = Math.max(now - last.t, 1);
        const clamp = (v: number) => Math.max(-0.15, Math.min(0.15, v));
        velocity = clamp(((e.clientX - last.x) / dt) * 0.3);
        thetaVelocity = clamp(((e.clientY - last.y) / dt) * 0.08);
      }
      last = { x: e.clientX, y: e.clientY, t: now };
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      last = null;
      canvas.style.cursor = 'grab';
      kick();
    };
    // Move/up on window so a drag keeps working when the pointer leaves the globe
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });

    // A selection from the list wakes the loop (it is idle under reduced motion)
    const wake = window.setInterval(() => {
      if (targetRef.current !== null) kick();
    }, 100);

    return () => {
      window.clearInterval(wake);
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      globe?.destroy();
      host.replaceChildren();
    };
  }, []);

  const city = CITIES[active];
  const w = weather[city.name];

  return (
    <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/50">Around the world</p>
        <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          {city.name}
          <span className="ml-3 text-base font-normal text-white/40">{city.country}</span>
        </h3>
        <p className="mt-2 font-mono text-sm text-white/70" aria-live="polite">
          {w ? `${w.label} · ${w.temp}°C · ${w.isDay ? 'daytime' : 'night'}` : 'Loading weather…'}
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-2">
          {CITIES.map((c, i) => {
            const cw = weather[c.name];
            const on = i === active;
            return (
              <li key={c.name}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={on}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left font-mono text-xs transition-colors ${
                    on
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/10 bg-black/25 text-white/60 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  <span className="shrink-0 tabular-nums text-white/50">{cw ? `${cw.temp}°` : '–'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-white/35">Drag the globe to spin it. Weather from Open-Meteo.</p>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[28rem] md:max-w-none" aria-hidden>
        {/* cobe draws into this div; React never puts children in it */}
        <div ref={hostRef} className="h-full w-full" />

        {/* Weather emoji pinned to each city's marker with CSS anchor positioning. Hidden while the
            city is on the far side of the globe, and in browsers without anchor positioning. */}
        {CITIES.map((c, i) => {
          const cw = weather[c.name];
          if (!cw) return null;
          const id = markerId(i);
          const on = i === active;
          return (
            <div
              key={c.name}
              className="globe-label keep-colors pointer-events-none absolute z-10 flex flex-col items-center"
              style={
                {
                  positionAnchor: `--cobe-${id}`,
                  bottom: 'anchor(top)',
                  left: 'anchor(center)',
                  translate: '-50% 0',
                  opacity: `var(--cobe-visible-${id}, 0)`,
                  transition: 'opacity 0.3s',
                } as React.CSSProperties
              }
            >
              {/* The blur lives on this inner box: an inline `filter` on the outer one would replace
                  the colour-restoring filter that `keep-colors` applies in light mode. */}
              <div
                className="flex flex-col items-center"
                style={{
                  filter: `blur(calc((1 - var(--cobe-visible-${id}, 0)) * 8px))`,
                  transition: 'filter 0.3s',
                }}
              >
                {on && (
                  <span className="mb-0.5 rounded-full bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-white">
                    {cw.temp}°
                  </span>
                )}
                <span
                  className="select-none leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-300"
                  style={{ fontSize: on ? '1.9rem' : '1.4rem' }}
                >
                  {cw.icon}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
