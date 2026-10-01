import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const SRC = '/spiderman.png'

/* Three overlapping periods that never divide evenly into one another. A single
   period reads as a metronome; letting the rig, the body and the stretch drift
   in and out of phase is what makes it look like physics. */
const RIG = 6.4 // the swing itself, pivoting where the web is anchored
const BODY = 7.9 // body lagging behind the web
const STRETCH = 4.7 // web taking up and giving back slack

/**
 * Spider-Man swinging from a web strand, pinned clear of the chat launcher in
 * the bottom-right corner.
 *
 * Purely decorative: it never takes pointer events, and it sits below the chat
 * widget so an open chat panel covers it rather than fighting it.
 */
export default function SpiderSwing() {
  const [ok, setOk] = useState(true)
  const still = useReducedMotion()

  /* Nothing to show if the artwork is missing — better an empty corner than a
     broken-image icon on a live site. */
  if (!ok) return null

  const swing = still
    ? {}
    : {
        rotate: [-7, 7],
        transition: {
          duration: RIG,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: 1.6, // hangs still for a moment before it starts
        },
      }

  const body = still
    ? {}
    : {
        rotate: [2.5, -2.5],
        transition: { duration: BODY, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1.6 },
      }

  const stretch = still
    ? {}
    : {
        scaleY: [1, 1.06],
        transition: { duration: STRETCH, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: 1.6 },
      }

  return (
    <div
      aria-hidden="true"
      className="hidden sm:block fixed bottom-0 right-24 z-40 pointer-events-none select-none w-[74px] md:w-[92px]"
    >
      <motion.div className="origin-top" animate={swing} initial={{ rotate: -7 }}>
        {/* Web strand. Scales from its top so the anchor point stays put. */}
        <motion.div
          className="mx-auto w-px h-14 md:h-20 origin-top bg-gradient-to-b from-ink/35 to-ink/15"
          animate={stretch}
          initial={{ scaleY: 1 }}
        />
        <motion.img
          src={SRC}
          alt=""
          onError={() => setOk(false)}
          className="w-full h-auto origin-top block drop-shadow-[0_10px_18px_rgba(26,22,17,0.18)]"
          animate={body}
          initial={{ rotate: 2.5 }}
        />
      </motion.div>
    </div>
  )
}
