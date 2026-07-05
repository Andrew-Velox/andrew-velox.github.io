import PixelJellyAvatar from "../../components/PixelJellyAvatar";

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

export default function About() {
  return (
    <div className="flex flex-col items-start justify-start gap-10 sm:gap-14 mt-8 sm:mt-12 text-white w-full max-w-3xl">
      {/* Profile row: image (left) + bio (right) */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-10 w-full">
        {/* Interactive Pixel Avatar (drag to squish & fling) */}
        <div className="flex-shrink-0">
          <PixelJellyAvatar src="/prof.png" size={180} />
        </div>

        {/* Profile text */}
        <div className="space-y-3 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Profile</h2>
          <p className="text-base sm:text-lg text-white/90">
            <span className="font-semibold">vlx / mohabbat</span>
            <span className="text-white/60"> 　モハバット</span>
          </p>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            I code something. /{' '}
            <span className="text-white/60">たまにコード書くよ。</span>
          </p>
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
        </div>
      </section>

      {/* Likes & Skills — full-width section under the profile row */}
      <section className="w-full">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Likes &amp; Skills</h3>
        <ul className="space-y-1.5 text-base sm:text-lg text-white/90">
          {likesSkills.map(([en, ja]) => (
            <li key={en}>
              <span className="font-medium text-white">{en}</span>
              <span className="text-white/60"> / {ja}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}