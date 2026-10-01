import { motion } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { SERVICES, EASE } from '../data'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

/** "What We Make" — one full-width feature card per service. */
export default function Services() {
  return (
    /* scroll-mt: the mobile nav pill is fixed, so a jump to this section would
       otherwise land its eyebrow underneath it. The desktop header is absolute
       and has scrolled away by then, so it needs no offset. */
    <section id="services" className="relative scroll-mt-20 md:scroll-mt-0 py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-paper">
      <div className="max-w-7xl mx-auto">
        {/* ── Section header ── */}
        <motion.div
          className="max-w-2xl mb-12 md:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
        >
          <div className="flex items-center gap-4 mb-5">
            <span className="text-orange text-[11px] font-bold tracking-[0.2em] uppercase">What We Make</span>
            <span className="h-px w-10 bg-orange/60" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-ink font-normal tracking-tight leading-tight">
            Advertising stories, brought to life with AI<span className="text-orange">.</span>
          </h2>
          <p className="mt-6 text-body text-base md:text-lg leading-relaxed max-w-lg">
            We create realistic, cinematic video ads built around strong ideas, thoughtful storytelling, and detailed
            visual direction, made to give brands something worth watching.
          </p>
        </motion.div>

        {/* ── Feature cards ── */}
        <div className="flex flex-col gap-8">
          {SERVICES.map((service) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                className="group/card grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] rounded-3xl border border-line bg-white overflow-hidden shadow-sm hover:shadow-xl hover:border-jelly-mid/45 transition-[box-shadow,border-color] duration-500"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                variants={fadeUp}
              >
                {/* Left: copy */}
                <div className="p-8 md:p-12 flex flex-col">
                  {/* The tile is the card's one piece of colour, so it carries
                      the weight: a gradient face, a bright inner rim and a
                      warm glow beneath. */}
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-jelly via-orange to-jelly-deep flex items-center justify-center shadow-lg shadow-orange/25 ring-1 ring-orange/30 transition-transform duration-500 group-hover/card:-rotate-6 group-hover/card:scale-105">
                    {/* Top-edge highlight — reads as light catching a bevel. */}
                    <span className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/40 to-transparent" />
                    <Icon className="relative w-7 h-7 text-white drop-shadow-sm" strokeWidth={1.75} />
                  </div>

                  <h3 className="heading-700 mt-8 text-2xl md:text-3xl text-ink">{service.title}</h3>
                  <p className="mt-4 text-body text-sm md:text-base leading-relaxed max-w-md">{service.description}</p>

                  {/* The two-line promise the card already carried but never
                      showed — set as the claim it is. */}
                  {service.caption && (
                    <p className="mt-6 font-serif text-lg md:text-xl text-ink leading-snug">
                      {service.caption.map((line, i) => (
                        <span key={line} className={i ? 'text-orange' : ''}>
                          {line}{' '}
                        </span>
                      ))}
                    </p>
                  )}

                  <div className="h-px bg-gradient-to-r from-line via-line to-transparent my-8" />

                  {/* Chips rather than a three-column list: they wrap cleanly at
                      any width and read as capabilities instead of body copy. */}
                  <div className="flex flex-wrap gap-2.5">
                    {service.features.map((feature) => {
                      const FeatureIcon = feature.icon
                      return (
                        <span
                          key={feature.label}
                          className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-ink text-xs font-medium leading-none transition-colors hover:border-orange/45 hover:bg-orange/5"
                        >
                          <FeatureIcon className="w-[15px] h-[15px] text-orange shrink-0" strokeWidth={2} />
                          {feature.label}
                        </span>
                      )
                    })}
                  </div>

                  {/* An anchor, not a button: this hands the file over rather
                      than opening a page, and `download` is what makes the
                      browser save it instead of displaying the PDF in a tab.
                      Same classes as before, so it still reads as the same
                      button.

                      The file is named the way it should appear in someone's
                      downloads folder, because the host sends its own
                      Content-Disposition header and that filename wins over
                      the one asked for here. */}
                  <a
                    href="/Ad-Qube-Studio-Brochure.pdf"
                    download="Ad-Qube-Studio-Brochure.pdf"
                    className="group mt-9 self-start inline-flex items-center gap-2.5 bg-orange hover:bg-orange/90 text-white rounded-full px-7 py-3.5 text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                  >
                    <span>{service.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

                {/* Right: a looping sample of the work itself.
                    muted + playsInline are what let it autoplay at all —
                    browsers block sound-on autoplay, and without playsInline
                    iOS takes the video fullscreen instead of playing inline.
                    The still is the poster, so there is no blank frame while
                    the video loads. */}
                <div className="relative min-h-[320px] lg:min-h-[480px] bg-ink overflow-hidden">
                  <video
                    src={service.video}
                    poster={service.image}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label={service.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
