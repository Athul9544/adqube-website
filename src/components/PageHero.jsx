import { motion } from 'framer-motion'
import { EASE } from '../data'

/**
 * Shared header for the inner pages. Top padding clears the fixed nav.
 *
 * `backdrop` lets a page supply its own decorative layer; when it does, the
 * default paper fill and the corner bloom step aside so they cannot sit on top
 * of it.
 */
export default function PageHero({ eyebrow, title, children, backdrop = null }) {
  return (
    <section
      className={`relative pt-32 md:pt-44 pb-14 md:pb-20 px-6 md:px-12 lg:px-24 overflow-hidden ${
        backdrop ? '' : 'bg-paper border-b border-line'
      }`}
    >
      {backdrop}
      {!backdrop && (
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-jelly/8 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />
      )}

      <motion.div
        className="relative z-10 max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <div className="flex items-center gap-4 mb-5">
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">{eyebrow}</span>
          <span className="h-px w-10 bg-jelly-deep/40" />
        </div>
        <h1 className="font-serif text-4xl md:text-6xl text-ink font-normal tracking-tight leading-[1.05] max-w-4xl">
          {title}
        </h1>
        {children && <div className="mt-6 text-body text-base md:text-lg leading-relaxed max-w-2xl">{children}</div>}
      </motion.div>
    </section>
  )
}
