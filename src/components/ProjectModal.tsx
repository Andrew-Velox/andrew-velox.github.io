'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export type Category = 'web' | 'tools' | 'extension';

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  category: Category;
  link?: string;
  github?: string;
  image?: string;
}

// Formal kanji numerals — the style used on official documents & seals
const kanjiNumerals = ['壱', '弐', '参', '四', '伍', '六', '七', '八', '九', '拾'];

// Track scroll-lock depth so rapid modal open/close cycles (or future stacked
// modals) restore the original overflow value once instead of stomping it.
let scrollLockDepth = 0;
let savedOverflow = '';

function lockScroll() {
  if (scrollLockDepth === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  scrollLockDepth += 1;
}

function unlockScroll() {
  if (scrollLockDepth === 0) return;
  scrollLockDepth -= 1;
  if (scrollLockDepth === 0) {
    document.body.style.overflow = savedOverflow;
  }
}

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      unlockScroll();
    };
  }, [project, onClose]);

  if (!project) return null;

  const kanji = kanjiNumerals[project.id - 1] ?? String(project.id);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/15 bg-[#0e0e0e] shadow-2xl">
        <span className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/30 pointer-events-none" />
        <span className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/30 pointer-events-none" />
        <span className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/30 pointer-events-none" />
        <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/30 pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center border border-white/20 text-gray-300 hover:text-white hover:border-white/50 transition-colors bg-black/40"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {project.image && (
          <div className="relative w-full aspect-[2/1] bg-[#111] border-b border-white/10">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
            <div
              className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 border-2 border-red-600/80 text-red-500 bg-[#0e0e0e]/80 backdrop-blur-sm text-xl font-bold select-none"
              aria-hidden="true"
            >
              {kanji}
            </div>
            <div className="absolute bottom-4 left-4 px-2.5 py-1 border border-white/30 text-[0.65rem] tracking-[0.3em] uppercase font-mono text-white bg-black/50 backdrop-blur-sm">
              {project.category}
            </div>
          </div>
        )}

        <div className="p-8 md:p-10">
          <div className="flex items-baseline gap-3 mb-5">
            <span className="font-mono text-xs text-red-600/80">
              {String(project.id).padStart(2, '0')} /
            </span>
            <h2
              id="project-modal-title"
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
            >
              {project.title}
            </h2>
          </div>

          <div className="h-px w-16 bg-red-600 mb-6" />

          <p className="text-gray-300 leading-relaxed text-base mb-8">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((tag, index) => (
              <span
                key={index}
                className="text-[0.7rem] tracking-wide px-2.5 py-1 border border-white/25 text-gray-200 font-mono uppercase"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-white/15">
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-600/70 text-red-400 hover:text-white hover:bg-red-600/20 transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Live
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/30 text-gray-200 hover:text-white hover:border-white/60 transition-colors font-mono text-xs uppercase tracking-[0.25em]"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg>
                GitHub
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto font-mono text-[0.65rem] tracking-widest text-gray-500 hover:text-white transition-colors"
            >
              閉じる ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
