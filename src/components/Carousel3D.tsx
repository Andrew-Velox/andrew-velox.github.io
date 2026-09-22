'use client';

import React, { useMemo, useRef, useEffect, useCallback } from 'react';

const FALLBACK =
  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ' +
  'width="160" height="220"><rect width="100%" height="100%" ' +
  'fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle"' +
  ' text-anchor="middle" fill="%234a5568" font-size="18">Image</text></svg>';

const DEFAULT_IMAGES = [
  'https://i.pinimg.com/736x/9f/09/45/9f0945103fc6158cb16e1828a2665b5c.jpg',
  'https://i.pinimg.com/1200x/6e/4c/39/6e4c394783c731f261f295e7ffd1deed.jpg',
  'https://i.pinimg.com/1200x/1e/0c/1c/1e0c1c9c868bf07b4c27a275fb3087af.jpg',
  'https://i.pinimg.com/736x/30/91/09/3091098a15810ddbbd58d5e007bc7207.jpg',
  'https://i.pinimg.com/736x/07/cf/4a/07cf4a3a6f4144b4c7ac8e2ec5978dc1.jpg',
  'https://i.pinimg.com/736x/5d/bf/f2/5dbff2b4c0fdcb9815e989f0db386f95.jpg',
];

const CARD_W = 180;
const CARD_H = 240;
const RADIUS = 240;
const TILT_SENSITIVITY = 1;
const DRAG_SENSITIVITY = 0.2;
const WHEEL_SENSITIVITY = 0.05;
const INERTIA_FRICTION = 0.9;
const AUTOSPIN_SPEED = 0.015;
const IDLE_TIMEOUT = 2000;
const CLICK_THRESHOLD = 6;

interface CardProps {
  src: string;
  transform: string;
  cardW: number;
  cardH: number;
  onClick?: () => void;
}

const Card = React.memo(({ src, transform, cardW, cardH, onClick }: CardProps) => (
  <div
    className="absolute"
    style={{
      width: cardW,
      height: cardH,
      transform,
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    }}
  >
    <button
      type="button"
      onClick={onClick}
      aria-label="Open project details"
      className="w-full h-full overflow-hidden rounded-xl transition-transform duration-300 hover:scale-[1.02] hover:z-10 cursor-pointer p-0 block text-left"
      style={{ backfaceVisibility: 'hidden' }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Carousel item"
        width={cardW}
        height={cardH}
        className="w-full h-full object-cover pointer-events-none"
        loading="lazy"
        draggable={false}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK;
        }}
      />
    </button>
  </div>
));
Card.displayName = 'Card';

interface Carousel3DProps {
  images?: string[];
  radius?: number;
  cardW?: number;
  cardH?: number;
  onCardClick?: (index: number) => void;
}

