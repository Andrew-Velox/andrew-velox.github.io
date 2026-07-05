'use client';

import { useEffect, useRef } from 'react';

interface PixelJellyAvatarProps {
  src: string;
  size?: number;
  gridSize?: number;
  bgColor?: string;
}

interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export default function PixelJellyAvatar({
  src,
  size = 450,
  gridSize = 80,
  bgColor = '#111e16',
}: PixelJellyAvatarProps) {
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

    // Configure canvas internal resolution
    canvas.width = size;
    canvas.height = size;
    const pixelSize = canvas.width / gridSize;

    let time = 0;
    let imagePixels: Pixel[] = [];
    let isLoaded = false;

    // Physics state
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
      dragStartX = e.clientX - targetX;
      dragStartY = e.clientY - targetY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      targetX = e.clientX - dragStartX;
      targetY = e.clientY - dragStartY;
    };

    const onMouseUp = () => {
      isDragging = false;
      // Snap target back to the center when released
      targetX = 0;
      targetY = 0;
    };

    // Touch support: track a single active touch
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

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    // Touch events scoped to the container so scrolling the page still works
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    const initializeMatrix = () => {
      try {
        const imgBuffer = document.createElement('canvas');
        imgBuffer.width = gridSize;
        imgBuffer.height = gridSize;
        const bCtx = imgBuffer.getContext('2d');
        if (!bCtx) return;

        bCtx.imageSmoothingEnabled = false;
        // @ts-expect-error - vendor-prefixed properties for older browsers
        bCtx.webkitImageSmoothingEnabled = false;
        // @ts-expect-error - vendor-prefixed properties for older browsers
        bCtx.mozImageSmoothingEnabled = false;

        bCtx.drawImage(img, 0, 0, gridSize, gridSize);
        const imgData = bCtx.getImageData(0, 0, gridSize, gridSize).data;

        imagePixels = [];
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const idx = (y * gridSize + x) * 4;
            imagePixels.push({
              r: imgData[idx],
              g: imgData[idx + 1],
              b: imgData[idx + 2],
              a: imgData[idx + 3],
            });
          }
        }
        isLoaded = true;
      } catch (e) {
        // Surface the failure for debugging without breaking the animation loop
        // eslint-disable-next-line no-console
        console.error('Matrix generation error:', e);
      }
    };

    if (img.complete && img.naturalWidth > 0) {
      initializeMatrix();
    } else {
      img.addEventListener('load', initializeMatrix);
    }

    let rafId = 0;

    const drawLoop = () => {
      time += 0.05;

      // Spring physics for inertial global drag
      const springStrength = 0.15;
      const friction = 0.78;

      const ax = (targetX - imgX) * springStrength;
      const ay = (targetY - imgY) * springStrength;

      vx = (vx + ax) * friction;
      vy = (vy + ay) * friction;

      imgX += vx;
      imgY += vy;

      // Map velocity to dynamic scale/skew for a jelly squash
      scaleX = 1 + Math.abs(vx) * 0.003 - Math.abs(vy) * 0.002;
      scaleY = 1 + Math.abs(vy) * 0.003 - Math.abs(vx) * 0.002;
      skewX = vx * 0.004;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2 + imgX, canvas.height / 2 + imgY);
      ctx.transform(scaleX, 0, skewX, scaleY, 0, 0);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      if (isLoaded && imagePixels.length > 0) {
        for (let y = 0; y < gridSize; y++) {
          for (let x = 0; x < gridSize; x++) {
            const pixel = imagePixels[y * gridSize + x];
            if (pixel.a < 10) continue;

            const idleWarp = Math.sin(y * 0.15 + time * 2.0) * 1.5;
            const finalX = x * pixelSize + idleWarp;
            const finalY = y * pixelSize;

            ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;
            ctx.fillRect(finalX, finalY, pixelSize + 0.3, pixelSize + 0.3);
          }
        }
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Pixel Avatar Matrix...', canvas.width / 2, canvas.height / 2);
      }

      ctx.restore();

      rafId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      img.removeEventListener('load', initializeMatrix);
    };
  }, [src, size, gridSize, bgColor]);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Hidden source image used to extract the pixel matrix */}
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
          backgroundColor: 'transparent',
          borderRadius: '0',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          overflow: 'visible',
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
            borderRadius: '0',
          }}
        />
      </div>
    </div>
  );
}