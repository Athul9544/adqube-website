import { useRef } from 'react'
import { motion, useScroll, useTransform, useMotionTemplate } from 'framer-motion'

/**
 * Softens a section's arrival and departure: the top edge dissolves in as the
 * section rises into view, the bottom edge dissolves out as it leaves.
 *
 * Both bands are driven straight off scroll progress rather than a triggered
 * animation, so scrolling back up plays the whole thing in reverse with no
 * state to unwind — the same rule the page hand-overs follow.
 *
 * The band is a pixel size, not a percentage: a percentage of a tall section
 * reads as a much softer edge than the same percentage of a short one.
 */
export default function EdgeFade({ children, band = 200, top: fadeTop = true }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })

  /* Full band while the section is still arriving, gone by the time it is
     properly on screen — and the mirror of that on the way out. The top band
     is switched off where a crossfade already covers the arrival; two
     treatments on the same edge read as a double exposure. */
  const top = useTransform(scrollYProgress, [0, 0.28], [fadeTop ? band : 0, 0])
  const bottom = useTransform(scrollYProgress, [0.72, 1], [0, band])

  const mask = useMotionTemplate`linear-gradient(to bottom, transparent 0px, #000 ${top}px, #000 calc(100% - ${bottom}px), transparent 100%)`

  return (
    <motion.div
      ref={ref}
      style={{ WebkitMaskImage: mask, maskImage: mask }}
    >
      {children}
    </motion.div>
  )
}
