import { useEffect, useState } from 'react'

/**
 * True once the element has genuinely come within `margin` of the viewport,
 * and stays true afterwards. For deciding when a heavy asset may start
 * downloading.
 *
 * Two things make this harder than one IntersectionObserver.
 *
 * The first is that a page measured on its opening frames is not the page the
 * reader will scroll. Images have no intrinsic size until they arrive, so the
 * document is short, and a section four screens down really does sit inside
 * the viewport as measured. That is what framer-motion's `onViewportEnter`
 * was reporting, and it let a clip the reader would not reach for a long time
 * compete with the hero for bandwidth.
 *
 * The second is that an observer answers with the geometry it had when the
 * entry was queued, which can already be stale by the time the callback runs.
 *
 * So: wait for the load event before observing at all, and when the observer
 * does fire, re-measure on the next frame before believing it. A reader who
 * never scrolls never trips it; a reader who scrolls gets the asset well
 * before it is on screen.
 */
export function useNearViewport(ref, margin = '300px') {
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }

    let io = null
    let raf = 0
    let cancelled = false
    const slack = parseInt(margin, 10) || 0

    const start = () => {
      if (cancelled || !ref.current) return
      io = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return
          raf = requestAnimationFrame(() => {
            const node = ref.current
            if (cancelled || !node) return
            const r = node.getBoundingClientRect()
            if (r.top <= window.innerHeight + slack && r.bottom >= -slack) {
              setNear(true)
              io?.disconnect()
            }
          })
        },
        { rootMargin: margin },
      )
      io.observe(ref.current)
    }

    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      io?.disconnect()
      window.removeEventListener('load', start)
    }
  }, [ref, margin, near])

  return near
}
