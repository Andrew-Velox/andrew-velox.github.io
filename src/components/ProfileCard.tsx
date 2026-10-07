'use client';

import { useEffect, useState } from 'react';
import ProfileImage from './ProfileImage';

const FALLBACK_BG = '#04040f';

// Average the banner's pixels (favouring saturated ones so a grey photo with
// one coloured accent still picks up the accent) and turn the result into a
// dark, muted tone of the same hue — what Discord does with profile themes.
function themeFromImage(src: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(FALLBACK_BG);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0, g = 0, b = 0, w = 0;
        for (let i = 0; i < data.length; i += 4) {
          const max = Math.max(data[i], data[i + 1], data[i + 2]);
          const min = Math.min(data[i], data[i + 1], data[i + 2]);
          const weight = 0.1 + (max - min) / 255;
          r += data[i] * weight;
          g += data[i + 1] * weight;
          b += data[i + 2] * weight;
          w += weight;
        }
        r /= w; g /= w; b /= w;
        const max = Math.max(r, g, b) / 255;
        const min = Math.min(r, g, b) / 255;
        const d = max - min;
        let h = 0;
        if (d) {
          if (max === r / 255) h = ((g - b) / 255 / d) % 6;
          else if (max === g / 255) h = (b - r) / 255 / d + 2;
          else h = (r - g) / 255 / d + 4;
          h *= 60;
          if (h < 0) h += 360;
        }
        const l0 = (max + min) / 2;
        const s0 = d ? d / (1 - Math.abs(2 * l0 - 1)) : 0;
        const s = Math.round(Math.min(s0, 0.45) * 100);
        resolve(`hsl(${Math.round(h)} ${s}% 11%)`);
      } catch {
        resolve(FALLBACK_BG);
      }
    };
    img.onerror = () => resolve(FALLBACK_BG);
    img.src = src;
  });
}

export default function ProfileCard({
  banner,
  children,
}: {
  banner: string;
  children?: React.ReactNode;
}) {
  const [bg, setBg] = useState(FALLBACK_BG);

  useEffect(() => {
    let alive = true;
    themeFromImage(banner).then((c) => alive && setBg(c));
    return () => {
      alive = false;
    };
  }, [banner]);

  return (
    // Glass frame: a frosted, translucent border ring around the themed card
    <div className="rounded-[1.75rem] p-2 sm:p-2.5 border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]">
    <section
      className="rounded-[1.25rem] transition-colors duration-700"
      style={{ backgroundColor: bg }}
    >
      {/* Banner */}
      <div
        aria-hidden
        className="h-32 sm:h-48 rounded-t-[1.25rem]"
        style={{
          backgroundImage: `url('${banner}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative px-4 sm:px-6 pb-5">
        {/* Avatar overlapping the banner's bottom edge, with a card-colored
            ring cutting into the banner like Discord */}
        <div
          className="-mt-[56px] sm:-mt-[76px] w-fit mx-auto sm:mx-0 rounded-full p-1.5 sm:p-2 transition-colors duration-700"
          style={{ backgroundColor: bg }}
        >
          <ProfileImage
            src="/images/profile/Fin2.webm"
            alt="Mohabbat"
            enableOrbGyro
            orbScale={170}
            className="w-[100px] h-[100px] sm:w-[136px] sm:h-[136px] rounded-full object-cover shadow-xl"
          />
        </div>

        {/* Identity */}
        <div className="mt-3 font-mono text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white">Mohabbat</h1>
            <svg
              aria-label="Verified"
              className="w-5 h-5 sm:w-6 sm:h-6 shrink-0 text-sky-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.5 12.5l-2.2-2.5.3-3.3-3.2-.8-1.7-2.9L12.5 4 9.6 2.8 7.9 5.7l-3.2.8.3 3.3-2.2 2.5 2.2 2.5-.3 3.3 3.2.8 1.7 2.9 2.9-1.2 2.9 1.2 1.7-2.9 3.2-.8-.3-3.3zM10.7 16.3l-3.5-3.5 1.4-1.4 2.1 2.1 4.7-4.7 1.4 1.4z" />
            </svg>
          </div>
          <p className="mt-1 text-sm sm:text-base text-white/60">Rust developer.</p>
          <p className="mt-3 text-[11px] sm:text-xs text-white/40 tracking-wide">
            Last updated recently
          </p>
        </div>

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
    </div>
  );
}
