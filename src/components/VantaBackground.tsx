'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    VANTA: {
      WAVES: (config: Record<string, unknown>) => {
        destroy: () => void;
      };
    };
  }
}

export default function VantaBackground() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initVanta = () => {
      if (window.VANTA && vantaRef.current) {
        // Destroy existing effect
        if (vantaEffect.current) {
          vantaEffect.current.destroy();
        }

        // Check if dark mode is active
        const isDark = document.documentElement.classList.contains('dark') || 
                      window.matchMedia('(prefers-color-scheme: dark)').matches;

        vantaEffect.current = window.VANTA.WAVES({
          el: vantaRef.current,
          mouseControls: true,
          touchControls: false, // Disable touch controls to prevent interference on mobile
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: isDark ? 0x886000 : 0x886000, // Dark blue for dark mode, bright blue for light mode
          waveHeight: isDark ? 15 : 20,
          waveSpeed: 0.5,
          zoom: isDark ? 0.8 : 1.2
        });
        // 0x202020
      } else {
        // Retry if VANTA is not loaded yet
        timeoutId = setTimeout(initVanta, 100);
      }
    };

    // Load scripts dynamically
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Load Three.js and VANTA
    const loadVanta = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js');
        initVanta();
      } catch (error) {
        console.error('Failed to load VANTA scripts:', error);
      }
    };

    loadVanta();

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      // Restart VANTA when theme changes
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        setTimeout(initVanta, 100);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        setTimeout(initVanta, 100);
      }
    };
    mediaQuery.addListener(handleChange);

    return () => {
      clearTimeout(timeoutId);
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
      observer.disconnect();
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  return (
    <div 
      ref={vantaRef} 
      className="fixed inset-0 w-full h-full z-0 touch-none pointer-events-none"
      style={{ touchAction: 'none' }}
    />
  );
}