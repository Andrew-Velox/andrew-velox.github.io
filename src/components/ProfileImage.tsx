'use client';

import { useState, useRef, useEffect } from 'react';

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

  // Check if it's a video file
  const isVideo = src.endsWith('.webm') || src.endsWith('.mp4') || src.endsWith('.mov');

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  useEffect(() => {
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

  return (
    <div className="flex-shrink-0 touch-none select-none relative">
      {/* Container that maintains size to prevent layout shift */}
      <div className={`${className} relative overflow-hidden`}>
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
                  pointerEvents: 'none' 
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
                  pointerEvents: 'none' 
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
                  pointerEvents: 'none' 
                }}
                draggable={false}
                onLoad={handleLoad}
                onError={handleError}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
