import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Clock, Tag } from 'lucide-react'
import { MediaImage, MediaVideo } from './Media'
import { EASE } from '../data'

/** Click a project on /works and this opens with the video (or still) plus a short brief. */
export default function WorkModal({ project, onClose, onStartProject }) {
  /* Esc to close, and stop the page scrolling behind the overlay. */
  useEffect(() => {
    if (!project) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-ink/80 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-auto"
            initial={{ scale: 0.96, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: 24 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-ink shadow-md backdrop-blur-md p-2 rounded-full hover:scale-105 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── Media: the video where there is one, the still otherwise ── */}
            <div className="relative w-full aspect-video bg-ink">
              {project.youtubeId ? (
                <iframe
                  key={project.youtubeId}
                  src={`https://www.youtube.com/embed/${project.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={project.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : project.video ? (
                /* Uploaded video gets real controls here, unlike on the card. */
                <MediaVideo
                  src={project.video}
                  poster={project.image}
                  controls
                  className="absolute inset-0 w-full h-full object-contain bg-black"
                />
              ) : (
                <MediaImage
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>

            {/* ── Short brief ── */}
            <div className="p-6 md:p-9">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-jelly/15 text-jelly-deep text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                  <Tag className="w-3 h-3" />
                  {project.category}
                </span>
                {project.timeline && (
                  <span className="inline-flex items-center gap-1.5 bg-ink/5 text-muted text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {project.timeline}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-2xl md:text-3xl text-ink leading-snug tracking-tight">{project.title}</h2>
              <p className="mt-3 text-body text-sm md:text-base leading-relaxed">{project.description}</p>

              {project.deliverables && (
                <div className="mt-7">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">Deliverables</p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                    {project.deliverables.map((item) => (
                      <li key={item} className="flex gap-2.5 text-body text-sm leading-snug">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-jelly shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.results && (
                <div className="mt-7 border-l-2 border-jelly pl-5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-1.5">Outcome</p>
                  <p className="text-ink text-sm md:text-base leading-relaxed">{project.results}</p>
                </div>
              )}

              {project.disclaimer && (
                <p className="mt-6 text-[11px] text-muted leading-relaxed italic">{project.disclaimer}</p>
              )}

              <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-body text-sm">Want something like this for your brand?</p>
                <button
                  onClick={() => {
                    onClose()
                    onStartProject()
                  }}
                  className="group shrink-0 inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
