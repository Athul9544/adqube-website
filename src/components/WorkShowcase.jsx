import { useRef } from 'react'
import { motion } from 'framer-motion'
import InkSurface from './InkSurface'
import { MediaVideo } from './Media'
import { useContent } from '../content'
import { useNearViewport } from '../useNearViewport'
import { EASE } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

/** "The Creative Stack" — video box wrapped in a cursor-reactive ink field. */
export default function WorkShowcase() {
  const box = useRef(null)
  /* Measured after layout rather than on the first frame — see the hook. The
     old `onViewportEnter` gate opened immediately on a page that had not sized
     its images yet, so this clip downloaded alongside the hero. */
  const videoLoaded = useNearViewport(box, '400px')
  const { stackVideo } = useContent()

  return (
    <section id="work" className="relative py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="relative z-10 max-w-3xl mb-16 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
        >
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase mb-4 block font-mono">
            The Creative Stack
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.1] font-normal tracking-tight">
            From idea to ad, in days.
          </h2>
        </motion.div>

        <motion.div
          ref={box}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
        >
          <InkSurface className="w-full">
            {/* Same treatment as the What We Make card: border-line hairline
                plus shadow-sm. */}
            <div className="skyArt relative w-full h-[60vh] sm:h-[68vh] min-h-[480px] sm:min-h-[560px] border border-line shadow-sm">
              <div className="skyVideo" style={{ pointerEvents: 'none' }}>
                {videoLoaded &&
                  (stackVideo ? (
                    /* Set from the admin. MediaVideo resolves an uploaded file
                       out of IndexedDB as well as a plain path. */
                    <MediaVideo src={stackVideo} className="absolute inset-0 w-full h-full object-cover z-0" />
                  ) : (
                    /* The bundled default. Audio is stripped from both encodes
                       — the element is muted and loops as a backdrop, so the
                       track was bytes nobody could ever hear. */
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                      poster="/stack_poster.webp"
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    >
                      {/* Phone-sized encode first, for the same reason as the
                          hero: the box is at most 390px wide on a phone. */}
                      <source src="/stack-sm.mp4" type="video/mp4" media="(max-width: 820px)" />
                      <source src="/stack.mp4" type="video/mp4" />
                    </video>
                  ))}
              </div>
            </div>
          </InkSurface>
        </motion.div>
      </div>
    </section>
  )
}