const Carousel3D = React.memo(
  ({
    images = DEFAULT_IMAGES,
    radius = RADIUS,
    cardW = CARD_W,
    cardH = CARD_H,
    onCardClick,
  }: Carousel3DProps) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const wheelRef = useRef<HTMLDivElement>(null);

    const rotationRef = useRef(0);
    const tiltRef = useRef(0);
    const targetTiltRef = useRef(0);
    const velocityRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef(0);
    const initialRotationRef = useRef(0);
    const dragStartYRef = useRef(0);
    const dragDistanceRef = useRef(0);
    const lastInteractionRef = useRef(Date.now());
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
        if (!parentRef.current || isDraggingRef.current) return;
        lastInteractionRef.current = Date.now();
        const parentRect = parentRef.current.getBoundingClientRect();
        const mouseY = e.clientY - parentRect.top;
        const normalizedY = (mouseY / parentRect.height - 0.5) * 2;
        targetTiltRef.current = -normalizedY * TILT_SENSITIVITY;
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Mouse wheel over the carousel adds to velocity (so the same inertia /
    // friction smoothing applies as for click+drag, instead of snapping).
    useEffect(() => {
      const el = parentRef.current;
      if (!el) return;
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        lastInteractionRef.current = Date.now();
        velocityRef.current += e.deltaY * WHEEL_SENSITIVITY;
      };
      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
    }, []);

    // Reset rotation when the image set changes (e.g. filter applied), so the
    // first card lands at the front instead of inheriting a stale angle.
    useEffect(() => {
      rotationRef.current = 0;
      velocityRef.current = 0;
      lastInteractionRef.current = Date.now();
      if (wheelRef.current) {
        wheelRef.current.style.transform =
          `rotateX(${tiltRef.current}deg) rotateY(0deg)`;
      }
    }, [images]);

    useEffect(() => {
      const animate = () => {
        if (!isDraggingRef.current) {
          if (Math.abs(velocityRef.current) > 0.01) {
            rotationRef.current += velocityRef.current;
            velocityRef.current *= INERTIA_FRICTION;
          } else if (Date.now() - lastInteractionRef.current > IDLE_TIMEOUT) {
            rotationRef.current += AUTOSPIN_SPEED;
          }
        }
        tiltRef.current += (targetTiltRef.current - tiltRef.current) * 0.1;
        if (wheelRef.current) {
          wheelRef.current.style.transform =
            `rotateX(${tiltRef.current}deg) rotateY(${rotationRef.current}deg)`;
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };
    }, []);

    const handleDragStart = useCallback((clientX: number, clientY: number) => {
      lastInteractionRef.current = Date.now();
      isDraggingRef.current = true;
      velocityRef.current = 0;
      dragStartRef.current = clientX;
      dragStartYRef.current = clientY;
      dragDistanceRef.current = 0;
      initialRotationRef.current = rotationRef.current;
    }, []);

    const handleDragMove = useCallback((clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      lastInteractionRef.current = Date.now();
      const deltaX = clientX - dragStartRef.current;
      const deltaY = clientY - dragStartYRef.current;
      dragDistanceRef.current = Math.max(
        dragDistanceRef.current,
        Math.hypot(deltaX, deltaY)
      );
      const newRotation = initialRotationRef.current + deltaX * DRAG_SENSITIVITY;
      velocityRef.current = newRotation - rotationRef.current;
      rotationRef.current = newRotation;
    }, []);

    const handleDragEnd = useCallback(() => {
      isDraggingRef.current = false;
      lastInteractionRef.current = Date.now();
    }, []);

    const handleCardClick = useCallback(
      (index: number) => {
        if (dragDistanceRef.current >= CLICK_THRESHOLD) return;
        onCardClick?.(index);
      },
      [onCardClick]
    );

    const onMouseDown = (e: React.MouseEvent) =>
      handleDragStart(e.clientX, e.clientY);
    const onMouseMove = (e: React.MouseEvent) =>
      handleDragMove(e.clientX, e.clientY);
    const onTouchStart = (e: React.TouchEvent) =>
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: React.TouchEvent) =>
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);

const cards = useMemo(() => {
      const n = images.length;
      // Keep the angular gap between adjacent items roughly constant (~50°)
      // regardless of count, so small filters don't feel empty and large
      // filters don't feel cramped. Caps at 360° once the ring is full.
      const arc = Math.min(360, Math.max(0, (n - 1) * 50));
      // When the arc is small, scale cards down so adjacent items have a
      // visible gap and the cards don't merge together at the front.
      const halfArc = (arc / 2) * (Math.PI / 180);
      const cardScale = halfArc > 0
        ? Math.min(1, (radius * Math.sin(halfArc)) / 180)
        : 1;
      if (arc === 0) {
        return images.map((src, idx) => ({
          key: idx,
          src,
          transform: `translateZ(${radius}px) scale(${cardScale})`,
        }));
      }
      return images.map((src, idx) => {
        const angle = (idx * arc) / (n - 1) - arc / 2;
        return {
          key: idx,
          src,
          transform: `rotateY(${angle}deg) translateZ(${radius}px) scale(${cardScale})`,
        };
      });
    }, [images, radius]);

    return (
      <div
        ref={parentRef}
        className="w-full h-full flex items-center justify-center overflow-hidden font-sans cursor-grab active:cursor-grabbing"
        style={{ userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={handleDragEnd}
      >
        <div
          className="relative"
          style={{
            perspective: 1500,
            perspectiveOrigin: 'center',
            width: Math.max(cardW * 1.5, radius * 2.2),
            height: Math.max(cardH * 1.8, radius * 1.5),
          }}
        >
          <div
            ref={wheelRef}
            className="relative"
            style={{
              width: cardW,
              height: cardH,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
              position: 'absolute',
              left: '50%',
              top: '50%',
              marginLeft: -cardW / 2,
              marginTop: -cardH / 2,
            }}
          >
            {cards.map((card) => (
              <Card
                key={card.key}
                src={card.src}
                transform={card.transform}
                cardW={cardW}
                cardH={cardH}
                onClick={() => handleCardClick(card.key)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);
Carousel3D.displayName = 'Carousel3D';

export default Carousel3D;
