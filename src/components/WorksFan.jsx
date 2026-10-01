import { useEffect, useRef } from 'react'
import { useScroll } from 'framer-motion'
import { Play, ArrowDown } from 'lucide-react'
import { MediaImage, MediaVideo } from './Media'
import { armBridge, scrollForProgress } from './ScrollBackBridge'
import { setVar, setStyle } from '../styleWrite'
import { armCurtain } from './PageCurtain'
import { runHandover, liveProgress, scrolledDown } from '../handover'
import WorksBackdrop from './WorksBackdrop'

const STEP = 16 // degrees between neighbouring cards once fully fanned

/* Scroll timeline. Every phase is driven by scroll position alone, so the whole
   sequence reverses exactly when you scroll back up. */
const SPREAD_END = 0.2 // fan has opened from the stack
const WALK_END = 0.72 // every card has taken its turn at the centre
const OPEN_AT = 0.9 // closing card has filled the screen
const LEAVE_AT = 0.97 // hand over to the blog

/* Degrees from centre over which a card drains to monochrome. Kept close to
   STEP so the immediate neighbours are already largely grey — that colour gap
   between the centre card and the rest is the whole effect. */
const FALLOFF = 20

/* Share of each card's slice of scroll spent parked at the centre before it
   hands on. Without a hold the deck slides continuously and no single card ever
   reads as "the one"; this is what makes them arrive one by one. */
const HOLD = 0.45

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/**
 * The works deck: every project fanned around a circle whose hub sits below the
 * frame, plus a closing name-only card as the last member of the group.
 *
 * Scrolling opens the fan from a single stacked card. Once open the deck cycles
 * by itself — each card swings up to the centre, straightens to 0deg and gains
 * colour while the outgoing one tilts away and drains to grey. Scrolling on
 * turns the deck to the closing card, opens it to full screen, and continues
 * into the blog.
 */
