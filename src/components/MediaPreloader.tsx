import { useEffect } from 'react';

export default function MediaPreloader() {
  useEffect(() => {
    const video = document.createElement('video');
    video.src = '/Fin2.webm';
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.load();

    const img = new Image();
    img.src = '/Fin2.webp';

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

  return null;
}