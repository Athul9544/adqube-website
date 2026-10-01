import { motion } from 'framer-motion'
import { PROCESS, PROCESS_TAGS, EASE } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }
const step = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

/** "How We Work" — the three-step async process. */
export default function Process() {
  return (
    <section id="process" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-white border-t border-b border-line">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="max-w-3xl mb-16 md:mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={fadeUp}
        >
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase mb-4 block font-mono">
            How We Work
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-ink font-normal tracking-tight leading-tight">
            Built for async. Delivered&nbsp;fast.
          </h2>
          <p className="mt-5 text-body text-sm md:text-base font-normal leading-relaxed max-w-xl">
            We work with clients across India, the US, UK, UAE &amp; Australia — fully remote, fully async. No time-zone
            friction. Just clean creative, on time.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {PROCESS.map((item) => {
            const Icon = item.icon
            return (
              <motion.div key={item.num} variants={step} className="flex flex-col gap-5 group">
                <div className="flex items-center gap-4">
                  <div className="bg-ink/5 border border-line rounded-2xl p-3.5 text-ink/70 group-hover:text-jelly-deep group-hover:bg-jelly/10 group-hover:border-jelly/30 transition-all duration-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-3xl font-serif text-line font-normal tracking-tight select-none">{item.num}</span>
                </div>
                <div className="h-px bg-line w-full" />
                <div>
                  <h3 className="text-base font-bold font-sans text-ink mb-2">{item.title}</h3>
                  <p className="text-body text-sm font-normal leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.div
          className="mt-12 md:mt-16 flex flex-wrap gap-2.5 md:gap-3 items-center justify-center md:justify-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          {PROCESS_TAGS.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-ink/5 border border-line rounded-full px-3 py-1 md:px-4 md:py-1.5 text-[10px] md:text-xs font-medium text-ink/80 font-sans"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-jelly" />
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
