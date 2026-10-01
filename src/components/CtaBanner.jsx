import { useEffect, useRef } from 'react'
import { motion, useScroll, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { armBridge, scrollForProgress } from './ScrollBackBridge'
import { armCurtain } from './PageCurtain'
import { runHandover, liveProgress, scrolledDown } from '../handover'
import { EASE } from '../data'

/* Scroll timeline for the sliding variant. Driven by scroll position alone, so
   the whole move reverses exactly when you scroll back up. */
const HOLD_END = 0.26 // the CTA sits still long enough to be read
const SLIDE_END = 0.82 // the incoming panel has fully taken over
/* Fires just after the slide lands, well before the pinned section releases.
   Leaving it any later lets the section unpin and the footer slide into view
   underneath before the hand-over happens. */
const LEAVE_AT = 0.86

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** The letterpress call to action itself, carved into the page. */
function Banner({ onStartProject, hint }) {
  const still = useReducedMotion()

  return (
    <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
      <div className="flex items-center gap-4 mb-10">
        <span className="h-px w-8 bg-jelly-deep/40" />
        <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">
          Ready When You Are
        </span>
        <span className="h-px w-8 bg-jelly-deep/40" />
      </div>

      <h2 className="emboss heading-800 uppercase text-5xl sm:text-6xl md:text-7xl lg:text-[6.5rem] leading-[0.92]">
        Turn Ideas
        <br />
        Into Ads
        <br />
        That Perform.
      </h2>

      <button
        onClick={onStartProject}
        className="group mt-14 md:mt-16 inline-flex items-center justify-center gap-2 bg-ink text-white hover:bg-ink/90 text-sm md:text-base font-semibold px-9 py-4 rounded-full transition-all shadow-lg active:scale-[0.98] cursor-pointer"
      >
        <span>Start a Project</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Only on the sliding variant. Everywhere else this section is followed
          by the footer, and the line would be pointing at nothing. */}
      {hint && (
        <motion.div
          className="mt-9 md:mt-11 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        >
          <span className="text-muted text-[10px] md:text-[11px] font-mono uppercase tracking-[0.28em]">
            Keep scrolling for work
          </span>
          {/* The bob lives on its own element: a looping `animate` and a
              `whileInView` on the same node fight for control and the gesture
              wins, so the fade-in would cancel the loop outright. */}
          <motion.span
            animate={still ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-jelly-deep" />
          </motion.span>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Closing call to action.
 *
 * With `slide`, it becomes a pinned horizontal transition: the CTA slides off
 * to the left while a dark panel arrives from the right, then the scroll
 * continues into the contact page. Everywhere else it renders as a plain
 * section.
 */
export default function CtaBanner({ onStartProject, slide, navigate }) {
  const section = useRef(null)
  const track = useRef(null)
  const left = useRef(null)
  const right = useRef(null)
  /* Starts disarmed. A freshly mounted section can measure as already past its
     own trigger before layout settles, which would fire the hand-over the
     instant the page loads; requiring a low reading first makes that
     impossible, since real scrolling always passes through it. */
  const fired = useRef(true)
  const retry = useRef(0)

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    if (!slide) return

    const onScroll = (p) => {
      const u = easeInOut(clamp01((p - HOLD_END) / (SLIDE_END - HOLD_END)))

      // The track carries both panels; -50% of a double-width track swaps them.
      if (track.current) track.current.style.transform = `translate3d(${(-50 * u).toFixed(3)}%, 0, 0)`

      /* Each panel's contents drift at a different rate from the track, which
         is what gives the swap depth instead of one flat sheet sliding. */
      if (left.current) {
        left.current.style.transform = `translate3d(${(-14 * u).toFixed(2)}%, 0, 0)`
        left.current.style.opacity = (1 - u * 0.85).toFixed(3)
      }
      // Nothing to parallax on the incoming side now — it is a plain field.

      /* Re-arms once the reader is clear of the trigger again. A plain
         fire-once guard is not enough here: this banner sits outside the route
         switch, so it never unmounts on navigation, and the guard would stay
         set for the rest of the session — the slide would work exactly once. */
      if (p < LEAVE_AT - 0.06) fired.current = false

      if (p >= LEAVE_AT && !fired.current && scrolledDown() && liveProgress(section.current) >= LEAVE_AT) {
        fired.current = true
        runHandover(() => {
          /* Come back mid-slide, not at the top of the section: landing before
             the animation starts means scrolling up replays nothing. */
          armBridge('/', '/works', scrollForProgress(section.current, 0.62))
          /* The slide ends on a full white field, so a white curtain over the
             swap is invisible — it just stops the hero video flashing through
             while the old page is briefly still mounted at scroll top. */
          armCurtain()
          navigate?.('/works')
        }, retry)
      }
    }

    onScroll(scrollYProgress.get())
    const unsub = scrollYProgress.on('change', onScroll)
    return () => {
      unsub()
      clearTimeout(retry.current)
    }
  }, [slide, scrollYProgress, navigate])

  if (!slide) {
    return (
      <section className="relative bg-white border-t border-line py-24 md:py-36 px-6 md:px-12 lg:px-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <Banner onStartProject={onStartProject} />
        </motion.div>
      </section>
    )
  }

  return (
    <section ref={section} className="relative border-t border-line" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen-safe overflow-hidden bg-white">
        {/* Double-width rail holding the two panels side by side. */}
        <div ref={track} className="absolute inset-y-0 left-0 flex w-[200%] will-change-transform">
          <div className="w-1/2 h-full flex items-center justify-center px-6 md:px-12 lg:px-24 bg-white">
            <div ref={left} className="w-full will-change-transform">
              <Banner onStartProject={onStartProject} hint />
            </div>
          </div>

          {/* Deliberately empty: the CTA wipes off to a clean white field and
              the hand-over follows immediately, so nothing else is read on the
              way to /works. */}
          <div ref={right} className="w-1/2 h-full bg-white" />
        </div>
      </div>
    </section>
  )
}
