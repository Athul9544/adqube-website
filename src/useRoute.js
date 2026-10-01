import { useCallback, useEffect, useState } from 'react'
import { ignoreScrollDirection } from './handover'

/**
 * Scrolls to a section by id, waiting for it to mount.
 *
 * On a cross-page jump the target does not exist during the render that sets
 * the route, so a single lookup silently leaves the visitor at the top of the
 * page. Retrying per frame lands on the section as soon as React commits it.
 */
function scrollToId(id, tries = 60) {
  const el = document.getElementById(id)
  if (el) {
    /* A programmatic seek downward otherwise reads as the visitor scrolling
       down, which is what arms the home page's hand-over into /works. */
    ignoreScrollDirection(700)
    el.scrollIntoView({ block: 'start' })
    return
  }
  if (tries > 0) requestAnimationFrame(() => scrollToId(id, tries - 1))
}

/**
 * Minimal history-API router. Enough for a handful of top-level pages without
 * pulling in react-router. Vite's dev server serves index.html for unknown
 * paths by default, so deep links and refreshes work.
 */
export function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    /* "/#services" means: be on the home page, then go to that section —
       whether or not we are already there. The hash is dropped from the
       pushed URL because the router keys off the pathname alone. */
    const hash = to.indexOf('#')
    if (hash !== -1) {
      const target = to.slice(0, hash) || window.location.pathname
      const id = to.slice(hash + 1)
      if (target !== window.location.pathname) {
        window.history.pushState({}, '', target)
        setPath(target)
      }
      scrollToId(id)
      return
    }

    if (to === window.location.pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.history.pushState({}, '', to)
    setPath(to)
    window.scrollTo({ top: 0 })
  }, [])

  return [path, navigate]
}
