'use client';
import { useEffect, useState } from 'react';

const quotes = [
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Simplicity is the ultimate sophistication.', author: 'Leonardo da Vinci' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  {
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
  },
];

export function QuoteCard() {
  const [quote, setQuote] = useState<(typeof quotes)[number] | null>(null);

  // Picked on mount (one quote per day) to avoid SSR/client hydration mismatch
  useEffect(() => {
    setQuote(quotes[new Date().getDate() % quotes.length]);
  }, []);

  return (
    <div className="rounded-md bg-black/25 backdrop-blur-md shadow-lg p-6 flex flex-col justify-center gap-3">
      <div
        className={`transition-opacity duration-700 ${quote ? 'opacity-100' : 'opacity-0'}`}
        style={{ fontFamily: 'var(--font-kalam)' }}
      >
        <p className="text-white/90 leading-relaxed">{quote?.text}</p>
        <p className="text-right text-white/85 font-semibold mt-3">
          - &quot; {quote?.author} &quot;
        </p>
      </div>
    </div>
  );
}

const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  return 'Stormy';
}

export function ClockCard() {
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState('Weather loading…');

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true'
    )
      .then((r) => r.json())
      .then((d) => {
        const t = Math.round(d.current_weather.temperature);
        setWeather(`Dhaka · ${weatherLabel(d.current_weather.weathercode)} ${t}°C`);
      })
      .catch(() => setWeather('Weather unavailable'));
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="rounded-md bg-black/25 backdrop-blur-md shadow-lg p-6 flex flex-col items-center justify-center gap-2 text-center">
      <p className="text-white/85 text-xs xl:text-sm tracking-wide whitespace-nowrap">
        {now
          ? `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} · ${weekdays[now.getDay()]}`
          : ' '}
      </p>
      <p
        className="text-3xl xl:text-4xl text-white tabular-nums"
        style={{ fontFamily: "'DSEG7', var(--font-audiowide), monospace" }}
      >
        {now ? `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}` : '--:--:--'}
      </p>
      <p className="text-white/70 text-sm tracking-wide whitespace-nowrap">{weather}</p>
    </div>
  );
}
