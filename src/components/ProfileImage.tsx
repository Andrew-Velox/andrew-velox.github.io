import { useState, useRef, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

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
  const [pillMaxWidth, setPillMaxWidth] = useState(200);

  const isVideo = !!src && (src.endsWith('.webm') || src.endsWith('.mp4') || src.endsWith('.mov'));

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
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

  useEffect(() => {
    if (!src) return;

    const cached = mediaCache.get(src);
    if (cached && cached.loaded) {
      setMediaLoaded(true);
      setHasError(false);
      return;
    }

    const cacheKey = `media_${src}`;
    const sessionCached = sessionStorage.getItem(cacheKey);
    if (sessionCached === 'loaded') {
      setMediaLoaded(true);
      setHasError(false);
      return;
    }

    if (isVideo && videoRef.current) {
      const video = videoRef.current;
      setMediaLoaded(false);
      setHasError(false);

      if (!cached) video.load();

      const playVideo = async () => {
        try {
          video.muted = true;
          video.playsInline = true;
          video.defaultMuted = true;
          await video.play();
          setMediaLoaded(true);
          sessionStorage.setItem(cacheKey, 'loaded');
          mediaCache.set(src, { loaded: true, element: video });
        } catch (error) {
          console.warn('Video autoplay failed, trying alternative approach:', error);
          const playOnInteraction = async () => {
            try {
              await video.play();
              setMediaLoaded(true);
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
      setTimeout(playVideo, 100);
    }
  }, [src, isVideo]);

  const handleLoad = () => {
    const cacheKey = `media_${src}`;
    setMediaLoaded(true);
    setHasError(false);
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
    sessionStorage.setItem(cacheKey, 'loaded');
    if (videoRef.current) {
      mediaCache.set(src, { loaded: true, element: videoRef.current });
      videoRef.current.play().catch(console.warn);
    }
  };

  const computeExpandDirection = () => {
    if (!dotRef.current) return;
    const rect = dotRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;
    const desiredPillWidth = 210;

    const canRight = spaceRight >= desiredPillWidth;
    const canLeft = spaceLeft >= desiredPillWidth;

    let goLeft: boolean;
    if (canRight && !canLeft) goLeft = false;
    else if (canLeft && !canRight) goLeft = true;
    else if (!canRight && !canLeft) goLeft = spaceLeft > spaceRight;
    else goLeft = false;

    const available = goLeft ? spaceLeft : spaceRight;
    setExpandLeft(goLeft);
    setPillMaxWidth(Math.max(80, Math.min(200, available - 8)));
  };

  useEffect(() => {
    computeExpandDirection();
    const onResize = () => computeExpandDirection();
    window.addEventListener('resize', onResize);
    const ro = new ResizeObserver(onResize);
    if (dotRef.current) ro.observe(dotRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
    };
  }, [dot.size, dot.offset]);

  const handleDotEnter = () => {
    computeExpandDirection();
    setIsHovered(true);
  };

  const handleDotClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
    computeExpandDirection();
    setIsHovered((prev) => !prev);
  };

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
      <div className="w-full h-full relative overflow-hidden rounded-full">
        {!mediaLoaded && !hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 animate-pulse">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-white/5 via-transparent to-white/5"></div>
          </div>
        )}

        {hasError && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-400/30 to-red-500/20 flex items-center justify-center">
            <div className="text-white/60 text-sm">Media Error</div>
          </div>
        )}

        {!hasError && (
          <>
            {isVideo && isIOS && src.endsWith('.webm') ? (
              <img
                src="/Fin2.webp"
                alt={alt}
                className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                style={{ opacity: mediaLoaded ? 1 : 0, pointerEvents: 'none' }}
                draggable={false}
                onLoad={handleLoad}
                onError={handleError}
              />
            ) : isVideo ? (
              <video
                ref={videoRef}
                src={src}
                className="w-full h-full object-cover rounded-full transition-opacity duration-300"
                style={{ opacity: mediaLoaded ? 1 : 0, pointerEvents: 'none' }}
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
                style={{ opacity: mediaLoaded ? 1 : 0, pointerEvents: 'none' }}
                draggable={false}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
          </>
        )}
      </div>

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
            width: isHovered ? 'auto' : dot.size,
            maxWidth: isHovered ? pillMaxWidth : dot.size,
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
          <span
            className="flex items-center justify-center shrink-0 overflow-hidden"
            style={{ width: dot.size, height: dot.size, boxSizing: 'border-box' }}
            role="img"
            aria-hidden="true"
          >
            <img
              src="/projects_img/Octocat.svg"
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
            />
          </span>

          <span
            className="whitespace-nowrap font-medium text-white text-sm transition-all duration-300 ease-out"
            style={{
              maxWidth: isHovered ? pillMaxWidth : 0,
              opacity: isHovered ? 1 : 0,
              marginLeft: expandLeft && isHovered ? 10 : 0,
              marginRight: !expandLeft && isHovered ? 10 : 0,
            }}
          >
            Focusing On Myself
          </span>
        </div>
      </div>
    </div>
  );
}