/**
 * Guard rail for the scroll-driven page hand-overs.
 *
 * Each hand-over navigates and then re-seeks the scroll position. For a moment
 * afterwards the incoming page has not finished laying out, so a given scroll
 * offset can briefly resolve to a completely different progress value than it
 * will a frame later. Left unguarded that makes two pages ping-pong: the back
 * hop lands on what the half-measured page thinks is past its own forward
 * trigger, fires forward, and the pair bounce every few frames.
 *
 * A short global lockout after any hand-over removes the whole class of
 * problem — layout settles, momentum scrolling drains, and only then can the
 * next transition arm.
 */
const LOCK_MS = 1200

let lockedUntil = 0

/* Whether the reader has scrolled *down* since the last hand-over.
   Every forward transition requires this. It is the one condition a layout race
   cannot fake: however wrong a freshly-mounted page's measurements are, arriving
   somewhere by scrolling up is never a reason to be thrown forward again. */
let wentDown = false
let lastY = typeof window === 'undefined' ? 0 : window.scrollY

/* Programmatic seeks land wherever they land, often far *below* the current
   position, and their scroll events look exactly like the reader flicking
   downward. Direction is ignored inside this window so a restore cannot arm the
   very trigger it is trying to scroll clear of. */
let ignoreUntil = 0

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      if (y > lastY + 2 && performance.now() >= ignoreUntil) wentDown = true
      lastY = y
    },
    { passive: true },
  )
}

/** Call around any scripted scroll so it is not mistaken for reader intent. */
export function ignoreScrollDirection(ms = 260) {
  ignoreUntil = Math.max(ignoreUntil, performance.now() + ms)
}

export function scrolledDown() {
  return wentDown
}

export function lockHandover() {
  lockedUntil = performance.now() + LOCK_MS
  // A hand-over restarts the requirement for the page being entered.
  wentDown = false
  lastY = window.scrollY
  ignoreScrollDirection()
}

export function handoverLocked() {
  return performance.now() < lockedUntil
}

/**
 * Progress through a pinned section, measured from the element right now.
 *
 * The scroll tracker caches its measurement, and a section that has just
 * mounted — or a page still laying out after a navigation — can report a value
 * taken against different geometry than is actually on screen. Re-deriving it
 * from a live rect before committing to a page change rejects those stale
 * readings, which otherwise fire hand-overs from the middle of a page.
 */
export function liveProgress(el) {
  if (!el) return 0
  const range = el.offsetHeight - window.innerHeight
  if (range <= 0) return 0
  return -el.getBoundingClientRect().top / range
}

/** Milliseconds until the lock lifts, for scheduling a re-check. */
export function lockRemaining() {
  return Math.max(0, Math.ceil(lockedUntil - performance.now()))
}

/**
 * Runs a hand-over, or defers it until the lock lifts.
 *
 * Deferring matters: a reader who scrolls hard can pass the trigger while the
 * lock is still up and end up parked at the foot of the page, where the scroll
 * position never changes again — so no further scroll event would arrive to
 * retry, and the transition would simply never happen.
 */
export function runHandover(fn, timerRef) {
  if (!handoverLocked()) {
    lockHandover()
    fn()
    return
  }
  clearTimeout(timerRef.current)
  timerRef.current = setTimeout(() => runHandover(fn, timerRef), lockRemaining() + 30)
}
