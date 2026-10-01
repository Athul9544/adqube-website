import { useRef } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
}

/** "Why We Exist" — the statue image reveals a golden version under the cursor. */
export default function About() {
  const frame = useRef(null)

  const onMouseMove = (e) => {
    if (!frame.current) return
    const { left, top, width, height } = frame.current.getBoundingClientRect()
    const px = ((e.clientX - left) / width) * 100
    const py = ((e.clientY - top) / height) * 100
    frame.current.style.setProperty('--mouse-x', `${px}%`)
    frame.current.style.setProperty('--mouse-y', `${py}%`)
    frame.current.style.setProperty('--rotate-x', `${((py - 50) / 50) * -8}deg`)
    frame.current.style.setProperty('--rotate-y', `${((px - 50) / 50) * 8}deg`)
  }

  return (
    <section id="about" className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-paper border-b border-line">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          <motion.div
            className="md:col-span-6 flex justify-center items-center order-last md:order-first"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <div
              ref={frame}
              onMouseMove={onMouseMove}
              onMouseEnter={() => frame.current?.style.setProperty('--mask-opacity', '1')}
              onMouseLeave={() => {
                frame.current?.style.setProperty('--mask-opacity', '0')
                frame.current?.style.setProperty('--rotate-x', '0deg')
                frame.current?.style.setProperty('--rotate-y', '0deg')
              }}
              className="relative w-full max-w-[420px] md:max-w-[620px] aspect-square mx-auto overflow-hidden transition-transform duration-200 ease-out hover:duration-0"
              /* No vignette on the frame: the artwork is a cut-out on
                 transparency, so there is no rectangular edge to hide, and a
                 radial fade here only ate the top, foot and sides of the
                 statue. The spotlight mask on the gold layer below is a
                 separate thing and stays. */
              style={{
                transform: 'perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))',
              }}
            >
              <img
                src="/why-base.webp"
                alt="Ad Qube — marble statue"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />
              <img
                src="/why-gold.webp"
                alt="Ad Qube — gilded statue"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ease-out"
                style={{
                  opacity: 'var(--mask-opacity, 0)',
                  WebkitMaskImage:
                    'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                  maskImage:
                    'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), black 0%, transparent 100%)',
                }}
              />
            </div>
          </motion.div>

          <motion.div
            className="md:col-span-6 flex flex-col justify-center text-left order-first md:order-none md:pl-8 lg:pl-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
          >
            <span className="text-body text-xs font-semibold tracking-widest uppercase mb-4 block font-mono">
              Why We Exist
            </span>
            <h3 className="font-serif text-3xl md:text-4xl lg:text-5xl text-ink font-normal leading-tight mb-8 tracking-tight max-w-2xl">
              Where creative direction meets the power of AI.
            </h3>
            <div className="space-y-6 text-body text-sm md:text-base font-normal leading-relaxed max-w-xl">
              <p>
                The best advertising is more than striking visuals. It starts with a clear message, a compelling story,
                and a vision for how that story should unfold.
              </p>
              <p>
                At AD QUBE STUDIO, every film begins with a concept, a crafted script, and a visual plan for every
                scene. We then use AI video production to bring those ideas to life as realistic, cinematic brand films.
              </p>
            </div>
            <div className="mt-10 border-t border-line pt-6 flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-jelly animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                Ad Qube Studios
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
