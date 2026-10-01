import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'

/**
 * Hands one full-width section over to the next without a seam.
 *
 * The incoming section is pulled up over the outgoing one by a negative
 * margin, so the two genuinely overlap in layout rather than merely abutting.
 * Across that overlap the outgoing section fades away while the incoming one
 * rises into place and comes up to full strength — by the time its top edge
 * reaches the top of the viewport the handover is finished, so there is never
 * a frame where a hard edge between the two is visible.
 *
 * Everything is derived from scroll position rather than triggered, so
 * scrolling back up plays the handover in reverse with nothing to unwind.
 */
export default function SectionCrossfade({ outgoing, incoming }) {
  const inRef = useRef(null)

  /* Measured on the static wrapper, never on the element that carries the
     rise: reading the rect of something you are also translating feeds the
     transform back into its own progress. */
  const { scrollYProgress } = useScroll({ target: inRef, offset: ['start end', 'start start'] })

  /* The outgoing section holds for a moment before it starts to go, so the
     two are both fully present at the top of the overlap. */
  const outOpacity = useTransform(scrollYProgress, [0.12, 0.74], [1, 0])

  /* Once it is more than half gone it must stop taking pointer events: the
     orbit ring above captures the wheel while the cursor is over it, and an
     invisible section doing that would feel like the page had jammed. */
  const outPointer = useTransform(scrollYProgress, (p) => (p > 0.5 ? 'none' : 'auto'))

  const inOpacity = useTransform(scrollYProgress, [0.05, 0.62], [0, 1])
  const inY = useTransform(scrollYProgress, [0, 0.88], [120, 0])

  /* The incoming section is an opaque panel, so while the outgoing one is
     still visible behind it its top edge cuts a straight line across the
     screen — the exact hard break the overlap is meant to avoid. Feathering
     that edge while the two coexist dissolves the seam; the band closes to
     nothing by the time the handover ends, so the finished section keeps a
     clean edge for everything below it. */
  const seam = useTransform(scrollYProgress, [0.1, 0.9], [320, 0])
  const inMask = useMotionTemplate`linear-gradient(to bottom, transparent 0px, #000 ${seam}px, #000 100%)`

  return (
    <div className="relative">
      <motion.div className="relative z-0" style={{ opacity: outOpacity, pointerEvents: outPointer }}>
        {outgoing}
      </motion.div>

      {/* Shallower on a phone, where the same fraction of the viewport is a
          far larger share of the section it is eating into. */}
      <div ref={inRef} className="relative z-10 -mt-[36vh] md:-mt-[60vh]">
        <motion.div style={{ opacity: inOpacity, y: inY, WebkitMaskImage: inMask, maskImage: inMask }}>
          {incoming}
        </motion.div>
      </div>
    </div>
  )
}
