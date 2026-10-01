import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Download } from 'lucide-react'
import PageHero from '../components/PageHero'
import { EASE } from '../data'

const PDF = '/ad-qube-brochure.pdf'
const PAGES = 7

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

function DownloadButton({ className = '' }) {
  return (
    <a
      href={PDF}
      download="Ad Qube Brochure.pdf"
      className={`group inline-flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all shadow-md active:scale-[0.98] cursor-pointer ${className}`}
    >
      <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
      <span>Download the brochure</span>
    </a>
  )
}

/**
 * The brochure, reached from What We Make.
 *
 * The spreads are pre-rasterised to WebP — 0.75 MB for all seven against the
 * 13 MB source — so the page paints immediately and reads the same on a phone,
 * where the browser PDF viewer is either an unscrollable box or nothing at all.
 * The download button still hands over the real PDF.
 */
export default function Brochure({ navigate, onStartProject }) {
  return (
    <>
      <PageHero eyebrow="What We Make" title="Brochure">
        Everything Ad Qube makes, what it costs and how long it takes — in seven pages.
      </PageHero>

      <section className="relative bg-white py-14 md:py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-10">
            <button
              onClick={() => navigate('/#services')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to What We Make
            </button>
            <DownloadButton />
          </div>

          {/* Roomier than the usual card stack: the drop under each sheet is
              wide enough that a tighter gap would land it on the next one. */}
          <div className="flex flex-col gap-10 md:gap-14">
            {Array.from({ length: PAGES }, (_, i) => {
              const n = String(i + 1).padStart(2, '0')
              return (
                <motion.figure
                  key={n}
                  className="brochure-slide relative rounded-2xl overflow-hidden border border-line bg-ink"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-80px' }}
                  variants={fadeUp}
                >
                  <img
                    src={`/brochure/page-${n}.webp`}
                    alt={`Ad Qube brochure, page ${i + 1} of ${PAGES}`}
                    width="1600"
                    height="900"
                    /* The first spread is what the visitor lands on, so it is
                       the one page worth fetching eagerly. */
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="w-full h-auto block"
                  />
                  <figcaption className="absolute bottom-3 right-4 text-[10px] font-mono tracking-widest text-white/40">
                    {n} / {String(PAGES).padStart(2, '0')}
                  </figcaption>
                </motion.figure>
              )
            })}
          </div>

          <motion.div
            className="mt-14 border-t border-line pt-10 flex flex-col sm:flex-row gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-70px' }}
            variants={fadeUp}
          >
            <DownloadButton />
            <button
              onClick={onStartProject}
              className="group inline-flex items-center justify-center gap-2 border border-line hover:border-jelly-mid text-ink text-sm font-semibold px-7 py-3.5 rounded-full transition-colors cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
