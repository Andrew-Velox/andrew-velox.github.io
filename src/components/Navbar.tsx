'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check initial theme
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                    window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeListener(checkDarkMode);
    };
  }, []);

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={navRef}>
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 right-6 z-50 p-2 transition-colors drop-shadow-lg ${
          isDarkMode ? 'text-white hover:text-white/70' : 'text-white hover:text-gray-600'
        }`}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 rotate-45 translate-y-1.5' : 'w-6'}`}></div>
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 opacity-0' : 'w-5'}`}></div>
          <div className={`h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-4 -rotate-45 -translate-y-1.5' : 'w-4'}`}></div>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div className={`fixed top-20 right-6 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`backdrop-blur-md rounded-lg p-4 min-w-[200px] border ${
          isDarkMode 
            ? 'bg-black/30 border-white/20' 
            : 'bg-white/30 border-gray-400/20'
        }`}>
          <Link 
            href="/" 
            className={`block px-3 py-3 transition-colors border-b last:border-b-0 ${
              isDarkMode 
                ? 'text-white hover:text-white/70 border-white/20' 
                : 'text-gray-800 hover:text-gray-600 border-gray-400/20'
            }`}
          >
            Home
          </Link>
          <Link 
            href="#about" 
            className={`block px-3 py-3 transition-colors border-b last:border-b-0 ${
              isDarkMode 
                ? 'text-white hover:text-white/70 border-white/20' 
                : 'text-gray-800 hover:text-gray-600 border-gray-400/20'
            }`}
          >
            About
          </Link>
          {/* <Link 
            href="#projects" 
            className={`block px-3 py-3 transition-colors border-b last:border-b-0 ${
              isDarkMode 
                ? 'text-white hover:text-white/70 border-white/20' 
                : 'text-gray-800 hover:text-gray-600 border-gray-400/20'
            }`}
          >
            Projects
          </Link>
          <Link 
            href="#contact" 
            className={`block px-3 py-3 transition-colors ${
              isDarkMode 
                ? 'text-white hover:text-white/70' 
                : 'text-gray-800 hover:text-gray-600'
            }`}
          >
            Contact
          </Link> */}
        </div>
      </div>
    </div>
  );
}
