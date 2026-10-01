import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MousePointer2, RotateCw } from 'lucide-react'
import { MediaImage } from './Media'
import WorkModal from './WorkModal'
import { useContent } from '../content'
import { EASE } from '../data'

/* A single row. 16 leaves small gaps between cards at the front and back of the
   ring while the sides foreshorten into a solid wall. */
const COUNT = 16
const STEP = 360 / COUNT

const BASE_SPEED = 11 // degrees per second at rest
const SCROLL_GAIN = 2.4 // how hard page scrolling pushes it
const MAX_BOOST = 900 // ceiling, so a flick cannot spin it into a blur
const DECAY = 0.94 // per frame, back down to BASE_SPEED

const WHEEL_GAIN = 2.2 // degrees/sec added per unit of wheel delta over the ring
const WHEEL_MAX = 1400 // ceiling on wheel-driven spin, signed
const WHEEL_DECAY = 0.9 // per frame, coasting to a stop after the wheel stops

/* Fraction of the scene's height, from the top, that counts as the head. The
   ring is anchored at 21% (see .vr-ring-anchor), so this covers the headset and
   the cards around it and stops around the shoulders. */
const HEAD_ZONE = 0.4
/* How far either side of centre still counts as the head. Without this the
   capture is vertical-only, so a pointer sitting at the far edge of the
   section — the top-left corner, say — reads as "over the head" and the page
   cannot be scrolled past this section at all. */
const HEAD_HALF_WIDTH = 0.22

/* Touch gets a wider catchment than the wheel: a fingertip is far less precise
   than a cursor, and on a phone the ring fills much more of the section. */
const TOUCH_ZONE = 0.55
const TOUCH_HALF_WIDTH = 0.44
const TOUCH_GAIN = 26 // degrees/sec of spin per px of drag

/**
 * The VR portrait with work covers orbiting the head.
 *
 * The wheel is split by where the pointer is: over the head the ring turns and
 * the page holds still; over the body the event is left alone and the page
 * scrolls on as normal.
 *
 * Rotation is driven in rAF rather than by a CSS animation: a keyframe
 * animation runs at a fixed rate, and there is no clean way to vary its speed
 * from scroll without restarting it and jumping the angle.
 */
