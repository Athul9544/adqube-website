import { useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { MediaImage, MediaVideo } from './Media'
import { useMediaKind } from '../media'
import { useContent } from '../content'
import { EASE } from '../data'

/* Five frames, deliberately off-grid: mixed aspect ratios, sizes, tilts and
   entry directions. `depth` drives the parallax — the further a frame is meant
   to sit from the reader, the less it travels. `hide` drops the two busiest
   ones on a phone, where five overlapping frames would crowd the type. */
const FRAMES = [
  {
    label: 'AI FILM',
    poster: '/dior_wide_chessboard.webp',
    video: '/hero.mp4',
    pos: 'left-[2%] top-[9%] md:left-[4%] md:top-[11%]',
    size: 'w-[30vw] max-w-[250px] aspect-[3/4]',
    labelPos: '-bottom-6 left-1',
    rot: -7,
    from: { x: -80, y: 26 },
    depth: 40,
  },
  {
    label: 'PRODUCT',
    poster: '/filbey_f8_burger.webp',
    video: '/adqube-hero.mp4',
    pos: 'right-[2%] top-[6%] md:right-[5%] md:top-[8%]',
    size: 'w-[38vw] max-w-[340px] aspect-[16/10]',
    labelPos: '-bottom-6 right-1',
    rot: 6,
    from: { x: 90, y: -30 },
    depth: 68,
  },
  {
    label: 'MOTION',
    poster: '/crimson_heritage_cover.webp',
    video: '/hero.mp4',
    pos: 'right-[6%] bottom-[7%] md:right-[13%] md:bottom-[8%]',
    size: 'w-[27vw] max-w-[222px] aspect-[3/4]',
    labelPos: '-top-6 left-1',
    rot: -5,
    from: { x: 70, y: 60 },
    depth: 26,
  },
  {
    label: 'STORY',
    poster: '/blog/speed.webp',
    video: '/adqube-hero.mp4',
    pos: 'left-[4%] bottom-[8%] md:left-[8%] md:bottom-[11%]',
    size: 'w-[35vw] max-w-[302px] aspect-[16/10]',
    labelPos: '-top-6 left-1',
    rot: 8,
    from: { x: -70, y: 70 },
    depth: 54,
  },
  {
    label: 'VISUALS',
    poster: '/blog/craft.webp',
    video: '/hero.mp4',
    pos: 'right-[1%] top-[28%] hidden md:block',
    size: 'w-[18vw] max-w-[168px] aspect-[3/4]',
    labelPos: '-bottom-6 right-1',
    rot: 12,
    from: { x: 60, y: -50 },
    depth: 84,
  },
]

/* Exported so the admin lists exactly the frames that exist, rather than a
   second hand-maintained copy that can drift out of step. */
export const PLAYGROUND_FRAMES = FRAMES.map((f) => ({ label: f.label, poster: f.poster, video: f.video }))

function Frame({ frame, progress, still, active, live, src, custom, onEnter, onLeave }) {
  const customKind = useMediaKind(custom)
  /* Each frame drifts at its own rate, so the group separates in depth as the
     section passes rather than sliding as one flat plane. */
  const y = useTransform(progress, [0, 1], [frame.depth, -frame.depth])
  const isOn = active === frame.label

  return (
    /* Two layers on purpose. The outer one carries the scroll parallax as a
       live MotionValue; the inner one animates its own y on entry. Put both on
       one element and they fight over the same transform, and the parallax
       wins — the frame never flies in at all.
       z-index sits on the outer element too: it has to outrank the sibling
       frames, which a value set inside one of them cannot do. */
    <motion.figure
      className={`absolute ${frame.pos} ${frame.size} m-0`}
      style={{
        ...(still ? {} : { y }),
        zIndex: isOn ? 30 : 10,
        /* These five never stop moving while the section is on screen — the
           parallax is tied to scroll position, so every frame is a new offset.
           Declaring that up front lets the compositor keep each one on its own
           layer and simply move it, instead of re-rasterising a mounted print
           with three stacked shadows on every tick. Measured at 37fps against
           55 with the frames hidden altogether, on a 4x-throttled desktop. */
        willChange: still ? undefined : 'transform',
      }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, x: frame.from.x, y: frame.from.y, rotate: frame.rot * 2.2, scale: 0.92 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: frame.rot, scale: 1 }}
        /* A fraction rather than a pixel margin. The section is taller than a
           phone screen, so frames sitting near its edges never clear a fixed
           inset and would stay invisible at their entry rotation. */
        viewport={{ once: true, amount: 0.25 }}
        /* A gesture rather than a second `animate`: two animate props on one
           element and the later simply wins, discarding the entrance. */
        whileHover={still ? undefined : { rotate: 0, scale: 1.07 }}
        transition={{ duration: 1.1, ease: EASE }}
        onHoverStart={() => onEnter(frame.label)}
        onHoverEnd={onLeave}
      >
        {/* A white matte around the image, the way a print is mounted. Against
            the cream ground it separates each frame from the section and from
            the frames behind it, which a bare bleed-to-edge crop never did.
            Three stacked shadows rather than one: a tight contact shadow to
            seat it, a mid layer for body, and a wide warm one that picks up
            the gold in the palette. */}
        <div
          className={`relative w-full h-full rounded-2xl bg-white p-[5px] transition-shadow duration-500 ${
            isOn
              ? 'shadow-[0_3px_6px_rgba(26,22,17,0.07),0_18px_34px_-12px_rgba(26,22,17,0.24),0_44px_80px_-30px_rgba(58,44,10,0.4)]'
              : 'shadow-[0_2px_4px_rgba(26,22,17,0.06),0_10px_22px_-10px_rgba(26,22,17,0.18),0_28px_54px_-26px_rgba(58,44,10,0.3)]'
          }`}
        >
          <div className="relative w-full h-full overflow-hidden rounded-[12px] bg-ink">
            {/* All five run continuously, but only while the section is on
                screen — five clips decoding in the background is a real cost
                for something nobody is looking at. The poster covers the gap
                before the first frame arrives, and stands in entirely under
                reduced-motion. */}
            {custom && customKind === 'image' ? (
              /* An image set from the admin replaces the clip entirely — it is
                 not a poster for a video that never arrives. */
              <MediaImage src={custom} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            ) : live && !still ? (
              <MediaVideo src={src} poster={frame.poster} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <img src={frame.poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Light falling across the print: a touch brighter at the top
                edge, deeper at the foot. Keeps flat-lit stills from reading as
                pasted-on rectangles. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-[12px] bg-gradient-to-b from-white/12 via-transparent to-black/20"
            />
            {/* Inner hairline — the thickness of the mount, seen from the
                inside. */}
            <span aria-hidden="true" className="absolute inset-0 rounded-[12px] ring-1 ring-inset ring-black/10" />
          </div>
        </div>

        <figcaption
          className={`absolute ${frame.labelPos} text-[9px] md:text-[10px] font-mono uppercase tracking-[0.22em] text-muted whitespace-nowrap`}
        >
          {frame.label}
        </figcaption>
      </motion.div>
    </motion.figure>
  )
}

/**
 * A visual break between the ordinary sections — frames scattered across open
 * cream, drifting at different rates, with the statement held in the middle.
 */
export default function CreativePlayground() {
  const section = useRef(null)
  const still = useReducedMotion()
  const [active, setActive] = useState(null)
  const [live, setLive] = useState(false)
  const { playground } = useContent()

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={section}
      className="relative bg-paper overflow-hidden px-6 py-32 md:py-44 min-h-[86vh] md:min-h-[104vh] flex items-center"
    >
      {/* Generous margin so playback is already running by the time the frames
          are properly on screen. */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        onViewportEnter={() => setLive(true)}
        onViewportLeave={() => setLive(false)}
        viewport={{ margin: '200px' }}
      />

      {FRAMES.map((f) => (
        <Frame
          key={f.label}
          frame={f}
          progress={scrollYProgress}
          still={still}
          active={active}
          live={live}
          src={playground[f.label] || f.video}
          custom={playground[f.label] || null}
          onEnter={setActive}
          onLeave={() => setActive(null)}
        />
      ))}

      {/* Sits above the frames and stays legible whatever drifts behind it. */}
      <motion.div
        className="relative z-20 mx-auto max-w-2xl text-center pointer-events-none"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 1, ease: EASE }}
      >
        <div className="flex items-center justify-center gap-4 mb-7">
          <span className="h-px w-10 bg-jelly-deep/40" />
          <span className="text-jelly-deep text-[10px] md:text-xs font-semibold tracking-[0.3em] uppercase font-mono">
            Created Differently
          </span>
          <span className="h-px w-10 bg-jelly-deep/40" />
        </div>

        <blockquote className="font-serif text-2xl sm:text-3xl md:text-[2.6rem] text-ink font-normal leading-[1.25] tracking-tight">
          &ldquo;Dreams and Ideas are always extraordinary.
          <br className="hidden sm:block" /> So should be your ads.&rdquo;
        </blockquote>
      </motion.div>
    </section>
  )
}
