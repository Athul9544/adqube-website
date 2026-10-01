export default function Hero({ onStartProject }) {
  return (
    <div className="relative h-screen-safe w-full overflow-hidden bg-ink">
      {/* Full-bleed backplate */}
      {/* The poster is the point: this is the first thing on the page, and
          without one the hero was flat ink until the clip had downloaded.
          The still is a few KB and paints immediately, so the headline lands
          on the right picture and the video takes over when it is ready.
          It is a frame of this clip, not a separate picture — the old poster
          showed something else entirely, so the hero changed image the moment
          playback began. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-still.webp"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        {/* A phone is asked to download a phone-sized clip. The full encode is
            1600px wide, which is three times more pixels than a 390px screen
            can show and three times the bytes on the connection least able to
            afford them. The browser picks the first source whose media query
            matches, so the order here matters. */}
        <source src="/adqube-hero-sm.mp4" type="video/mp4" media="(max-width: 820px)" />
        <source src="/adqube-hero.mp4" type="video/mp4" />
      </video>

      {/* Scrim. The peak in the centre of frame is bright enough to swallow white
          type, so the middle is darkened as well as the top and bottom. */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-ink/80 via-ink/45 to-ink/85" />

      <section className="hero-fit relative z-20 h-screen-safe flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        <h1
          /* No nowrap: the previous headline was three short words and could
             hold one line at 5.5rem. This one is five times the length and
             would run off both edges — it wraps to two lines instead. */
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-5xl font-normal font-serif uppercase text-white animate-fade-rise"
          style={{ lineHeight: '0.95', letterSpacing: '-2.46px' }}
        >
          Transforming ideas into <em className="text-white/55 not-italic">cinematic brand experience.</em>
        </h1>

        <p className="text-sm sm:text-base max-w-4xl mt-8 leading-relaxed tracking-[0.16em] uppercase text-white/75 animate-fade-rise-delay font-sans">
          Premium cinematic AI advertising
        </p>

        <button
          onClick={onStartProject}
          className="rounded-full px-14 py-5 text-base mt-12 bg-white text-ink hover:scale-[1.03] transition-transform animate-fade-rise-delay-2 cursor-pointer font-medium shadow-lg"
        >
          Let&rsquo;s Create
        </button>
      </section>
    </div>
  )
}
