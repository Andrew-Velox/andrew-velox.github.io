'use client';

import { useEffect, useRef } from 'react';

// Spotify playlist shown in the notch's player page.
const PLAYLIST_URI = 'spotify:playlist:5thHTICDwdegYictsmpv98';
export const PLAYER_HEIGHT = 152; // Spotify compact player;

type SpotifyController = {
  addListener: (event: 'playback_update', cb: (e: { data: { isPaused: boolean } }) => void) => void;
};
type SpotifyApi = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width: string; height: number },
    cb: (controller: SpotifyController) => void,
  ) => void;
};
declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyApi) => void;
    __spotifyApi?: SpotifyApi;
  }
}

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

/**
 * Spotify embed controlled through Spotify's iFrame API. It is created lazily the first time the
 * player page is shown, then stays mounted so the music keeps playing when the notch minimises.
 */
export default function MusicPanel({
  enabled,
  onPlayingChange,
}: {
  enabled: boolean;
  onPlayingChange: (playing: boolean) => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const cb = useRef(onPlayingChange);
  cb.current = onPlayingChange;

  useEffect(() => {
    if (!enabled || started.current || !hostRef.current) return;
    started.current = true;
    const host = hostRef.current;

    const mount = (api: SpotifyApi) => {
      const el = document.createElement('div');
      host.appendChild(el);
      api.createController(el, { uri: PLAYLIST_URI, width: '100%', height: PLAYER_HEIGHT }, (controller) => {
        controller.addListener('playback_update', (e) => cb.current(!e.data.isPaused));
      });
    };

    if (window.__spotifyApi) return mount(window.__spotifyApi);
    window.onSpotifyIframeApiReady = (api) => {
      window.__spotifyApi = api;
      mount(api);
    };
    if (!document.querySelector('script[data-spotify-api]')) {
      const s = document.createElement('script');
      s.src = 'https://open.spotify.com/embed/iframe-api/v1';
      s.async = true;
      s.dataset.spotifyApi = '1';
      document.body.appendChild(s);
    }
  }, [enabled]);

  return (
    <div>
      {/* keep-colors: the embed must not be colour-inverted by the light-mode filter */}
      <div
        ref={hostRef}
        className="keep-colors overflow-hidden rounded-2xl bg-black/[0.06]"
        style={{ minHeight: PLAYER_HEIGHT }}
      />
    </div>
  );
}
