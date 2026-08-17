'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ToastPill from './ToastPill';

// Blocks the browser context menu site-wide and shows the shared toast
// pill explaining why, auto-dismissing shortly after.
export default function RightClickNotice() {
  const [visible, setVisible] = useState(false);
  // Bumped on every right-click: replays the full show (old pill glides
  // away, new one drops in, badge pops) even while it's already open.
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
    <ToastPill visible={visible} contentKey={fireCount} zIndexClass="z-[90]">
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
    </ToastPill>
  );
}
