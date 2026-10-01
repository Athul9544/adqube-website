import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { MediaImage, MediaVideo } from './Media'
import { setVar } from '../styleWrite'

/**
 * Horizontal poster slider. The card nearest the centre of the track is drawn
 * at full size and full strength; cards fall away and dim with distance.
 *
 * Only the horizontal axis is captured — vertical scrolling passes straight
 * through to the page, so the section below is reached normally.
 */
export default function WorksSlider({ projects, onSelect }) {
  const track = useRef(null)
  const cards = useRef([])

  useEffect(() => {
    const el = track.current
    if (!el) return
    let raf = 0

    /* Each card's centre inside the track. Cached rather than read per frame:
       offsetLeft/offsetWidth force the browser to flush layout, and doing that
       once per card on every frame of a swipe is the single most expensive
       thing this loop could do. They only change when the track is re-laid
       out, which the ResizeObserver below already tells us about. */
    let centres = []
    const measure = () => {
      centres = cards.current.map((c) => (c ? c.offsetLeft + c.offsetWidth / 2 : 0))
    }

    /* Writes a 0..1 "centredness" onto each card; the styling reads it from
       CSS. Doing the maths here and the interpolation in CSS keeps this loop to
       one custom-property write per card per frame. */
    const update = () => {
      raf = 0
      const half = el.clientWidth / 2
      const mid = el.scrollLeft + half
      for (let i = 0; i < cards.current.length; i++) {
        const c = cards.current[i]
        if (!c) continue
        const d = Math.abs(centres[i] - mid) / half
        const t = Math.max(0, 1 - d * 1.15)
        setVar(c, '--t', t.toFixed(3))
      }
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => {
      measure()
      update()
    })
    ro.observe(el)
    measure()
    update()

    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [projects.length])

  const nudge = (dir) => {
    const el = track.current
    if (!el) return
    const step = cards.current[0]?.offsetWidth ?? 280
    el.scrollBy({ left: dir * (step + 24), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div ref={track} className="works-track flex items-center gap-6 overflow-x-auto py-10">
        {/* Spacers let the first and last cards reach the centre of the track. */}
        <div className="works-pad shrink-0" aria-hidden="true" />

        {projects.map((project, i) => (
          <button
            key={project.id}
            ref={(n) => (cards.current[i] = n)}
            onClick={() => onSelect(project)}
            className="works-card group shrink-0 text-left"
          >
            <div className="relative w-full h-full rounded-2xl overflow-hidden bg-ink border border-line shadow-[0_18px_40px_-14px_rgba(58,44,10,0.35)]">
              {project.video ? (
                <MediaVideo
                  src={project.video}
                  poster={project.image}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <MediaImage
                  src={project.image}
                  alt={project.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

              {(project.youtubeId || project.video) && (
                <span className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow">
                  <Play className="w-4 h-4 text-jelly-deep fill-jelly-deep ml-0.5" />
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                <h3 className="text-white font-bold leading-snug works-card-title">{project.title}</h3>
                <div className="mt-2 flex items-center gap-2.5 text-[10px] font-mono uppercase tracking-widest text-white/70">
                  <span>{project.category}</span>
                  {project.timeline && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/40" />
                      <span>{project.timeline}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        <div className="works-pad shrink-0" aria-hidden="true" />
      </div>

      <div className="flex items-center justify-center gap-5 mt-2">
        <button
          onClick={() => nudge(-1)}
          aria-label="Previous work"
          className="w-9 h-9 rounded-full border border-line hover:border-jelly-mid text-ink flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono uppercase tracking-widest text-muted">Scroll to explore</span>
        <button
          onClick={() => nudge(1)}
          aria-label="Next work"
          className="w-9 h-9 rounded-full border border-line hover:border-jelly-mid text-ink flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
