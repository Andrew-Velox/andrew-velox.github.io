'use client';

import { useEffect, useState } from 'react';
import ProfileImage from './ProfileImage';

const FALLBACK_BG = '#04040f';
// The site's own background (body in globals.css), used when the card isn't tinted from the banner
const PAGE_BG = '#101010';

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
  bio,
  themed = false,
  children,
}: {
  banner: string;
  bio?: string;
  /** Tint the card from the banner's colours (like Discord). Off by default: the card uses the page background. */
  themed?: boolean;
  children?: React.ReactNode;
}) {
  const [tint, setTint] = useState(FALLBACK_BG);

  useEffect(() => {
    if (!themed) return;
    let alive = true;
    themeFromImage(banner).then((c) => alive && setTint(c));
    return () => {
      alive = false;
    };
  }, [banner, themed]);

  const bg = themed ? tint : PAGE_BG;

  return (
    // Two thin side rails only (no top, bottom or rounded corners): the banner runs to the top of the screen and the
    // rails run on down behind the fixed footer.
    <div className="max-xl:border-x-0 max-xl:px-0 border-x border-white/20 px-[3px] sm:px-1 bg-white/10 transition-[padding,border-width] duration-500 ease-out">
    <section
      className="transition-colors duration-700"
      style={{ backgroundColor: bg }}
    >
      {/* Banner */}
      <div
        aria-hidden
        className="h-[10.5rem] sm:h-[13rem] md:h-[14.5rem] xl:h-[15.5rem] 2xl:h-[17rem] transition-[height] duration-500 ease-out"
        style={{
          backgroundImage: `url('${banner}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative px-4 sm:px-6 pb-24 transition-[padding] duration-500 ease-out">
        {/* Avatar overlapping the banner's bottom edge, with a card-colored
            ring cutting into the banner like Discord */}
        <div
          className="-mt-[56px] sm:-mt-[76px] w-fit mx-auto sm:mx-0 rounded-full p-1.5 sm:p-2 transition-[background-color,margin,padding] duration-500 ease-out"
          style={{ backgroundColor: bg }}
        >
          <ProfileImage
            src="/images/profile/Fin2.webm"
            alt="Mohabbat"
            enableOrbGyro
            orbScale={170}
            className="w-[100px] h-[100px] sm:w-[136px] sm:h-[136px] rounded-full object-cover shadow-xl transition-[width,height] duration-500 ease-out"
          />
        </div>

        {/* Identity */}
        <div className="mt-3 font-mono text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white transition-[font-size,line-height] duration-500 ease-out">Mohabbat</h1>
          </div>
          <p className="mt-1 text-sm sm:text-base text-white/60">Software Engineer.</p>
          {bio && (
            <p className="mt-4 max-w-2xl font-sans text-sm sm:text-base leading-relaxed text-white/75">{bio}</p>
          )}
        </div>

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
    </div>
  );
}
