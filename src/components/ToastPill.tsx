'use client';
import { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// Shared shell for the top-center notification pills (greeting toast,
// right-click notice). Owns the positioning, glass styling and the
// drop-in / slide-away animations — callers only provide the content.
export default function ToastPill({
  visible,
  contentKey,
  zIndexClass = 'z-[85]',
  children,
}: {
  visible: boolean;
  /** Change this to replay the entrance while the pill is already open
      (the old content glides up and fades as the new one drops in). */
  contentKey?: string | number;
  zIndexClass?: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      className={`fixed top-6 inset-x-0 flex justify-center ${zIndexClass} pointer-events-none`}
    >
      {/* popLayout lifts the exiting pill out of the flow so a keyed
          replacement can drop in underneath it at the same time */}
      <AnimatePresence mode="popLayout">
        {visible && (
          <motion.div
            key={contentKey}
            className="flex items-center gap-3 rounded-full bg-black/45 backdrop-blur-md px-5 py-3.5 shadow-lg whitespace-nowrap"
            initial={{ y: -90, opacity: 0, scale: 1 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{
              y: -44,
              scale: 0.95,
              opacity: 0,
              transition: { duration: 0.4, ease: 'easeOut' },
            }}
            transition={{ type: 'spring', stiffness: 380, damping: 14 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
