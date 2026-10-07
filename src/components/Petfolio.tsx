"use client";

import { useEffect, useRef, useState } from "react";
import type { Petfolio as PetfolioInstance } from "petfolio";

export default function Petfolio() {
  const petRef = useRef<PetfolioInstance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await import("petfolio");
        if (cancelled) return;

        const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;

        petRef.current = mod.Petfolio.summon({
          autoStart: !reducedMotion,
          scale: 0.95,
        });
        setReady(true);

        // The petfolio canvas is full-viewport (fixed; 100vw x 100vh) with
        // z-index: 99999 and the library forces pointer-events: auto after
        // creating it, which blocks all clicks on the page. Force it back
        // to "none" so buttons underneath remain clickable. The pet is purely
        // decorative on hover, so it doesn't need to capture pointer events.
        const canvas = document.getElementById(
          "petfolio-canvas"
        ) as HTMLCanvasElement | null;
        if (canvas) {
          canvas.style.pointerEvents = "none";
        }
      } catch (err) {
        // Surface to console so the issue is visible in dev, but don't
        // break the page if the pet fails to load.
        console.error("[Petfolio] failed to initialize:", err);
      }
    })();

    return () => {
      cancelled = true;
      petRef.current?.destroy();
      petRef.current = null;
    };
  }, []);

  if (!ready) {
    return (
      <div
        aria-hidden
        style={{
          position: "fixed",
          bottom: 12,
          right: 12,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.5)",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      />
    );
  }

  return null;
}