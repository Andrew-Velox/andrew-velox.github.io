'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

function greetingForHour(h: number): string {
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 17) return 'Good Afternoon';
  if (h >= 17 && h < 22) return 'Good Evening';
  return "It's Late Night";
}

// Greets the visitor once per full page load: waits for the loading
// screen to fade, drops in from the top, and dismisses itself.
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
    <div
      aria-live="polite"
      className="fixed top-6 inset-x-0 flex justify-center z-[85] pointer-events-none"
    >
      <AnimatePresence>
        {visible && (
          <motion.div
            className="flex items-baseline gap-3 rounded-full bg-black/25 backdrop-blur-md px-6 py-4 shadow-lg whitespace-nowrap"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{
              y: -44,
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <span className="text-white font-bold text-base">{greeting}</span>
            <motion.span
              className="text-white/85 text-sm"
              initial={{ x: 14, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Welcome to my portfolio
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