export default function VrOrbit({ navigate, onStartProject }) {
  const { projects, posts, inOrbit } = useContent()
  const ring = useRef(null)
  const scene = useRef(null)
  /* The section owns its own modal so it can be dropped onto any page. */
  const [selected, setSelected] = useState(null)

  /* Keep the whole record, not just its image — a card has to know what it
     opens. Projects open the work modal, posts go to their article. */
  const covers = [
    ...projects.map((r) => ({ record: r, kind: 'project' })),
    ...posts.map((r) => ({ record: r, kind: 'post' })),
  ].filter((c) => c.record.image && inOrbit(c.kind, c.record.id))

  const open = (item) => {
    if (item.kind === 'project') setSelected(item.record)
    else navigate?.(`/blog/${item.record.slug}`)
  }

  useEffect(() => {
    if (!covers.length) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let angle = 0
    let boost = 0
    let wheel = 0 // signed: scrolling up spins the ring back the other way
    let lastY = window.scrollY
    let last = performance.now()
    let raf = 0
    let live = false

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      boost *= DECAY
      if (boost < 0.5) boost = 0
      wheel *= WHEEL_DECAY
      if (Math.abs(wheel) < 0.5) wheel = 0
      angle = (angle + (BASE_SPEED + boost + wheel) * dt) % 360
      if (ring.current) ring.current.style.transform = `rotateY(${angle}deg)`
      raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const dy = window.scrollY - lastY
      lastY = window.scrollY
      boost = Math.min(boost + Math.abs(dy) * SCROLL_GAIN, MAX_BOOST)
    }

    /* Wheel over the HEAD turns the ring instead of scrolling; over the body it
       falls through untouched so the page scrolls down. Must be a non-passive
       listener — preventDefault is ignored on a passive one, which is what
       React's onWheel gives you. Wheel events never fire from touch, so a phone
       still scrolls through this section normally. */
    const onWheel = (e) => {
      const box = el?.getBoundingClientRect()
      if (!box) return
      const y = (e.clientY - box.top) / box.height
      const x = (e.clientX - box.left) / box.width
      // Outside the head, vertically or horizontally: leave the page alone.
      if (y < 0 || y > HEAD_ZONE || Math.abs(x - 0.5) > HEAD_HALF_WIDTH) return

      e.preventDefault()
      const next = wheel + e.deltaY * WHEEL_GAIN
      wheel = Math.max(-WHEEL_MAX, Math.min(WHEEL_MAX, next))
    }

    /* Touch: a horizontal drag over the ring spins it, the same way the wheel
       does on a pointer. Wheel events never fire from touch, so without this a
       phone can only ever watch the ring turn by itself.

       The axis is decided once per gesture and then held. Deciding it per move
       event would let a diagonal drag flip between spinning and scrolling
       mid-gesture; committing on the first decisive sample means a drag that
       starts vertical stays a page scroll however it wanders after. */
    let startX = 0
    let startY = 0
    let lastX = 0
    let axis = null // null = undecided, 'x' = spinning, 'y' = let the page scroll

    const inTouchZone = (t) => {
      const box = el?.getBoundingClientRect()
      if (!box) return false
      const y = (t.clientY - box.top) / box.height
      const x = (t.clientX - box.left) / box.width
      /* Looser than the wheel's zone. A fingertip is far less precise than a
         cursor, and on a phone the ring fills much more of the section. */
      return y >= 0 && y < TOUCH_ZONE && Math.abs(x - 0.5) < TOUCH_HALF_WIDTH
    }

    const onTouchStart = (e) => {
      axis = null
      if (e.touches.length !== 1 || !inTouchZone(e.touches[0])) {
        axis = 'y'
        return
      }
      startX = lastX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const onTouchMove = (e) => {
      if (axis === 'y' || e.touches.length !== 1) return
      const t = e.touches[0]
      if (axis === null) {
        const dx = Math.abs(t.clientX - startX)
        const dy = Math.abs(t.clientY - startY)
        if (dx < 5 && dy < 5) return // too small to read yet
        axis = dx > dy ? 'x' : 'y'
        if (axis === 'y') return
      }
      e.preventDefault()
      const dx = t.clientX - lastX
      lastX = t.clientX
      /* Sign measured, not reasoned: with the ring's rotateZ roll and rotateX
         tilt in front of the spin, a positive angle carries the near cards to
         the RIGHT. Adding dx is what makes them follow the finger — subtracting
         it sent them the opposite way, measured at -205px for a rightward
         drag. */
      const next = wheel + dx * TOUCH_GAIN
      wheel = Math.max(-WHEEL_MAX, Math.min(WHEEL_MAX, next))
    }

    const onTouchEnd = () => {
      axis = null
    }

    /* Only animate while the section is on screen. */
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !live) {
          live = true
          last = performance.now()
          lastY = window.scrollY
          raf = requestAnimationFrame(tick)
        } else if (!e.isIntersecting && live) {
          live = false
          cancelAnimationFrame(raf)
        }
      },
      { rootMargin: '120px' },
    )
    const el = scene.current
    if (el) {
      io.observe(el)
      el.addEventListener('wheel', onWheel, { passive: false })
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      /* Non-passive: preventDefault is ignored on a passive listener, and
         without it the page scrolls underneath the spin. */
      el.addEventListener('touchmove', onTouchMove, { passive: false })
      el.addEventListener('touchend', onTouchEnd, { passive: true })
      el.addEventListener('touchcancel', onTouchEnd, { passive: true })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      io.disconnect()
      el?.removeEventListener('wheel', onWheel)
      el?.removeEventListener('touchstart', onTouchStart)
      el?.removeEventListener('touchmove', onTouchMove)
      el?.removeEventListener('touchend', onTouchEnd)
      el?.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [covers.length])

  if (!covers.length) return null

  const tiles = Array.from({ length: COUNT }, (_, i) => covers[i % covers.length])

  // No horizontal padding on the section: the band is wider than the portrait
  // and needs the full viewport on a phone. The heading carries its own.
  return (
    <section className="relative overflow-hidden bg-white py-20 md:py-28">
      {/* The band arcs well above the head, so the heading needs real
          clearance or the top row runs straight through it. */}
      <motion.div
        className="relative z-10 max-w-2xl mx-auto text-center mb-20 md:mb-32 px-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center justify-center gap-4 mb-5">
          <span className="h-px w-8 bg-jelly-deep/40" />
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">
            Inside the Work
          </span>
          <span className="h-px w-8 bg-jelly-deep/40" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ink font-normal tracking-tight leading-tight">
          Every idea, brought to life.
        </h2>
      </motion.div>

      {/* Wraps the scene so the hint can sit beside it. The scene keeps its own
          max-width and centring; this row is only a positioning context. */}
      <div className="vr-row relative z-10">
        <motion.div
          className="vr-hint"
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
        >
          {/* Two wordings, one per input. The ring takes the wheel on a pointer
              and a horizontal drag on touch, and telling a phone reader to
              scroll over it would be telling them to do the wrong thing — so
              the phone gets its own line rather than this one. */}
          <MousePointer2 className="vr-hint-icon w-3.5 h-3.5 text-jelly-deep shrink-0" />
          <span className="vr-hint-text">
            <span className="vr-hint-pointer">Scroll over the projects ring to spin the cards</span>
            {/* The phone wording. A drag, not a scroll — the ring takes a
                horizontal swipe on touch, and it is shorter because stacked
                above the ring there is no room for the long line. */}
            <span className="vr-hint-short">Scroll or drag to spin the cards</span>
          </span>
          {/* The turn sits on its own element: a looping animate and a
              whileInView on the same node fight for control and the gesture
              wins, cancelling the loop outright. */}
          <motion.span
            className="text-jelly-deep shrink-0"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </motion.span>
        </motion.div>

        <motion.div
          ref={scene}
          className="vr-scene relative z-10 mx-auto"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* The portrait lives INSIDE this preserve-3d stage, sitting at z=0
            through the ring's centre. That lets the browser depth-sort it
            against the tiles: the near half of the ring draws over the chest
            and shoulders, the far half draws behind the head. Painting the
            portrait on top instead would hide every card that passes in
            front. */}
        <div className="vr-stage">
          <div className="vr-ring-anchor">
            <div className="vr-ring" ref={ring}>
            {tiles.map((item, i) => (
              <div
                key={i}
                className="vr-tile"
                role="button"
                tabIndex={-1}
                aria-label={item.record.title}
                onClick={() => open(item)}
                style={{ transform: `rotateY(${STEP * i}deg) translateZ(var(--r))` }}
              >
                {/* Two faces. A single face with backface-visibility:hidden
                    would blank out the whole far half of the ring; a single
                    visible face would render that half mirrored. */}
                <MediaImage src={item.record.image} className="vr-face" loading="lazy" />
                <MediaImage src={item.record.image} className="vr-face vr-face-back" loading="lazy" />
              </div>
            ))}
            </div>
          </div>

          <img src="/vr-portrait.webp" alt="" className="vr-portrait" loading="lazy" decoding="async" />
          </div>
        </motion.div>
      </div>

      <WorkModal project={selected} onClose={() => setSelected(null)} onStartProject={onStartProject} />
    </section>
  )
}
