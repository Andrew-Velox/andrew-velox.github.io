import { useState, useEffect } from 'react';
import PixelJellyAvatar from './PixelJellyAvatar';
import FadeIn from './FadeIn';

const likesSkills: Array<[string, string]> = [
  ['Clouds', 'くも'],
  ['Pixel Art', 'ドット絵'],
  ['Designing', 'デザイン'],
  ['Programming', 'プログラミング'],
  ['System Devlopment', 'システム開発'],
  ['Computer Science', '計算機科学'],
  ['Computer Graphics', 'コンピュータグラフィックス'],
  ['Game Development', 'ゲーム開発'],
  ['Competitive Programming', '競技プログラミング'],
];

export default function AboutContent() {
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    const onReplay = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail || detail.path === '/about') {
        setReplayKey((k) => k + 1);
      }
    };
    const onSwap = () => setReplayKey((k) => k + 1);

    window.addEventListener('replay-animations', onReplay);
    document.addEventListener('astro:after-swap', onSwap);
    return () => {
      window.removeEventListener('replay-animations', onReplay);
      document.removeEventListener('astro:after-swap', onSwap);
    };
  }, []);

  return (
    <div
      key={replayKey}
      className="flex flex-col items-start justify-start gap-10 sm:gap-14 mt-8 sm:mt-12 text-white w-full max-w-3xl"
    >
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10 w-full">
        <div className="flex-shrink-0">
          <PixelJellyAvatar src="/prof.png" size={180} />
        </div>

        <div className="space-y-3 text-center sm:text-left">
          <FadeIn direction="left" delay={150} duration={700}>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Profile</h2>
          </FadeIn>
          <FadeIn direction="left" delay={250} duration={700}>
            <p className="text-base sm:text-lg text-white/90">
              <span className="font-semibold">vlx / mohabbat</span>
              <span className="text-white/60"> 　モハバット</span>
            </p>
          </FadeIn>
          <FadeIn direction="left" delay={350} duration={700}>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed">
              I code something. / <span className="text-white/60">たまにコード書くよ。</span>
            </p>
          </FadeIn>
          <FadeIn direction="left" delay={450} duration={700}>
            <p className="text-base sm:text-lg text-white/90 leading-relaxed pt-2">
              I’m Mohabbat — on some platforms you might know me as Andrew Velox. I like to keep my identity a bit hidden, so I use this kind of random made-up name. {'[>_<]'}
              <br />
              I’m currently pursuing my BSc in Computer Science and Engineering at{' '}
              <a
                href="https://www.green.edu.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-400 hover:text-green-300 transition-colors duration-200"
              >
                Green University of Bangladesh
              </a>
              .
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="w-full">
        <FadeIn direction="left" delay={600} duration={700}>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Likes &amp; Skills</h3>
        </FadeIn>
        <ul className="space-y-1.5 text-base sm:text-lg text-white/90">
          {likesSkills.map(([en, ja], i) => (
            <FadeIn key={en} direction="left" delay={700 + i * 80} duration={600}>
              <li>
                <span className="font-medium text-white">{en}</span>
                <span className="text-white/60"> / {ja}</span>
              </li>
            </FadeIn>
          ))}
        </ul>
      </section>
    </div>
  );
}