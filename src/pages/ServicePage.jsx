import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import PageHero from '../components/PageHero'
import { SERVICES, EASE } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** Full page for one service, reached from its card's "Learn More". */
export default function ServicePage({ slug, navigate, onStartProject }) {
  const service = SERVICES.find((s) => s.slug === slug)

  /* An unknown slug goes back to the section it came from rather than showing
     a blank page. */
  if (!service?.detail) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center bg-white">
        <p className="text-body">That service does not exist.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors cursor-pointer"
        >
          Back to the homepage
        </button>
      </section>
    )
  }

  const d = service.detail

  return (
    <>
      <PageHero eyebrow="What We Make" title={service.title}>
        {service.description}
      </PageHero>

      <section className="relative bg-white py-14 md:py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to What We Make
          </button>

          {service.video && (
            <motion.div
              className="relative w-full aspect-video rounded-2xl overflow-hidden bg-ink border border-line shadow-sm mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
            >
              <video
                src={service.video}
                poster={service.image}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          )}

          <motion.p
            className="text-body text-base md:text-lg leading-relaxed"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
          >
            {d.intro}
          </motion.p>

          <div className="mt-12 space-y-10">
            {d.sections.map((s) => (
              <motion.div
                key={s.heading}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-70px' }}
                variants={fadeUp}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="h-px w-7 bg-jelly-deep/40" />
                  <h2 className="text-jelly-deep text-[11px] font-semibold tracking-widest uppercase font-mono">
                    {s.heading}
                  </h2>
                </div>
                <p className="text-body text-sm md:text-base leading-relaxed">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-14 border-t border-line pt-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-70px' }}
            variants={fadeUp}
          >
            <h2 className="heading-700 text-lg text-ink mb-5">What&rsquo;s included</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {d.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-ink text-sm md:text-base">
                  <Check className="w-4 h-4 text-jelly-deep shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onStartProject}
                className="group inline-flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/works')}
                className="inline-flex items-center justify-center gap-2 border border-line hover:border-jelly-mid text-ink text-sm font-semibold px-7 py-3.5 rounded-full transition-colors cursor-pointer"
              >
                See the work
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
