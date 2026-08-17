'use client';
import { useEffect, useState } from 'react';

const BG_INDEX_KEY = 'bgImageIndex';

export default function RotatingBackground({ images }: { images: string[] }) {
  const [src, setSrc] = useState<string | null>(null);

  // Runs once per mount (i.e. once per page load/refresh). Reads
  // localStorage, so it has to happen client-side in an effect rather
  // than during the initial (possibly server/static) render.
  useEffect(() => {
    if (images.length === 0) return;

    const lastIndex = parseInt(localStorage.getItem(BG_INDEX_KEY) ?? '-1', 10);
    const nextIndex = (Number.isNaN(lastIndex) ? 0 : lastIndex + 1) % images.length;

    setSrc(images[nextIndex]);
    localStorage.setItem(BG_INDEX_KEY, String(nextIndex));
  }, [images]);

  if (!src) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none bg-cover bg-center"
      style={{ backgroundImage: `url('${src}')` }}
    >
      {/* dark overlay to help the image blend with the page's base color */}
      <div className="absolute inset-0 bg-[#181818]/35" />
    </div>
  );
}
