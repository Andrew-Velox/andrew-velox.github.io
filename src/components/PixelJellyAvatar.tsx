'use client';

import { useEffect, useRef } from 'react';

interface JellyAvatarProps {
  src: string;
  size?: number;
  rounded?: boolean; // render as a circle instead of a square
}

export default function JellyAvatar({
  src,
  size = 450,
  rounded = true,
}: JellyAvatarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!container || !canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use devicePixelRatio so the image stays sharp on retina screens
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let isLoaded = img.complete && img.naturalWidth > 0;
    const onImgLoad = () => {
      isLoaded = true;
    };
    if (!isLoaded) img.addEventListener('load', onImgLoad);

    // ---- Physics state (unchanged jelly-drag feel) ----
    let imgX = 0;
    let imgY = 0;
    let targetX = 0;
    let targetY = 0;
    let vx = 0;
    let vy = 0;
    let scaleX = 1;
    let scaleY = 1;
    let skewX = 0;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      const rect = container.getBoundingClientRect();
      dragStartX = e.clientX - targetX - rect.left;
      dragStartY = e.clientY - targetY - rect.top;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - dragStartX - rect.left;
      targetY = e.clientY - dragStartY - rect.top;
    };

    const onMouseUp = () => {
      isDragging = false;
      targetX = 0;
      targetY = 0;
    };

    const activeTouchIdRef: { id: number | null } = { id: null };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      activeTouchIdRef.id = touch.identifier;
      isDragging = true;
      const rect = container.getBoundingClientRect();
      dragStartX = touch.clientX - targetX - rect.left;
      dragStartY = touch.clientY - targetY - rect.top;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || activeTouchIdRef.id === null) return;
      const touch = Array.from(e.touches).find(
        (t) => t.identifier === activeTouchIdRef.id
      );
      if (!touch) return;
      const rect = container.getBoundingClientRect();
      targetX = touch.clientX - dragStartX - rect.left;
      targetY = touch.clientY - dragStartY - rect.top;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (activeTouchIdRef.id === null) return;
      const stillTouching = Array.from(e.touches).some(
        (t) => t.identifier === activeTouchIdRef.id
      );
      if (!stillTouching) {
        isDragging = false;
        activeTouchIdRef.id = null;
        targetX = 0;
        targetY = 0;
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    let rafId = 0;

    const drawLoop = () => {
      // Spring physics for inertial drag
      const springStrength = 0.15;
      const friction = 0.78;

      const ax = (targetX - imgX) * springStrength;
      const ay = (targetY - imgY) * springStrength;

      vx = (vx + ax) * friction;
      vy = (vy + ay) * friction;

      imgX += vx;
      imgY += vy;

      // Velocity-driven squash/stretch — the "jelly" feel, minus pixelation
      scaleX = 1 + Math.abs(vx) * 0.003 - Math.abs(vy) * 0.002;
      scaleY = 1 + Math.abs(vy) * 0.003 - Math.abs(vx) * 0.002;
      skewX = vx * 0.004;

      ctx.clearRect(0, 0, size, size);

      ctx.save();
      ctx.translate(size / 2 + imgX, size / 2 + imgY);
      ctx.transform(scaleX, 0, skewX, scaleY, 0, 0);
      ctx.translate(-size / 2, -size / 2);

      if (isLoaded) {
        ctx.drawImage(img, 0, 0, size, size);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading avatar...', size / 2, size / 2);
      }

      ctx.restore();

      rafId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      img.removeEventListener('load', onImgLoad);
    };
  }, [src, size]);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Hidden source image, drawn to canvas each frame */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      <div
        ref={containerRef}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '100%',
          borderRadius: rounded ? '9999px' : '0',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          WebkitBoxReflect:
            'below 2px linear-gradient(transparent 40%, rgba(255,255,255,0.15) 80%, rgba(255,255,255,0.3) 100%)',
          touchAction: 'none',
          cursor: 'grab',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
          }}
        />
      </div>
    </div>
  );
}