'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Carousel3D, { gradientFor } from './Carousel3D';
import ProjectModal, { type Project, type Category } from './ProjectModal';

const filters: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'tools', label: 'Tools' },
  { value: 'extension', label: 'Extensions' },
];

export default function ProjectsCarousel({ projects }: { projects: Project[] }) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [isSmall, setIsSmall] = useState(false);
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => setIsSmall(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const { images, labels, descriptions, imageToProject } = useMemo(() => {
    const map = new Map<string, Project>();
    const images: string[] = [];
    const labels: string[] = [];
    const descriptions: string[] = [];
    const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter);
    for (const p of visible) {
      if (p.image) {
        if (!map.has(p.image)) map.set(p.image, p);
        images.push(p.image);
        labels.push(p.title);
        descriptions.push(p.description);
      }
    }
    return { images, labels, descriptions, imageToProject: map };
  }, [projects, filter]);

  const open = useCallback(
    (i: number) => {
      const p = imageToProject.get(images[i]);
      if (p) setSelected(p);
    },
    [images, imageToProject]
  );

  return (
    <>
      <div className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs sm:text-sm tracking-widest uppercase" role="tablist" aria-label="Project filter">
        {filters.map((f) => {
          const active = filter === f.value;
          return (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.value)}
              className={`relative pb-1.5 transition-colors ${active ? 'text-white' : 'text-white/50 hover:text-white'}`}
            >
              {f.label}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-red-600 transition-all duration-300 ${active ? 'w-full' : 'w-0'}`} />
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-3 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={labels[active] ?? 'none'}
            className="flex items-center gap-3 min-w-0"
            initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              aria-hidden
              className="h-0.5 w-8 shrink-0 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${gradientFor(labels[active] ?? '')[0]}, ${gradientFor(labels[active] ?? '')[1]})`,
              }}
            />
            <span className="truncate font-serif text-2xl sm:text-3xl font-semibold text-white">
              {labels[active] ?? ''}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mt-2 w-full h-[340px] md:h-[420px] lg:h-[480px] min-w-0 overflow-hidden">
        <Carousel3D
          images={images}
          labels={labels}
          descriptions={descriptions}
          cardW={isSmall ? 220 : 340}
          cardH={isSmall ? 200 : 270}
          radius={isSmall ? 260 : 400}
          onCardClick={open}
          crisp
          onActiveChange={setActive}
        />
      </div>
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
