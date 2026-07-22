'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

// Global cache for media preloading
const mediaCache = new Map<string, { loaded: boolean; element: HTMLVideoElement | HTMLImageElement }>();

export default function ProfileImage({ src, alt, className }: ProfileImageProps) {
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState({ size: 40, offset: 20, emojiSize: 10 });
  const [isHovered, setIsHovered] = useState(false);
  const [expandLeft, setExpandLeft] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);
  const [textWidth, setTextWidth] = useState(140);

  // Check if it's a video file (guard against src being undefined/empty
  // on an early render before the real value is available)
  const isVideo = !!src && (src.endsWith('.webm') || src.endsWith('.mp4') || src.endsWith('.mov'));

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  // Scale the presence dot proportionally to the circle's actual size
  // (250px on mobile, 300px on sm+) so it looks correct on all devices.
  // useLayoutEffect runs before the browser paints, so the correct
  // mobile-proportional size is applied before anything is shown —
  // otherwise the hardcoded desktop-shaped default briefly paints first
  // and then visibly animates down to the mobile size (transition-all
  // picks it up), which reads as a stray "pop" right after load.
  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      // Halo: ~13% of circle width. Offset: ~6.5% of width. Emoji: ~6.7% of width.
      const size = Math.max(28, Math.round(w * 0.13));
      const offset = Math.max(10, Math.round(w * 0.065));
      const emojiSize = Math.max(14, Math.round(w * 0.058));
      setDot({ size, offset, emojiSize });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure the tail text's real pixel width so the expand animation can
  // transition between two concrete numbers (collapsed width -> full width)
  // instead of animating toward CSS `auto`, which isn't interpolatable and
  // was letting the text render outside the pill for a frame on narrow
  // screens where the collapsed/expanded sizes are closer together.
  useLayoutEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.scrollWidth);
    }
  }, []);

  useEffect(() => {
    if (!src) return;

    // Check cache first
    const cached = mediaCache.get(src);
    if (cached && cached.loaded) {
      setMediaLoaded(true);
      setHasError(false);
      return;
    }

    // Check sessionStorage for faster subsequent loads
    const cacheKey = `media_${src}`;
    const sessionCached = sessionStorage.getItem(cacheKey);
    if (sessionCached === 'loaded') {
      setMediaLoaded(true);
      setHasError(false);
      return;
    }

    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      // Reset states
      setMediaLoaded(false);
      setHasError(false);

      // Don't reload if already cached
      if (!cached) {
        video.load();
      }

      const playVideo = async () => {
        try {
          // iOS-specific setup
          video.muted = true;
          video.playsInline = true;
          video.defaultMuted = true;

          // Multiple attempts for iOS
          await video.play();
          setMediaLoaded(true);

          // Cache successful load
          sessionStorage.setItem(cacheKey, 'loaded');
          mediaCache.set(src, { loaded: true, element: video });
        } catch (error) {
          console.warn('Video autoplay failed, trying alternative approach:', error);

          // Fallback for iOS: Try to play on user interaction
          const playOnInteraction = async () => {
            try {
              await video.play();
              setMediaLoaded(true);

              // Cache successful load
              sessionStorage.setItem(cacheKey, 'loaded');
              mediaCache.set(src, { loaded: true, element: video });

              document.removeEventListener('touchstart', playOnInteraction);
              document.removeEventListener('click', playOnInteraction);
            } catch (e) {
              console.warn('Video play failed:', e);
            }
          };

          document.addEventListener('touchstart', playOnInteraction, { once: true });
          document.addEventListener('click', playOnInteraction, { once: true });
        }
      };

      // Small delay for iOS
      setTimeout(playVideo, 100);
    }
  }, [src, isVideo]);

  const handleLoad = () => {
    const cacheKey = `media_${src}`;
    setMediaLoaded(true);
    setHasError(false);

    // Cache successful load
    sessionStorage.setItem(cacheKey, 'loaded');
    mediaCache.set(src, { loaded: true, element: new Image() });
  };

  const handleError = () => {
    setMediaLoaded(false);
    setHasError(true);
    console.error('Media failed to load:', src);
  };

  const handleVideoLoaded = () => {
    const cacheKey = `media_${src}`;
    setMediaLoaded(true);
    setHasError(false);

    // Cache successful load
    sessionStorage.setItem(cacheKey, 'loaded');
    if (videoRef.current) {
      mediaCache.set(src, { loaded: true, element: videoRef.current });
      videoRef.current.play().catch(console.warn);
    }
  };

  // Decide expand direction based on real available viewport space.
  // Only matters on small screens where the avatar sits close to the edge;
  // on larger screens there's almost always room on the right. Uses the
  // actual measured expanded width (not a guess) so this never disagrees
  // with the width the pill will actually animate to. Measures the
  // *avatar circle* (wrapperRef), not the pill itself — the pill's own
  // rect changes every frame while it's animating open, so observing it
  // created a feedback loop that could flip the anchor mid-hover.
  const computeExpandDirection = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      const closedDotRight = rect.left + rect.width - dot.offset;
      const spaceRight = window.innerWidth - closedDotRight;
      const expandedPillWidth = dot.size + 10 + textWidth;
      setExpandLeft(spaceRight < expandedPillWidth);
    }
  };

  // Compute expandLeft proactively on mount, on resize, and whenever the
  // dot's size/offset/text width settle. This way the anchor side is
  // already correct by the time the user hovers/taps, so the interaction
  // itself never flips the anchor (left/right isn't transitioned, so a
  // flip mid-hover would otherwise cause a visible jump/duplicate frame).
  useEffect(() => {
    computeExpandDirection();
    const onResize = () => computeExpandDirection();
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [dot.size, dot.offset, textWidth]);

  const handleDotEnter = () => {
    setIsHovered(true);
  };

  // Mobile/touch: mouseenter fires on tap but mouseleave never fires, so
  // hover state gets stuck open. Handle taps explicitly as a toggle instead.
  const handleDotClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHovered((prev) => !prev);
  };

  // Tapping anywhere else on the page closes the expanded pill.
  useEffect(() => {
    if (!isHovered) return;
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (dotRef.current && !dotRef.current.contains(e.target as Node)) {
        setIsHovered(false);
      }
    };
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isHovered]);

  return (
    <div
      ref={wrapperRef}
      className={`${className} flex-shrink-0 touch-none select-none relative`}
    >
      {/* Container that maintains size to prevent layout shift */}
      <div className="w-full h-full relative overflow-hidden rounded-full">
        {/* Skeleton Loading Effect - Positioned absolutely to avoid layout shift */}
        {!mediaLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
          </div>
        )}

        {/* Error State - Positioned absolutely */}
        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-400/30 to-red-500/20 flex items-center justify-center">
            <div className="text-white/60 text-sm">Media Error</div>
          </div>
        )}

        {/* Render Video or Image - Always present to maintain layout */}
        {!hasError && (
          <>
            {/* Use static image fallback for iOS with WebM */}
            {isVideo && isIOS && src.endsWith('.webm') ? (
              <img
                src="/Fin2.webp"
                alt={alt}
                className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                style={{
                  opacity: mediaLoaded ? 1 : 0,
                  pointerEvents: 'none',
                }}
                draggable={false}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : isVideo ? (
              <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                style={{
                  opacity: mediaLoaded ? 1 : 0,
                  pointerEvents: 'none',
                }}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedData={handleVideoLoaded}
                onCanPlay={handleVideoLoaded}
                onLoadedMetadata={handleVideoLoaded}
                onError={handleError}
                aria-label={alt}
              />
            ) : (
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                style={{
                  opacity: mediaLoaded ? 1 : 0,
                  pointerEvents: 'none',
                }}
                draggable={false}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
          </>
        )}
      </div>

      {/* GitHub-style online presence dot — expands into a pill on hover.
          Anchors from the right normally, but flips to anchor from the
          left (growing leftward) on small screens where there isn't
          enough room to the right of the avatar. */}
      <div
        ref={dotRef}
        className="absolute z-10 pointer-events-auto"
        style={{
          bottom: dot.offset,
          ...(expandLeft
            ? { right: dot.offset }
            : { left: `calc(100% - ${dot.offset + dot.size}px)` }),
        }}
      >
        <div
          className="inline-flex items-center rounded-full bg-neutral-800 overflow-hidden transition-all duration-300 ease-out cursor-default"
          style={{
            height: dot.size,
            width: isHovered ? dot.size + 10 + textWidth : dot.size,
            flexWrap: 'nowrap',
            flexDirection: expandLeft ? 'row-reverse' : 'row',
            boxShadow: isHovered
              ? '0 0 0 2px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0,0,0,0.6)'
              : '0 0 0 2px rgb(38, 33, 33), 0 1px 2px rgba(0,0,0,0.4)',
          }}
          onMouseEnter={handleDotEnter}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleDotClick}
          aria-label="Focusing On Myself"
        >
          {/* Fixed-size circular box — loader cat always centered here, never moves */}
          <span
            className="flex items-center justify-center shrink-0 overflow-hidden"
            style={{
              width: dot.size,
              height: dot.size,
              boxSizing: 'border-box',
            }}
            role="img"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/projects_img/Octocat.svg"
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </span>

          {/* Text tail — its own width is never constrained; the pill's
              overflow-hidden + animating width above is what reveals it.
              (Previously this span also animated its own maxWidth in
              parallel with the pill's, and the two independent animations
              could momentarily disagree on how much space was available, 
              which is what let the text render outside the pill for a
              frame on narrow screens.) */}
          <span
            ref={textRef}
            className="whitespace-nowrap font-medium text-white text-sm transition-opacity duration-300 ease-out shrink-0"
            style={{
              opacity: isHovered ? 1 : 0,
              marginLeft: expandLeft && isHovered ? 10 : 0,
              marginRight: !expandLeft && isHovered ? 10 : 0,
              transition: 'opacity 300ms ease-out, margin 300ms ease-out',
            }}
          >
            Focusing On Myself
          </span>
        </div>
      </div>
    </div>
  );
}