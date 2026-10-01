import { useEffect, useRef, useState } from 'react'
import { useScroll } from 'framer-motion'
import { Calendar, Clock } from 'lucide-react'
import { MediaImage } from './Media'
import { armBridge, scrollForProgress } from './ScrollBackBridge'
import { setVar, setStyle } from '../styleWrite'
import { armCurtain } from './PageCurtain'
import { runHandover, liveProgress, scrolledDown } from '../handover'
import WorksBackdrop from './WorksBackdrop'

/* Scroll timeline. Every phase is driven by scroll position alone, so the whole
   sequence reverses exactly when you scroll back up. */
/* The cards finish earlier than they used to, and the panel opens sooner, to
   free up the last third of the section for the closing statement. It used to
   get 5% of the timeline, which was over before it could be read. */
const WALK_END = 0.62 // every article, then the chat tile, has been centred
const OPEN_AT = 0.76 // the chat mark has filled the screen
const LEAVE_AT = 0.97 // hand over to the contact page

/* The light sweeping across the closing word gets its own window rather than
   riding --k. --k is eased and spends almost all of its travel in the first
   part of the opening, so a sweep tied to it is finished before the word is
   even at full size. This runs from the point the word is readable to just
   short of the hand-over, which is the whole time anyone is looking at it. */
/* Starts only once the cover has finished parting, not before it.
   Overlapping the two meant the ripple made its pass over the right-hand
   letters while the two halves were still closed across the word — so by the
   moment the word was fully uncovered the wave had already travelled 60% of
   the way and "DO IT" had never been seen to animate at all. */
const SWEEP_FROM = 0.79
const SWEEP_TO = 0.93

/* The cover parts to expose the word, driven by GSAP with scrub. */
const PART_FROM = 0.755
const PART_TO = 0.85

/* Peak displacement of the liquid-glass band, in px. Enough to bend a letter
   convincingly; much beyond this and the glyphs stop being readable through
   the glass, which defeats the point. */
const GLASS_PEAK = 22

/* The word again, one entry per character, for the per-letter glow. Split out
   here so the array is stable across renders. */
const LETTERS = "LET'S DO IT".split('')

/* How far either side of the wave, as a percentage of the word's width, a
   letter still catches light. Close to the glass band's own half-width so the
   glow belongs to the wave rather than trailing it. */
const GLOW_REACH = 28

/* Share of each card's slice of scroll spent parked at the centre before it
   hands on — this is what makes them arrive one by one rather than sliding. */
const HOLD = 0.42

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * Coverflow rail driven by page scroll. Cards ride the near face of a cylinder:
 * the centre one faces the viewer square-on and closest, its neighbours turn
 * away and recede. Scrolling walks the centre from the first article to the
 * last, then to a closing chat tile which opens full-screen and continues into
 * the contact page.
 */
