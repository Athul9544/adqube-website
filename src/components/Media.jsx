import { motion } from 'framer-motion'
import { useMediaUrl } from '../media'

/* Hooks cannot run inside a .map(), so resolving an upload reference has to
   happen inside a component. These wrap <img>/<video> to do exactly that. */

/* Lazy and async by default. Every picture these render sits inside a card,
   a rail or a modal — none of them is the thing a reader sees first — and the
   browser fetching all of them at once was costing the hero its bandwidth.
   Anything that genuinely is above the fold can still pass loading="eager". */
export function MediaImage({ src, alt = '', className = '', animated = false, ...rest }) {
  const url = useMediaUrl(src)
  if (!url) return null
  const Tag = animated ? motion.img : 'img'
  return <Tag src={url} alt={alt} className={className} loading="lazy" decoding="async" {...rest} />
}

/* `preload="metadata"` rather than the browser default. These clips are all
   below the fold, and left to itself the browser starts pulling every one of
   them the moment it is parsed — which is bandwidth the hero needs. Metadata
   is enough to size the element; the rest arrives when playback starts. */
export function MediaVideo({ src, className = '', poster, ...rest }) {
  const url = useMediaUrl(src)
  const posterUrl = useMediaUrl(poster)
  if (!url) return null
  return (
    <video
      src={url}
      poster={posterUrl || undefined}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      {...rest}
    />
  )
}
