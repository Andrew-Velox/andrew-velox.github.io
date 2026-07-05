'use client';

import { useEffect, useState } from 'react';

interface BgGifProps {
  /** Path under /public, e.g. "/bg_animaton/ani.gif" */
  src: string;
}

export default function BgGif({ src }: BgGifProps) {
  const [ready, setReady] = useState(false);

  // Pre-decode the gif off-screen so the very first paint shows the real frame
  // instead of a black void while the browser fetches + decodes it.
  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    const show = () => {
      if (!cancelled) setReady(true);
    };
    if (img.complete) {
      show();
    } else {
      img.onload = show;
      img.onerror = show; // fall back to showing it anyway; img tag will handle
    }
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden bg-black"
    >
      <img
        src={src}
        alt=""
        // No opacity dimming, no overlay — show the gif at full clarity.
        className="h-full w-full"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          // Crisp scaling; gifs look softer without this on hi-DPI screens.
          imageRendering: 'auto',
          // Start hidden until we've decoded at least one frame so we never
          // flash a black frame at the user.
          opacity: ready ? 1 : 0,
          transition: 'opacity 250ms ease-out',
          display: 'block',
        }}
        decoding="async"
        // Force the browser to fetch early.
        // @ts-expect-error fetchpriority is valid HTML; React types lag.
        fetchpriority="high"
      />
    </div>
  );
}