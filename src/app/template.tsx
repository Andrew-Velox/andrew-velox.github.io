'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

// True until the first page has mounted. A full load or refresh should show the page in place (no rise: it looked
// like the page dropping a few pixels), and only moving between pages inside the site plays the animation.
let firstLoad = true;

// A template re-mounts on every navigation (unlike a layout), so this plays
// each time you switch pages. Opacity + a small rise only: no blur/filter,
// because those would turn this wrapper into the containing block for
// `position: fixed` children such as the project modal.
export default function Template({ children }: { children: React.ReactNode }) {
  const skipEntrance = firstLoad;
  useEffect(() => {
    firstLoad = false;
  }, []);

  return (
    <motion.div
      className="self-start w-full"
      initial={skipEntrance ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
