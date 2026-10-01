import { useState } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../data'

/* The closing line reads as three distinct claims, so it's set as three. */
const PILLARS = [
  {
    title: 'Faster production.',
    lines: [
      'A finished ad in 48 to 72 hours — no shoot, no crew, no calls.',
      'Test an idea while it is still worth testing.',
    ],
  },
  {
    title: 'Better creative.',
    lines: [
      'AI carries the production; a human editor makes every call.',
      'Speed on the making, judgement on the work.',
    ],
  },
  {
    title: 'Smarter advertising.',
    lines: [
      'When a variant costs hours instead of weeks, testing stops being a luxury.',
      'The numbers pick the winner, not the loudest opinion.',
    ],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

/* One pillar, as a card that turns over to its explanation. Hover drives it on
   a pointer; tap does the same on touch, where there is no hover at all. The
   two faces are stacked absolutely, so the card needs a fixed height — sizing
   to content would collapse it to whichever face happened to be forward. */
function Pillar({ pillar, index }) {
  const [turned, setTurned] = useState(false)

  return (
    <motion.div
      variants={fadeUp}
      className="[perspective:1200px] h-[190px] md:h-[210px] cursor-pointer"
      onHoverStart={() => setTurned(true)}
      onHoverEnd={() => setTurned(false)}
      /* Only on touch: on a pointer the hover already drives it, and a click
         would toggle against the hover state and land the card face-down. */
      onTapStart={() => {
        if (!window.matchMedia('(hover: hover)').matches) setTurned((t) => !t)
      }}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: turned ? 180 : 0 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] bg-white rounded-2xl border border-line p-7 md:p-8 shadow-sm flex flex-col">
          <span className="font-mono text-[11px] tracking-widest text-jelly-deep">0{index + 1}</span>
          <p className="mt-4 font-serif text-xl md:text-2xl text-ink leading-snug">{pillar.title}</p>
          <span className="mt-auto block h-px w-10 bg-jelly" />
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-ink rounded-2xl border border-ink p-7 md:p-8 shadow-md flex flex-col justify-center gap-3">
          {pillar.lines.map((line) => (
            <p key={line} className="text-white/85 text-sm md:text-[15px] leading-relaxed">
              {line}
            </p>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/** "Why Ad Qube" — the positioning statement. */
export default function WhyAdQube() {
  return (
    <section
      aria-label="Why Ad Qube"
      className="relative py-20 md:py-28 px-6 md:px-12 lg:px-24 bg-paper border-t border-line overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-jelly/8 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[35vw] h-[35vw] bg-jelly-deep/5 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="lg:col-span-5">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">
                Why Ad Qube
              </span>
              <span className="h-px w-10 bg-jelly-deep/40" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-ink font-normal tracking-tight leading-tight">
              We don&rsquo;t just generate videos.{' '}
              <span className="text-jelly-deep">We build the story behind them.</span>
            </h2>
          </div>

          <div className="lg:col-span-7 lg:pt-3">
            {/* Lead line set as a pull-quote so it carries more than the body copy. */}
            <p className="border-l-2 border-jelly pl-5 md:pl-6 text-ink text-lg md:text-xl font-light leading-relaxed">
              Because great visuals need more than AI.
            </p>
            <p className="mt-7 text-body text-base md:text-lg leading-relaxed">
              AD QUBE STUDIO film starts with an idea and a clear creative direction. We shape the story, write the
              script, plan every scene, create the visual frames, and develop detailed prompts before bringing it all
              together through AI video production.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mt-16 md:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {PILLARS.map((pillar, i) => (
            <Pillar key={pillar.title} pillar={pillar} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
