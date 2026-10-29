"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createSakura } from "sakura-tree";

// A cherry blossom tree that fills its own box, so the box is the size of the tree. Give it a size and a
// position with `className` (and `style`). It is drawn on a transparent canvas, so whatever is behind the
// box shows through. The tree pauses by itself while it is scrolled out of view.
export default function SakuraTree({
  className = "relative mx-auto h-72 w-full max-w-md overflow-hidden",
  style,
  interactive = true,
}: {
  className?: string;
  style?: CSSProperties;
  /** false lets clicks go through to what is behind the tree (use it for a decorative tree over other content) */
  interactive?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sakura = createSakura(container, {
      // sakura blush rose peach coral gold lavender violet sky mint matcha white
      palette: "sky",
      detail: true,
      form: "shidare",
    //   rain: true,
      background: "transparent", // only the tree and petals: the page shows through
      petals: 6,
      interactive,
      fps: 30,
    });

    return () => {
      sakura.destroy();
    };
  }, [interactive]);

  return <div ref={containerRef} aria-hidden="true" className={className} style={style} />;
}
