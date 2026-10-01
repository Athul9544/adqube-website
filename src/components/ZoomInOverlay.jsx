import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../data'

const RUN = 900 // ms; the cover and the mark both finish together

/**
 * Arrival transition for a page reached from a full-screen mark.
 *
 * Covers the page with that same mark and pulls back off it, so a hand-over
 * from another page reads as one continuous move rather than a cut. It only
 * plays when the previous page left the flag behind, and clears the flag
 * immediately so a reload or a direct visit lands normally.
 */
export default function ZoomInOverlay({ flag = 'adqube.zoomFrom' }) {
  const [play, setPlay] = useState(false)
  const consumed = useRef(false)

  useEffect(() => {
    /* StrictMode runs this effect twice on mount. The first pass takes the flag
       and starts the timer, the cleanup cancels it, and a naive second pass
       would find the flag gone and bail — leaving the overlay mounted forever
       with nothing left to dismiss it. The ref remembers we already armed. */
    let armed = consumed.current
    if (!armed) {
      try {
        armed = sessionStorage.getItem(flag) === 'chat'
        if (armed) sessionStorage.removeItem(flag)
      } catch {
        /* private mode — no flag, no intro */
      }
      consumed.current = armed
    }
    if (!armed) return
    setPlay(true)
    /* Unmounts exactly when the animation ends. An AnimatePresence exit here
       would run a second fade after the element was already invisible, leaving
       it in the tree for twice as long. */
    const t = setTimeout(() => setPlay(false), RUN)
    return () => clearTimeout(t)
  }, [flag])

  if (!play) return null

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none chat-tile"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: RUN / 1000, ease: EASE }}
    >
      {/* Starts at the size the mark ended the previous page at, then falls
          back toward the launcher's scale as the cover clears. */}
      <motion.img
        src="/cube.png"
        alt=""
        width="256"
        height="256"
        className="object-contain"
        initial={{ width: 112, height: 112 }}
        animate={{ width: 28, height: 28 }}
        transition={{ duration: RUN / 1000, ease: EASE }}
      />
    </motion.div>
  )
}
