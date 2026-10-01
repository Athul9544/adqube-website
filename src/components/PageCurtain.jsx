const ID = 'adqube-curtain'
const FADE_MS = 520

/**
 * Covers a scroll-driven page hand-over.
 *
 * Navigating resets the scroll to the top while the outgoing page is still the
 * rendered tree, so for a frame or more the browser can paint that page at its
 * own top — on the home page, the hero video — before the incoming page mounts.
 *
 * This is deliberately a direct DOM node rather than a React component. A
 * component can only mount once React re-renders, which is already too late:
 * the flash happens between the scroll reset and that render. Writing straight
 * to the document puts the sheet up in the same synchronous tick as the
 * navigation, so there is no uncovered frame at all.
 *
 * Call immediately before navigating.
 */
export function armCurtain() {
  if (typeof document === 'undefined') return

  let el = document.getElementById(ID)
  if (!el) {
    el = document.createElement('div')
    el.id = ID
    el.setAttribute('aria-hidden', 'true')
    el.style.cssText =
      'position:fixed;inset:0;z-index:75;background:#ffffff;pointer-events:none;opacity:1;will-change:opacity'
    document.body.appendChild(el)
  }

  // Snap to fully opaque with no transition, so a repeat hand-over re-covers
  // instantly instead of easing up from wherever the last fade left it.
  el.style.transition = 'none'
  el.style.opacity = '1'
  void el.offsetHeight // flush the change before re-enabling the transition

  clearTimeout(el._t)
  /* Two frames: the first lets the navigation commit, the second lets the new
     page paint. Fading any earlier would reveal the swap it exists to hide. */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${FADE_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
      el.style.opacity = '0'
      el._t = setTimeout(() => el.remove(), FADE_MS + 60)
    })
  })
}