export default function BlogCarousel({ posts, navigate }) {
  const section = useRef(null)
  const stage = useRef(null)
  const panel = useRef(null)
  const coverTop = useRef(null)
  const coverBottom = useRef(null)
  const turb = useRef(null)
  const disp = useRef(null)
  const light = useRef(null)
  const lens = useRef(null)
  const letters = useRef([])
  /* Each letter's centre as a percentage of the word's width. Measured once
     and on resize rather than per frame: reading offsetLeft for eleven spans
     every scroll tick forces a layout each time. */
  const centres = useRef([])
  const cards = useRef([])
  // Starts disarmed — see CtaBanner for why.
  const fired = useRef(true)
  const retry = useRef(0)
  const [narrow, setNarrow] = useState(false)

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })

  /* GSAP drives the closing statement's cover, scrubbed against this section's
     own scroll range.
     No `pin` here on purpose: the section already pins itself with a sticky
     box, and ScrollTrigger's pin reparents the node into a spacer it inserts —
     which React then cannot remove on navigation. Scrub without pin adds no
     DOM of its own, so the two systems stay out of each other's way. */
  useEffect(() => {
    const el = section.current
    if (!el) return

    let ctx
    let killed = false

    ;(async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
      if (killed || !section.current) return
      gsap.registerPlugin(ScrollTrigger)

      ctx = gsap.context(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduced) {
          gsap.set([coverTop.current, coverBottom.current], { autoAlpha: 0 })
          return
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            /* true, not a number. A numeric scrub eases toward the scroll
               position, so the cover trails the light — which is driven
               straight off scroll position with no easing at all. Measured at
               up to 53px of lag mid-part, showing as the two halves arriving
               late on the way back up. */
            scrub: true,
            invalidateOnRefresh: true,
          },
        })

        /* The halves part between PART_FROM and PART_TO, keeping the tile
           sealed while the cards are still walking past underneath.

           The trailing pad is load-bearing, not decoration. ScrollTrigger maps
           scroll progress 0–1 onto the timeline's *own* duration, so a timeline
           that happens to end at 0.85 makes every position label mean something
           0.85× smaller than the scroll fraction it was written as. Pinning the
           end to 1 makes the labels above absolute. Without it the cover sat
           half-parted at scroll 0.93 — measured -94px where it should have been
           fully open at -454. */
        tl.to(coverTop.current, { yPercent: -100, ease: 'power2.inOut', duration: PART_TO - PART_FROM }, PART_FROM)
        tl.to(coverBottom.current, { yPercent: 100, ease: 'power2.inOut', duration: PART_TO - PART_FROM }, PART_FROM)
        tl.to({}, { duration: 0.001 }, 1)
      }, section)

      /* Media above this section settles late and changes its offset; without a
         refresh the trigger is measured against a page that has since grown.
         The timed ones matter most on a back-navigation, where the bridge drops
         the reader into the middle of this section and re-seeks the scroll over
         several frames while the page is still mounting. */
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      document.fonts?.ready?.then(() => ScrollTrigger.refresh())
      const t1 = setTimeout(() => ScrollTrigger.refresh(), 250)
      const t2 = setTimeout(() => ScrollTrigger.refresh(), 900)
      ctx.add(() => {
        window.removeEventListener('load', onLoad)
        clearTimeout(t1)
        clearTimeout(t2)
      })
    })()

    return () => {
      killed = true
      ctx?.revert()
    }
  }, [])

  /* Where each glyph sits along the word, so the glow can be matched to the
     same wave position the glass mask uses. Re-measured on resize because the
     word is sized in vw and every letter moves with it. */
  useEffect(() => {
    const measure = () => {
      const first = letters.current[0]
      const row = first?.parentElement
      if (!row) return
      const w = row.offsetWidth || 1
      centres.current = letters.current.map((el) => (el ? ((el.offsetLeft + el.offsetWidth / 2) / w) * 100 : 0))
    }
    measure()
    const ro = new ResizeObserver(measure)
    const row = letters.current[0]?.parentElement
    if (row) ro.observe(row)
    document.fonts?.ready?.then(measure)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // The rail is articles only; the chat mark takes over once they are done.
  const n = posts.length

  useEffect(() => {
    if (n < 2) return
    const last = n - 1

    const walkTo = (u) => {
      const seg = clamp01(u) * last
      const i = Math.min(Math.floor(seg), last - 1)
      const f = seg - i
      if (f <= HOLD) return i
      return i + easeInOut((f - HOLD) / (1 - HOLD))
    }

    const onScroll = (p) => {
      const pos = walkTo(p / WALK_END)

      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const d = i - pos
        /* Clamped well short of edge-on: the CSS multiplies this by 30deg, and
           letting it run to the fade distance would rotate a card past 90 and
           show its back. */
        const turn = Math.max(-1.55, Math.min(1.55, d))
        const t = Math.max(0, 1 - Math.abs(d) / 3.2)
        setVar(el, '--d', d.toFixed(3))
        setVar(el, '--turn', turn.toFixed(3))
        setVar(el, '--t', t.toFixed(3))
        /* z-index is layer-affecting: assigning it at all makes the compositor
           recompute the layer tree, even when the value has not changed. */
        setStyle(el, 'zIndex', String(Math.round(100 - Math.abs(d) * 10)))
      }

      // The rail clears out so the opening mark has the screen to itself.
      const fade = 1 - clamp01((p - (WALK_END + 0.02)) / 0.1)
      setStyle(stage.current, 'opacity', fade.toFixed(3))

      /* k: 1 = still the size of a card, 0 = filling the screen. Eased, so it
         leaves the card shape gently rather than at a constant rate. */
      const raw = clamp01((p - WALK_END) / (OPEN_AT - WALK_END))
      const sweep = clamp01((p - SWEEP_FROM) / (SWEEP_TO - SWEEP_FROM))
      if (panel.current) {
        setVar(panel.current, '--k', (1 - easeInOut(raw)).toFixed(4))
        setVar(panel.current, '--sweep', sweep.toFixed(4))
        // Near-instant: at k=1 the panel matches the tile beneath it exactly.
        setStyle(panel.current, 'opacity', clamp01((p - WALK_END) / 0.015).toFixed(3))
        /* The panel takes the pointer once the word owns the screen. It is
           pointer-events: none at rest, so hit-testing over the letters falls
           straight through to the article cards parked behind them — and the
           custom cursor, which reads e.target.closest('a, button'), swelled
           into its filled hover blob over parts of the word. Owning the
           pointer here means the target is the panel, so the cursor stays the
           plain ring the whole way across. The cards are faded out by this
           point, so nothing under it is still meant to be clickable. */
        panel.current.style.pointerEvents = raw > 0.55 ? 'auto' : 'none'
      }

      /* The glass, driven off the same scroll progress as its mask so the
         distortion and the band can never drift apart.

         Displacement follows a parabola: nothing at either end of the travel,
         strongest in the middle. At the ends the band is off the word anyway,
         and leaving the filter running there would wobble the empty region for
         no reason. */
      if (disp.current) {
        disp.current.setAttribute('scale', (GLASS_PEAK * 4 * sweep * (1 - sweep)).toFixed(2))
      }
      /* The noise field creeps as the band travels, so the surface is moving
         water rather than one frozen pattern sliding across. */
      if (turb.current) {
        turb.current.setAttribute(
          'baseFrequency',
          `${(0.005 + sweep * 0.004).toFixed(4)} ${(0.014 + sweep * 0.006).toFixed(4)}`
        )
      }
      /* The sheen rides with the band. fePointLight is in the filter's user
         space, which for an HTML element is its own border box in px — hence
         measuring the lens rather than using a percentage. */
      if (light.current && lens.current) {
        const w = lens.current.offsetWidth
        const h = lens.current.offsetHeight
        light.current.setAttribute('x', ((1.25 - sweep * 1.5) * w).toFixed(1))
        light.current.setAttribute('y', (h * 0.42).toFixed(1))
      }

      /* The per-letter glow, reading the same wave position as the glass mask
         so the light and the refraction arrive on a letter together. Each
         glyph gets its own distance from the wave, which is what makes the
         light spread around the letters one at a time rather than lifting the
         whole line at once. */
      const wavePct = 125 - sweep * 150
      for (let i = 0; i < letters.current.length; i++) {
        const el = letters.current[i]
        if (!el) continue
        const near = Math.max(0, 1 - Math.abs((centres.current[i] ?? 0) - wavePct) / GLOW_REACH)
        /* Smoothstep: a linear ramp makes each letter come up and drop off at
           a constant rate, which reads as switching rather than lighting. */
        setVar(el, '--a', (near * near * (3 - 2 * near)).toFixed(3))
      }

      // Re-arms once clear of the trigger, so scrolling back up and forward
      // again replays the hand-over instead of doing nothing.
      if (p < LEAVE_AT - 0.06) fired.current = false

      if (p >= LEAVE_AT && !fired.current && scrolledDown() && liveProgress(section.current) >= LEAVE_AT) {
        fired.current = true
        runHandover(() => {
          armCurtain()
          /* Land inside the closing statement, not before it. 0.6 was chosen
             when the closing tile occupied 0.92–0.97; the statement now starts
             at 0.755, so coming back to 0.6 dropped the reader in front of the
             whole sequence and scrolling up replayed nothing of it. 0.93 is
             past the sweep and short of LEAVE_AT, so pulling up runs the light
             back across the word and closes the cover behind it. */
          armBridge('/blog', '/contact', scrollForProgress(section.current, 0.93))
          /* Tells the contact page to open by pulling back from the same mark,
             so the two pages read as one continuous move. */
          try {
            sessionStorage.setItem('adqube.zoomFrom', 'chat')
          } catch {
            /* private mode — the contact page just skips its intro */
          }
          navigate?.('/contact')
        }, retry)
      }
    }

    onScroll(scrollYProgress.get())
    const unsub = scrollYProgress.on('change', onScroll)
    return () => {
      unsub()
      clearTimeout(retry.current)
    }
  }, [n, scrollYProgress, navigate])

  if (!posts.length) return null

  return (
    /* Taller than the cards alone need. The extra height is what the closing
       statement spends: the same fraction of the timeline is more pixels of
       scroll, so the ripple crosses the word at a readable pace instead of
       flicking past. */
    <section ref={section} className="relative" style={{ height: `${140 + n * 48}vh` }}>
      <div className="sticky top-0 h-screen-safe overflow-hidden bg-white flex flex-col">
        {/* Second plate, feathered at the top so the join with the page header
            has no visible seam. */}
        <WorksBackdrop src="/blog-bg-2.webp" decor={false} fade="top" />

        <div className="relative z-10 pt-24 md:pt-28 pb-2 px-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-jelly-deep/40" />
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">
              Latest Writing
            </span>
            <span className="h-px w-8 bg-jelly-deep/40" />
          </div>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-ink font-normal tracking-tight">
            Notes from the edit bay.
          </h2>
        </div>

        <div ref={stage} className="flow-stage relative z-10 flex-grow">
          {posts.map((post, i) => (
            <button
              key={post.id}
              ref={(el) => (cards.current[i] = el)}
              onClick={() => navigate?.(`/blog/${post.slug}`)}
              className="flow-card slab"
              aria-label={post.title}
            >
              <div className="relative w-full h-full bg-ink">
                <MediaImage
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />

                {post.tag && (
                  <span className="absolute top-3 left-3 rounded-full bg-jelly text-ink px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-mono">
                    {post.tag}
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-left">
                  <h3 className="text-white font-bold leading-snug text-sm md:text-base line-clamp-3">{post.title}</h3>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-white/65">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

        </div>
      </div>

      {/* Grows out of the chat launcher in the corner until it owns the screen,
          then hands over to /contact. Fixed rather than inside the pinned box
          so the circle is anchored to the launcher's real viewport position. */}
      <div ref={panel} className="chat-zoom chat-tile" aria-hidden="true">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-6 overflow-hidden">
          {/* The full lockup, not the bare cube. It is 4.25:1, so it cannot
              use .chat-mark — that class sizes a square and would squash it. */}
          <img src="/lockup.webp" alt="" width="973" height="229" className="statement-lockup object-contain" />

          {/* \u2500\u2500 The liquid-glass filter \u2500\u2500
              feTurbulence at two scales: the low-frequency octaves bend the
              letters in broad sweeps, which is the lens, and the finer ones
              add the surface chop. feSpecularLighting off the blurred alpha
              puts a moving sheen on the warped shape \u2014 that highlight is what
              reads as a glossy surface rather than a smudge. The point light
              tracks the band, so the sheen travels with the glass. */}
          <svg width="0" height="0" aria-hidden="true" className="absolute pointer-events-none">
            <filter id="liquid-glass" x="-30%" y="-45%" width="160%" height="190%" colorInterpolationFilters="sRGB">
              <feTurbulence
                ref={turb}
                type="fractalNoise"
                baseFrequency="0.005 0.014"
                numOctaves="3"
                seed="4"
                result="noise"
              />
              <feDisplacementMap
                ref={disp}
                in="SourceGraphic"
                in2="noise"
                scale="0"
                xChannelSelector="R"
                yChannelSelector="G"
                result="warped"
              />
              <feGaussianBlur in="warped" stdDeviation="3" result="soft" />
              <feSpecularLighting
                in="soft"
                surfaceScale="5"
                specularConstant="0.85"
                specularExponent="24"
                lightingColor="#fff6e2"
                result="spec"
              >
                <fePointLight ref={light} x="0" y="0" z="70" />
              </feSpecularLighting>
              {/* Clipped to the glass itself, so the sheen never spills past
                  the letters it belongs to. */}
              <feComposite in="spec" in2="warped" operator="in" result="sheen" />
              <feComposite in="sheen" in2="warped" operator="over" />
            </filter>
          </svg>

          {/* Two copies of the same word: the plain text with a hole where the
              glass is, and the glass itself. See the .statement-* rules. */}
          <span className="statement-stack">
            {/* The travelling light, one span per glyph so each letter haloes
                its own outline instead of the word lighting as one block.

                It sits behind, unmasked, and deliberately so: the base copy
                carries a hole where the glass is, and a mask clips its
                children's shadows along with them — glow put there would go
                dark exactly where the wave is. Behind and unmasked, its glyphs
                are covered by the two layers above while the shadows spill
                past the outlines and show. */}
            <p className="statement-word statement-glow heading-800 uppercase leading-none" aria-hidden="true">
              {LETTERS.map((ch, i) => (
                <span
                  key={i}
                  ref={(el) => (letters.current[i] = el)}
                  /* The spaces are still spans — the glow needs their position
                     to space the wave correctly — but they are not letters, so
                     they do not take the pointer. The ring drops back to its
                     resting size between the words, the way it does between
                     two links in the nav bar. */
                  className={ch === ' ' ? 'statement-letter statement-gap' : 'statement-letter'}
                >
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </p>
            <p className="statement-word statement-base heading-800 uppercase leading-none">LET&apos;S DO IT</p>
            <span className="statement-warp" aria-hidden="true">
              <p ref={lens} className="statement-word statement-lens heading-800 uppercase leading-none">
                LET&apos;S DO IT
              </p>
            </span>
          </span>

          {/* Two halves that part to expose the word, as the reference does.
              Above the content, pointer-events-none, so they never intercept
              anything on the way past. */}
          <div ref={coverTop} className="statement-cover statement-cover-top" />
          <div ref={coverBottom} className="statement-cover statement-cover-bottom" />
        </div>
      </div>
    </section>
  )
}
