'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';

export type Track = { src: string; title: string; artist?: string };

// Bar heights (0–1) of the 7-bar waveform glyph
const BARS = [0.4, 0.95, 0.62, 0.25, 0.65, 1, 0.4];

/** The audio-waveform glyph. Static when idle, bouncing bars (CSS keyframes, see globals.css) while music plays. */
export function WaveIcon({ playing = false, className = '' }: { playing?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      {BARS.map((h, i) => {
        const full = 22 * h;
        return (
          <rect
            key={i}
            x={0.5 + i * 3.4}
            y={12 - full / 2}
            width={2.2}
            height={full}
            rx={1.1}
            className={playing ? 'wave-bar' : 'wave-bar-idle'}
            style={
              playing
                ? ({
                    animationDuration: `${0.7 + (i % 4) * 0.15}s`,
                    animationDelay: `${-i * 0.11}s`,
                    '--wave-min': 0.2 + ((i * 3) % 5) * 0.1,
                  } as React.CSSProperties)
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

/**
 * Self-hosted player (files from public/music, see layout.tsx). The <audio> element stays mounted so the music keeps
 * playing when the notch minimises. Nothing is downloaded until the player page is first shown (metadata only) or
 * play is pressed.
 */
export default function MusicPanel({
  tracks,
  enabled,
  onPlayingChange,
}: {
  tracks: Track[];
  enabled: boolean;
  onPlayingChange: (playing: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const cb = useRef(onPlayingChange);
  cb.current = onPlayingChange;
  // Keeps "should it play after the track changes" without re-running the source effect on every play/pause
  const wantPlay = useRef(false);

  const track = tracks[index];
  const count = tracks.length;

  const go = (to: number, autoplay = true) => {
    if (!count) return;
    wantPlay.current = autoplay;
    setTime(0);
    setDuration(0);
    setIndex(((to % count) + count) % count);
  };

  const toggle = () => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  };

  // New track loaded into the element → start it if we were playing / asked to
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (wantPlay.current) a.play().catch(() => setPlaying(false));
  }, [index, track]);

  useEffect(() => {
    cb.current(playing);
  }, [playing]);

  // Lock-screen / media-key controls
  useEffect(() => {
    if (!track || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: track.title, artist: track.artist ?? '' });
    navigator.mediaSession.setActionHandler('previoustrack', () => go(index - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => go(index + 1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, index]);

  if (!count) {
    return (
      <div className="flex h-[132px] items-center justify-center rounded-2xl bg-black/[0.06] px-4 text-center text-xs text-black/55">
        No tracks yet. Add audio files to public/music.
      </div>
    );
  }

  const pct = duration ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="flex h-[132px] flex-col justify-between rounded-2xl bg-black/[0.06] p-3">
      <audio
        ref={audioRef}
        src={track.src}
        preload={enabled ? 'metadata' : 'none'}
        onPlay={() => {
          wantPlay.current = true;
          setPlaying(true);
        }}
        onPause={() => {
          // a track ending/switching fires pause too; only a real user pause clears the intent
          if (!audioRef.current?.ended) wantPlay.current = false;
          setPlaying(false);
        }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => {
          if (count === 1 && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          } else go(index + 1);
        }}
      />

      {/* Now playing */}
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <WaveIcon playing={playing} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-black">{track.title}</p>
          <p className="truncate text-xs text-black/55">{track.artist ?? 'Mohabbat’s playlist'}</p>
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-black/45">
          {index + 1}/{count}
        </span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="w-8 text-right text-[10px] tabular-nums text-black/55">{fmt(time)}</span>
        <input
          type="range"
          aria-label="Seek"
          className="seek-bar min-w-0 flex-1"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          disabled={!duration}
          style={{ '--seek': `${pct}%` } as React.CSSProperties}
          onChange={(e) => {
            const t = Number(e.target.value);
            setTime(t);
            if (audioRef.current) audioRef.current.currentTime = t;
          }}
        />
        <span className="w-8 text-[10px] tabular-nums text-black/55">{fmt(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          aria-label="Previous track"
          onClick={() => go(index - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-black/70 transition hover:bg-black/10 hover:text-black active:scale-90"
        >
          <SkipBack className="h-[18px] w-[18px]" fill="currentColor" />
        </button>
        <button
          type="button"
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/85 active:scale-90"
        >
          {playing ? (
            <Pause className="h-[18px] w-[18px]" fill="currentColor" />
          ) : (
            <Play className="h-[18px] w-[18px] translate-x-[1px]" fill="currentColor" />
          )}
        </button>
        <button
          type="button"
          aria-label="Next track"
          onClick={() => go(index + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-black/70 transition hover:bg-black/10 hover:text-black active:scale-90"
        >
          <SkipForward className="h-[18px] w-[18px]" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}
