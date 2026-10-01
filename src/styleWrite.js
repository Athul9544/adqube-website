/**
 * Style writes that skip themselves when nothing changed.
 *
 * The scroll-driven sections write a handful of properties to every card on
 * every scroll tick. Most ticks do not actually change the rounded value — a
 * card's angle to two decimal places, or its stacking order, is the same as it
 * was a frame ago — but the browser cannot know that: assigning to `style` at
 * all invalidates the element's style, and for a layer-affecting property like
 * z-index it also makes the compositor recompute which elements need their own
 * layer. That showed as ~190ms of Layerize over a two-second scroll.
 *
 * Comparing against the last value written is far cheaper than the work it
 * avoids, and the value on screen is identical either way — this changes
 * nothing about how anything looks or moves.
 */

const LAST = new WeakMap()

function slot(el) {
  let s = LAST.get(el)
  if (!s) {
    s = {}
    LAST.set(el, s)
  }
  return s
}

/** Set a CSS custom property, skipping the write when it already holds this value. */
export function setVar(el, name, value) {
  if (!el) return
  const s = slot(el)
  if (s[name] === value) return
  s[name] = value
  el.style.setProperty(name, value)
}

/** Set a plain style property, skipping unchanged writes. */
export function setStyle(el, name, value) {
  if (!el) return
  const s = slot(el)
  if (s[name] === value) return
  s[name] = value
  el.style[name] = value
}
