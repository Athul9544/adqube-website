import { motion } from 'framer-motion'
import FooterCubes from './FooterCubes'
import { FOOTER_LINKS, SOCIALS, EASE } from '../data'

const inView = { once: true, margin: '-40px' }

/* Words rise in sequence — used for the brand paragraph. */
const wordWrap = { hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }
const word = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
}

/* Links slide in from the left, one after the other. */
const linkWrap = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }
const link = {
  hidden: { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
}

/* Characters drop in — used for the closing tagline. */
const charWrap = { hidden: {}, visible: { transition: { staggerChildren: 0.014 } } }
const char = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
}

function Words({ text, className }) {
  return (
    <motion.p className={className} variants={wordWrap} initial="hidden" whileInView="visible" viewport={inView}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} variants={word} className="inline-block">
          {w}&nbsp;
        </motion.span>
      ))}
    </motion.p>
  )
}

function Chars({ text, className }) {
  return (
    <motion.p
      className={className}
      variants={charWrap}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      aria-label={text}
    >
      {text.split('').map((c, i) => (
        <motion.span key={i} variants={char} className="inline-block" aria-hidden="true">
          {c === ' ' ? ' ' : c}
        </motion.span>
      ))}
    </motion.p>
  )
}

/** Site footer. The closing CTA lives in its own section — see CtaBanner. */
export default function Footer({ navigate }) {
  return (
    <section className="relative px-6 md:px-12 lg:px-24 pt-16 md:pt-20 pb-0 bg-ink text-white overflow-hidden w-full">
      <div className="absolute inset-0 w-full h-full">
        <img
          src="/hero-still.webp"
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0b07]/95 via-[#0d0b07]/88 to-[#0d0b07] z-[5] pointer-events-none" />

      {/* Background only — sits above the backdrop and below the z-10 content. */}
      <FooterCubes />

      {/* ── Footer columns ── */}
      <footer className="footer-legible relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-10 md:gap-8">
          {/* Brand */}
          <div>
            <motion.button
              onClick={() => navigate?.('/')}
              aria-label="Ad Qube — home"
              className="block cursor-pointer hover:opacity-85 transition-opacity"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <img src="/brand-mark.png" alt="Ad Qube" width="996" height="252" className="h-7 w-auto object-contain" />
            </motion.button>
            <Words
              text="Ad Qube is an AI-first video ad studio, combining AI-powered production with creative strategy so brands can make more, test more, and scale what works."
              className="mt-5 text-white/75 text-sm leading-relaxed max-w-xs"
            />
          </div>

          {/* Navigation — no heading, per the reference */}
          <motion.nav
            className="flex flex-col gap-3.5 md:pt-1"
            variants={linkWrap}
            initial="hidden"
            whileInView="visible"
            viewport={inView}
          >
            {FOOTER_LINKS.map((l) => (
              <motion.button
                key={l.path}
                variants={link}
                onClick={() => navigate?.(l.path)}
                className="group relative text-white/80 hover:text-white text-sm text-left w-fit transition-colors cursor-pointer"
              >
                {l.label}
                {/* Gold rule wipes out from the left on hover. */}
                <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-jelly transition-transform duration-300 group-hover:scale-x-100" />
              </motion.button>
            ))}
          </motion.nav>

          {/* Social, as icons */}
          <div className="md:pt-1">
            <motion.p
              className="text-[10px] font-mono uppercase tracking-widest text-white/60 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={inView}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Social
            </motion.p>
            <motion.div
              className="flex items-center gap-2.5"
              variants={linkWrap}
              initial="hidden"
              whileInView="visible"
              viewport={inView}
            >
              {SOCIALS.map((s) => {
                const Icon = s.icon
                return (
                  <motion.a
                    key={s.label}
                    variants={link}
                    whileHover={{ y: -3 }}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-10 h-10 rounded-full border border-white/25 bg-white/10 flex items-center justify-center text-white/85 hover:text-ink hover:bg-jelly hover:border-jelly transition-colors duration-300"
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                )
              })}
            </motion.div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <motion.p
            className="text-white/70 text-[11px] font-mono"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={inView}
            transition={{ duration: 0.7 }}
          >
            © {new Date().getFullYear()} Ad Qube Studios.
          </motion.p>
          <Chars
            text="Creations that make your brand worth watching."
            className="text-white/80 text-xs font-light tracking-wide"
          />
        </div>
      </footer>

      {/* ── Oversized wordmark, bleeding off the bottom edge ── */}
      {/* Full-bleed: the negative margins cancel the section's own horizontal
          padding so the wordmark can run the whole width of the footer, the way
          it reads on a wide screen. Inside the padding it stopped short of both
          edges on a phone. */}
      <div
        aria-hidden="true"
        className="relative z-10 mt-10 md:mt-14 -mx-6 md:-mx-12 lg:-mx-24 select-none pointer-events-none"
      >
        {/* Two elements, not one: `whileInView` and a looping `animate` on the
            same node fight over control, and the gesture wins — the shimmer
            would never run. The outer node does the one-shot rise, the inner
            one loops. */}
        {/* Its own viewport config, not the shared `inView`. This is the last
            element on the page and it deliberately bleeds off the bottom edge,
            so at rest only a sliver of it can ever be on screen — and it starts
            pushed down another 40px on top of that. Against the shared -40px
            inset the wordmark landed entirely below the test region on a phone,
            never triggered, and with `once: true` and no scroll left it stayed
            invisible for good. Expanding the root instead means it fires as the
            footer approaches, at any viewport height. */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '240px', amount: 0 }}
          transition={{ duration: 1, ease: EASE }}
        >
          <motion.p
            className="heading-800 text-center leading-[0.78] tracking-tighter bg-clip-text text-transparent"
            style={{
              /* 22.5vw, not 18. The 15rem cap is what sets the desktop size and
                 it already bites above ~1067px, so raising the vw term leaves
                 wide screens untouched and only lifts the widths that were
                 still below it. On a phone that is the difference between the
                 wordmark stopping well short of both edges and running the full
                 width of the footer, which is how it reads on desktop. */
              fontSize: 'clamp(3.5rem, 22.5vw, 15rem)',
              /* One line, always. At 360px the phrase wrapped to two — measured
                 at 54% of the viewport instead of spanning it — which is a
                 different composition, not a smaller one. */
              whiteSpace: 'nowrap',
              marginBottom: '-0.16em',
              /* Horizontal shimmer as the background; the vertical fade that
                 used to be the gradient is now a mask, so the two coexist.
                 Both are lifted well up: the wordmark has a moving cube field
                 behind it rather than flat ground, and at the old strength the
                 letters lost against it. */
              backgroundImage:
                'linear-gradient(100deg, rgba(227,179,65,0.9) 0%, rgba(227,179,65,0.9) 35%, rgba(255,246,214,0.9) 50%, rgba(227,179,65,0.9) 65%, rgba(227,179,65,0.9) 100%)',
              backgroundSize: '250% 100%',
              /* Only the last stretch softens now — just enough that the
                 wordmark bleeds off the page edge rather than being sliced by
                 it. Above that it is solid. */
              maskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.92) 85%, rgba(0,0,0,0.75) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, rgba(0,0,0,0.92) 85%, rgba(0,0,0,0.75) 100%)',
            }}
            animate={{ backgroundPositionX: ['160%', '-60%'] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
          >
            AD QUBE
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
