'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide loading screen after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100); // 1.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500">
      {/* Loading animation container */}
      <div className="flex flex-col items-center gap-6">
        {/* Animated logo/name */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-2 animate-pulse">
            Mohabbat
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">
            Andrew-Velox
          </p>
        </div>

        {/* Loading spinner */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin">
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
          Loading portfolio...
        </p>
      </div>

      {/* Background pattern (optional) */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-3xl animate-pulse delay-300"></div>
      </div>
    </div>
  );
}
