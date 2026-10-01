import { useEffect } from 'react'
import { armCurtain } from './PageCurtain'
import { handoverLocked, lockHandover, lockRemaining } from '../handover'

const KEY = 'adqube.slideBack'

/* How much upward gesture is needed at the top of the page before we go back.
   A single stray wheel notch or a rubber-band bounce should not do it. */
const THRESHOLD = 150

/* The same intent expressed with a thumb. Lower than the wheel's figure on
   purpose: a wheel reports a stream of small notches that add up quickly,
   while a swipe is one movement whose useful length is bounded by the height
   of the screen — and by the time the reader has dragged 150px down at the top
   of a phone page, the rubber band has already sprung back and the moment has
   passed. This is still far more than a tap or a mis-touch. */
const TOUCH_THRESHOLD = 70

/* Rubber band. iOS reports a negative scroll position while the reader drags
   past the top; that overscroll IS the gesture, and reading it directly means
   the hand-over fires at the moment the page refuses to go any further rather
   than waiting for a separate deliberate pull. */
const OVERSCROLL = 34

function readStack() {
  try {
    const raw = sessionStorage.getItem(KEY)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/**
 * Records a scroll-driven hand-over so the receiving page can offer a way back.
 *
 * A stack, not a single slot: the site chains several of these hops in a row
 * (home to works to blog to contact), and one slot would let each hop overwrite
 * the last, leaving only the final step reversible.
 *
 * The stored position is one screen short of the trigger point — returning to
 * the trigger itself would re-fire it and bounce the reader straight forward.
 */
/**
 * The scroll position at which a pinned section sits at a given progress.
 *
 * Bridges use this to land the reader *inside* the animation rather than
 * before it — returning to the start of the section would show the sequence
 * already reset, so scrolling up would play nothing back.
 */
export function scrollForProgress(el, p) {
  if (!el) return 0
  const top = el.getBoundingClientRect().top + window.scrollY
  return Math.max(0, Math.round(top + p * (el.offsetHeight - window.innerHeight)))
}

export function armBridge(from, to, y) {
  try {
    if (typeof y !== 'number') y = Math.max(0, window.scrollY - window.innerHeight)
    const stack = readStack()
    // Re-crossing the same hop replaces its entry rather than stacking a copy.
    const top = stack[stack.length - 1]
    if (top && top.from === from && top.to === to) stack.pop()
    stack.push({ from, to, y })
    sessionStorage.setItem(KEY, JSON.stringify(stack.slice(-8)))
  } catch {
    /* private mode — the trip is simply one-way */
  }
}

/**
 * The return half of a scroll-driven page hand-over.
 *
 * Pulling up at the very top of this page takes the reader back to the page
 * that sent them here, at the exact position they left, so every transition in
 * the chain reads as reversible rather than as a one-way trip.
 */
export default function ScrollBackBridge({ navigate }) {
  useEffect(() => {
    const stack = readStack()
    const record = stack[stack.length - 1]
    /* Only arm when the top of the stack actually points at this page. A stale
       entry left over from a nav-link click would otherwise send the reader
       somewhere they never scrolled in from. */
    if (!record || record.to !== window.location.pathname) return

    let accum = 0
    let touchY = null
    let done = false
    let pending = 0

    /* The previous page grows as its sections mount, so a single scrollTo
       lands short. Keep reapplying until it sticks or we run out of tries. */
    const restore = (y, tries = 0) => {
      /* Refreshed every frame of the seek. The destination page grows as its
         sections mount, so until it has, the target position can sit past a
         section's own hand-over trigger — and that section would fire, throwing
         the reader straight back where they came from. Holding the lock for the
         whole seek, not a fixed span, closes that window however long it takes. */
      lockHandover()
      window.scrollTo(0, y)
      if (Math.abs(window.scrollY - y) > 4 && tries < 30) {
        requestAnimationFrame(() => restore(y, tries + 1))
      }
    }

    const goBack = () => {
      if (done) return
      /* Deferred, not dropped. The lock is up for a beat after the hand-over
         that brought the reader here, and a phone reader's first instinct on
         landing is to pull straight back down — that gesture used to be
         swallowed whole, with nothing on screen to say why, so it read as the
         transition simply not working. Retrying when the lock lifts honours
         the pull they already made, provided they are still at the top. */
      if (handoverLocked()) {
        clearTimeout(pending)
        pending = setTimeout(() => {
          if (!done && window.scrollY <= 2) goBack()
        }, lockRemaining() + 40)
        return
      }
      done = true
      lockHandover()
      try {
        // Pop just this hop, leaving earlier ones reversible too.
        sessionStorage.setItem(KEY, JSON.stringify(stack.slice(0, -1)))
      } catch {
        /* ignore */
      }
      /* Going back swaps pages and re-seeks the scroll, both of which flash.
         Cover it the same way the forward hand-over does. */
      armCurtain()
      navigate?.(record.from)
      requestAnimationFrame(() => restore(Number(record.y) || 0))
    }

    const onWheel = (e) => {
      if (window.scrollY > 2) {
        accum = 0
        return
      }
      if (e.deltaY < 0) {
        accum += -e.deltaY
        if (accum >= THRESHOLD) goBack()
      } else {
        accum = 0
      }
    }

    const onTouchStart = (e) => {
      touchY = window.scrollY <= 2 ? e.touches[0].clientY : null
    }
    const onTouchMove = (e) => {
      const y = e.touches[0].clientY
      /* Away from the top the gesture is ordinary scrolling; drop the anchor
         so the distance is not measured across it. */
      if (window.scrollY > 2) {
        touchY = null
        return
      }
      /* The anchor is set here as well as on touchstart. A reader scrolling up
         a page does it in one long swipe that begins somewhere in the middle
         and only reaches the top part-way through — the drag never *started*
         at the top, so the old code ignored it and the page just sat there
         until they lifted a finger and pulled again. Anchoring at the moment
         the top is reached measures the rest of that same swipe. This is the
         touch equivalent of the wheel handler, which re-evaluates every notch
         and so never had the problem. */
      if (touchY === null) {
        touchY = y
        return
      }
      // Dragging downward past the top means pulling the previous page back.
      if (y - touchY >= TOUCH_THRESHOLD) goBack()
    }

    /* The rubber band, for the case the touch handlers cannot see: a hard
       flick up carries the page to the top under its own momentum, after the
       finger has already left the screen, so there is no drag left to measure
       — but the overscroll still happens. Watching the scroll position itself
       catches that, and costs nothing on a platform that clamps at zero. */
    const onScroll = () => {
      if (window.scrollY <= -OVERSCROLL) goBack()
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(pending)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScroll)
    }
  }, [navigate])

  return null
}
