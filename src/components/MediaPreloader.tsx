'use client';

import { useEffect } from 'react';

export default function MediaPreloader() {
  useEffect(() => {
    // Preload video
    const video = document.createElement('video');
    video.src = '/Fin2.webm';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.load();
    
    // Preload fallback image for iOS
    const img = new Image();
    img.src = '/Fin2.webp';
    
    // Store in cache
    const handleVideoLoad = () => {
      sessionStorage.setItem('media_/Fin2.webm', 'loaded');
    };
    
    const handleImageLoad = () => {
      sessionStorage.setItem('media_/Fin2.webp', 'loaded');
    };
    
    video.addEventListener('loadedmetadata', handleVideoLoad);
    img.addEventListener('load', handleImageLoad);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleVideoLoad);
      img.removeEventListener('load', handleImageLoad);
    };
  }, []);

  return null; // This component doesn't render anything
}
