import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

export default function TypingText({ text, speed = 100, className = '', style }: TypingTextProps) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isDeleting && currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      } else if (!isDeleting && currentIndex === text.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentIndex > 0) {
        setDisplayText((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false);
      }
    }, isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isDeleting]);

  return (
    <span
      className={className}
      style={{
        fontFamily: 'var(--font-audiowide)',
        ...style,
      }}
    >
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}