'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Blocks the browser context menu site-wide and shows a small toast pill
// explaining why. Drops in from the top on a spring; flips away in 3D
// when it dismisses.
export default function RightClickNotice() {
  const [visible, setVisible] = useState(false);
  // Bumped on every right-click: keys the toast so the full show (flip
  // out, drop back in, badge pop) replays even while it's already open.
  const [fireCount, setFireCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setVisible(true);
      setFireCount((c) => c + 1);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2600);
    };
    document.addEventListener('contextmenu', onContextMenu);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      className="fixed top-6 inset-x-0 flex justify-center z-[90] pointer-events-none"
    >
      {/* popLayout lifts the exiting pill out of the flow, so on repeat
          right-clicks the old one glides up and fades while the new one
          drops in underneath it at the same time */}
      <AnimatePresence mode="popLayout">
        {visible && (
          <motion.div
            key={fireCount}
            className="flex items-center gap-3 rounded-full bg-black/25 backdrop-blur-md px-5 py-4 shadow-lg whitespace-nowrap"
            initial={{ y: -90, opacity: 0, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{
              y: -44,
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            {/* Alert badge — pops into existence after the pill lands */}
            <span className="relative shrink-0 w-6 h-6">
              <motion.span
                className="relative flex items-center justify-center w-6 h-6 rounded-full bg-white text-[#181818] text-sm font-extrabold"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.12, type: 'spring', stiffness: 600, damping: 15 }}
              >
                !
              </motion.span>
            </span>

            {/* Message — slides in from the right just after the badge pops */}
            <motion.span
              className="text-white/95 text-sm"
              initial={{ x: 16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              For browsing experience, right-click is disabled on this site
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
