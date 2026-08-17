'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ToastPill from './ToastPill';

function greetingForHour(h: number): string {
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 22) return 'Good Evening';
  return "It's Late Night";
}

// Greets the visitor once per full page load: waits for the loading
// screen to fade, then shows the shared toast pill briefly.
export default function GreetingToast() {
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout> | undefined;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;

    // LoadingScreen hides on window load (min 700ms + 350ms fade), so
    // schedule the greeting a beat after that.
    const schedule = () => {
      showTimer = setTimeout(() => {
        setGreeting(greetingForHour(new Date().getHours()));
        setVisible(true);
        hideTimer = setTimeout(() => setVisible(false), 3500);
      }, 1300);
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      window.removeEventListener('load', schedule);
    };
  }, []);

  return (
    <ToastPill visible={visible}>
      <span className="flex items-baseline gap-2.5">
        <span className="text-white font-bold text-sm">{greeting}</span>
        <motion.span
          className="text-white/85 text-xs"
          initial={{ x: 14, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          Welcome to my portfolio
        </motion.span>
      </span>
    </ToastPill>
  );
}