export default function WorksFan({ projects, onSelect, navigate }) {
  const section = useRef(null)
  const fan = useRef(null)
  const cards = useRef([])
  const panel = useRef(null)
  // Starts disarmed — see CtaBanner for why.
  const fired = useRef(true)
  const retry = useRef(0)

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ['start start', 'end end'],
  })

  // The closing card rides in the deck as its last member, not as a separate
  // section, so the group reads as one hand of cards.
  const tiles = [...projects.map((p) => ({ project: p })), { outro: true }]
  const count = tiles.length

  useEffect(() => {
    const n = count
    if (n < 2) return
    const last = n - 1
    const mid = (n - 1) / 2

    /* Which card is at the centre, as a float, for a given walk progress.
       Each card owns an equal slice; it sits still for the first HOLD of its
       slice, then eases across to the next. */
    const walkTo = (u) => {
      const seg = clamp01(u) * last
      const i = Math.min(Math.floor(seg), last - 1)
      const f = seg - i
      if (f <= HOLD) return i
      return i + easeInOut((f - HOLD) / (1 - HOLD))
    }

    const onScroll = (p) => {
      const spread = clamp01(p / SPREAD_END)
      /* Card 0 holds the centre for the whole opening, so the deck unfolds
         outward from the first project. Easing from the middle instead would
         drift the centre across a neighbour and back before the walk begins. */
      const pos = spread < 1 ? 0 : walkTo((p - SPREAD_END) / (WALK_END - SPREAD_END))
      const spin = -(pos - mid) * STEP * spread

      // Cards give way to the closing panel rather than sitting behind it.
      const fade = 1 - clamp01((p - (WALK_END + 0.02)) / 0.1)
      setStyle(fan.current, 'opacity', fade.toFixed(3))

      for (let i = 0; i < n; i++) {
        const el = cards.current[i]
        if (!el) continue
        const a = (i - mid) * STEP * spread + spin
        const t = Math.max(0, 1 - Math.abs(a) / FALLOFF)
        setVar(el, '--a', a.toFixed(2))
        setVar(el, '--t', t.toFixed(3))
        /* Nearest the centre paints on top. The `- i` breaks ties by index,
           which matters at spread 0: every card is at angle 0 there, and
           without it DOM order wins and the single card on show is the LAST
           tile rather than the first.

           Through setStyle because z-index is layer-affecting: assigning it
           makes the compositor recompute the layer tree even when the value is
           the same one it already had, and the order here only actually
           changes on a handful of the frames in a pass. */
        setStyle(el, 'zIndex', String(Math.round(1000 - Math.abs(a) * 10) - i))
      }

      /* k: 1 = closing card still card-sized, 0 = filling the screen. Eased,
         so it leaves the card shape gently and settles into full screen
         instead of arriving at a constant rate. */
      const raw = clamp01((p - WALK_END) / (OPEN_AT - WALK_END))
      if (panel.current) {
        setVar(panel.current, '--k', (1 - easeInOut(raw)).toFixed(4))
        /* Near-instant: at k=1 the panel is the same size, shape and colour as
           the card beneath it, so the swap is invisible. Fading it in earlier
           would show two stacked copies of the same card. */
        setStyle(panel.current, 'opacity', clamp01((p - WALK_END) / 0.015).toFixed(3))
      }

      // Re-arms once clear of the trigger, so scrolling back up and forward
      // again replays the hand-over instead of doing nothing.
      if (p < LEAVE_AT - 0.06) fired.current = false

      if (p >= LEAVE_AT && !fired.current && scrolledDown() && liveProgress(section.current) >= LEAVE_AT) {
        fired.current = true
        runHandover(() => {
          /* Inside the closing card's opening, not back among the fanned cards.
             At 0.6 the reader landed before OPEN_AT (0.9) entirely, so the card
             filling the screen — the part they just watched — never played
             back. 0.94 sits inside it and short of LEAVE_AT. */
          armBridge('/works', '/blog', scrollForProgress(section.current, 0.94))
          armCurtain()
          navigate?.('/blog')
        }, retry)
      }
    }

    onScroll(scrollYProgress.get())
    return scrollYProgress.on('change', onScroll)
  }, [count, scrollYProgress, navigate])

  if (!projects.length) return null

  return (
    <section ref={section} className="relative" style={{ height: '320vh' }}>
      <div className="sticky top-0 h-screen-safe overflow-hidden bg-white flex flex-col">
        {/* Second plate, feathered at the top so the join with the page header
            has no visible seam. */}
        <WorksBackdrop plate={2} decor={false} fade="top" />

        <div className="relative z-10 pt-24 md:pt-28 pb-2 px-6 text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-jelly-deep/40" />
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">Our Works</span>
            <span className="h-px w-8 bg-jelly-deep/40" />
          </div>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-ink font-normal tracking-tight">
            Every project, front and centre.
          </h2>
        </div>

        <div ref={fan} className="fan relative z-10 flex-grow">
          {tiles.map((tile, i) =>
            tile.outro ? (
              <div key="outro" ref={(n) => (cards.current[i] = n)} className="fan-card slab" aria-hidden="true">
                <div className="relative w-full h-full bg-[linear-gradient(150deg,#221c14_0%,#1a1611_45%,#100d09_100%)] flex flex-col items-center justify-center">
                  <p className="heading-800 text-white text-2xl leading-none tracking-tighter">AD QUBE</p>
                </div>
              </div>
            ) : (
              <button
                key={tile.project.id}
                ref={(n) => (cards.current[i] = n)}
                onClick={() => onSelect(tile.project)}
                className="fan-card slab group"
                aria-label={tile.project.title}
              >
                {/* White rather than ink behind the artwork: on a white page an
                  ink fallback shows as a black rectangle wherever an image has
                  not loaded yet. */}
              {/* Deep, layered shadow so the deck lifts clearly off the pale
                  backdrop — a single soft one disappears against it. */}
              <div className="relative w-full h-full bg-white">
                  {tile.project.video ? (
                    <MediaVideo
                      src={tile.project.video}
                      poster={tile.project.image}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <MediaImage
                      src={tile.project.image}
                      alt={tile.project.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

                  {(tile.project.youtubeId || tile.project.video) && (
                    <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow">
                      <Play className="w-4 h-4 text-jelly-deep fill-jelly-deep ml-0.5" />
                    </span>
                  )}

                  <div className="absolute inset-x-0 bottom-0 p-4 md:p-5 text-left">
                    <h3 className="text-white font-bold leading-snug text-sm md:text-base">{tile.project.title}</h3>
                    <div className="mt-1.5 flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-white/70">
                      <span>{tile.project.category}</span>
                      {tile.project.timeline && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-white/40" />
                          <span>{tile.project.timeline}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ),
          )}
        </div>

        {/* The closing card, once more at full size behind an expanding window.
            Growing the real fan card instead would fight its rotate/translate,
            and scaling a card up to the viewport needs different x and y factors
            — the type inside would stretch. This keeps it undistorted. */}
        <div ref={panel} className="outro-panel opacity-0">
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <p className="outro-word heading-800 text-white leading-none tracking-tighter">AD QUBE</p>
            <span className="outro-hint flex items-center gap-2 text-white/45 text-[11px] font-mono uppercase tracking-widest">
              <ArrowDown className="w-3.5 h-3.5" />
              Keep scrolling for the blog
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
