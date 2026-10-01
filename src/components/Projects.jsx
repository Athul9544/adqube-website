import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ExternalLink } from 'lucide-react'
import { MediaImage, MediaVideo } from './Media'
import WorkModal from './WorkModal'
import { useContent } from '../content'
import { EASE } from '../data'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }
const card = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** "Recent Work" — the three latest case-study cards. */
export default function Projects({ navigate, onStartProject }) {
  const { projects } = useContent()
  const [selected, setSelected] = useState(null)

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-white border-b border-line">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-16">
          <div className="max-w-xl">
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase mb-4 block font-mono">
              Recent Work
            </span>
            <h2 className="font-serif text-4xl md:text-5xl text-ink font-normal tracking-tight leading-tight">
              Latest Projects
            </h2>
          </div>
          <button
            onClick={() => navigate('/works')}
            className="group inline-flex items-center gap-1.5 bg-ink hover:bg-ink/90 text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md cursor-pointer"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {/* Homepage teases three; the full set lives on /works. */}
          {projects.slice(0, 3).map((project) => {
            return (
              <motion.div
                key={project.id}
                variants={card}
                onClick={() => setSelected(project)}
                className="group bg-white rounded-3xl overflow-hidden border border-line flex flex-col justify-between cursor-pointer hover:shadow-xl hover:border-jelly-mid/40 transition-all duration-500 h-[420px]"
              >
                <div className={`h-60 w-full bg-gradient-to-br ${project.color} relative p-6 flex flex-col justify-between overflow-hidden`}>
                  {project.video ? (
                    <MediaVideo
                      src={project.video}
                      poster={project.image}
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <MediaImage
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/15 group-hover:bg-black/30 transition-colors duration-500 z-0" />

                  <div className="flex justify-end items-start relative z-10 w-full">
                    {project.youtubeId || project.video ? (
                      <span className="bg-jelly text-ink backdrop-blur-md rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-mono shadow-sm flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-ink animate-pulse" />
                        Watch Ad
                      </span>
                    ) : (
                      <div className="bg-white/90 backdrop-blur-md text-ink p-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold font-sans text-ink group-hover:text-jelly-deep transition-colors duration-300 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-body text-xs md:text-sm font-normal leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-jelly-deep mt-4">
                    <span>View Case Study</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      <WorkModal project={selected} onClose={() => setSelected(null)} onStartProject={onStartProject} />
    </section>
  )
}
