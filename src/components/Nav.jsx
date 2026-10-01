import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { EASE, CONTACT_METHODS } from '../data'

const MENU = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/works' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact Us', path: '/contact' },
]

const DESKTOP_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Projects', path: '/works' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
]

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

export default function Nav({ onStartProject, navigate, path: current }) {
  const [menuOpen, setMenuOpen] = useState(false)

  /* Only the home hero sits behind the nav. Every other page opens on a light
     surface, so the light-on-dark treatment would be invisible there. */
  const overVideo = current === '/'

  /* Home carries its own "Let's Create" and contact is itself the place you
     go to start one — a header CTA on either is a second button pointing
     where the visitor already is. */
  const showCta = current !== '/' && current !== '/contact'

  const go = (to) => {
    setMenuOpen(false)
    navigate(to)
  }

  return (
    <>
      {/* ── Desktop header ── */}
      <header className="absolute top-0 left-0 right-0 z-30 w-full px-12 py-8 justify-between items-center transition-colors duration-300 hidden md:flex">
        {/* Artwork is white — it only needs inverting on light pages. */}
        <button
          onClick={() => go('/')}
          aria-label="Ad Qube — home"
          className="flex items-center cursor-pointer hover:opacity-85 transition-opacity"
        >
          <img
            src="/brand-mark.png"
            alt="Ad Qube"
            width="996"
            height="252"
            className={`h-10 w-auto object-contain ${overVideo ? '' : 'brightness-0'}`}
          />
        </button>

        {/* Links stay optically centred; the CTA sits on the right rail. */}
        <motion.nav
          className={`rounded-full px-3 py-2 flex items-center border absolute left-1/2 -translate-x-1/2 top-6 ${
            overVideo ? 'bg-white/10 backdrop-blur-md border-white/20' : 'glass-nav'
          }`}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <div className={`flex items-center text-xs font-medium ${overVideo ? 'text-white/85' : 'text-ink/90'}`}>
            {DESKTOP_LINKS.map((link) => {
              const active = current === link.path
              return (
                <button
                  key={link.path}
                  onClick={() => go(link.path)}
                  className={`px-3.5 py-1 transition-colors cursor-pointer ${
                    overVideo ? 'hover:text-white' : 'hover:text-jelly-deep'
                  } ${active ? (overVideo ? 'text-jelly font-semibold' : 'text-jelly-deep font-semibold') : ''}`}
                >
                  {link.label}
                </button>
              )
            })}
          </div>
        </motion.nav>

        {/* The empty span holds the right rail so justify-between still keeps
            the logo hard left when there is no button. */}
        {!showCta ? (
          <span aria-hidden="true" />
        ) : (
          <motion.button
            onClick={onStartProject}
            className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-sm cursor-pointer bg-ink text-white hover:bg-ink/90"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          >
            Start a Project
          </motion.button>
        )}
      </header>

      {/* ── Mobile pill ── */}
      <div className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          className="h-13 rounded-full border bg-line/85 backdrop-blur-lg px-4.5 py-3 flex justify-between items-center gap-6 shadow-lg transition-all duration-300 w-[55vw] min-w-[210px] max-w-[280px]"
          style={{
            borderColor: menuOpen ? 'rgba(227, 179, 65, 0.45)' : 'rgba(122, 106, 79, 0.25)',
            boxShadow: menuOpen ? '0 4px 30px rgba(227, 179, 65, 0.14)' : '0 4px 24px rgba(58, 44, 10, 0.08)',
          }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          {/* Pill background is light, so the white artwork needs inverting here too. */}
          <button
            onClick={() => go('/')}
            aria-label="Ad Qube — home"
            className="flex items-center cursor-pointer hover:opacity-85 transition-opacity"
          >
            <img
              src="/brand-mark.png"
              alt="Ad Qube"
              width="996"
              height="252"
              className="h-6 w-auto object-contain brightness-0"
            />
          </button>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
            className="flex items-center justify-center w-8.5 h-8.5 rounded-full outline-none select-none transition-transform active:scale-90 text-ink"
          >
            {/* Each path needs a literal `d` as well as its variants: without
                one, the first paint happens before the variant resolves and the
                browser rejects d="undefined". */}
            <svg width="17" height="17" viewBox="0 0 20 20">
              <motion.path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M 3 5 L 17 5"
                variants={{ closed: { d: 'M 3 5 L 17 5' }, open: { d: 'M 3 17 L 17 3' } }}
                initial="closed"
                animate={menuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.3 }}
              />
              <motion.path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M 3 10 L 17 10"
                variants={{ closed: { d: 'M 3 10 L 17 10', opacity: 1 }, open: { d: 'M 3 10 L 17 10', opacity: 0 } }}
                initial="closed"
                animate={menuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.2 }}
              />
              <motion.path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M 3 15 L 17 15"
                variants={{ closed: { d: 'M 3 15 L 17 15' }, open: { d: 'M 3 3 L 17 17' } }}
                initial="closed"
                animate={menuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.3 }}
              />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* ── Mobile fullscreen menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/97 backdrop-blur-xl md:hidden flex flex-col justify-between pt-28 pb-8 px-6 text-white overflow-y-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            <div
              className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-jelly/10 blur-[80px] pointer-events-none animate-pulse"
              style={{ animationDuration: '6s' }}
            />
            <div
              className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-jelly-deep/15 blur-[100px] pointer-events-none animate-pulse"
              style={{ animationDuration: '8s' }}
            />

            <div className="relative z-10 flex flex-col gap-5 mt-2">
              <span className="text-[10px] font-mono tracking-widest text-white/30 uppercase">Navigation</span>
              <motion.nav variants={listVariants} initial="hidden" animate="show" className="flex flex-col gap-2">
                {MENU.map((item, i) => (
                  <motion.div key={item.label} variants={itemVariants} className="w-full">
                    <button
                      onClick={() => go(item.path)}
                      className="w-full flex items-center justify-between group py-2.5 text-left cursor-pointer border-b border-white/5"
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="font-mono text-[10px] text-white/30 tracking-wider">0{i + 1}</span>
                        <span
                          className={`font-serif text-3xl tracking-tight transition-colors group-hover:text-jelly ${
                            current === item.path ? 'text-jelly' : 'text-white'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-jelly" />
                    </button>
                  </motion.div>
                ))}
              </motion.nav>
            </div>

            <div className="relative z-10 flex flex-col gap-5 mt-auto">
              <motion.button
                onClick={() => {
                  setMenuOpen(false)
                  onStartProject()
                }}
                className="w-full py-3.5 bg-jelly text-ink rounded-full text-xs font-bold tracking-wide transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-jelly/15 hover:bg-jelly/90"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Start a Project</span>
              </motion.button>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest"
              >
                <div className="flex flex-col gap-1.5 text-left">
                  <span className="text-white/20">Connect</span>
                  {/* Same source as the contact page, so there is only one
                      place to change a number or an address. */}
                  {CONTACT_METHODS.map(({ label, value, href }) =>
                    href ? (
                      <a
                        key={label}
                        href={href}
                        {...(/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className="hover:text-jelly transition-colors normal-case text-white/60"
                      >
                        {value}
                      </a>
                    ) : (
                      <span key={label} className="normal-case text-white/60">
                        {value}
                      </span>
                    ),
                  )}
                </div>
                {/* Menu sits on a dark slab, so the white artwork works as-is. */}
                <div className="flex flex-col gap-1.5 items-end justify-end text-right">
                  <img
                    src="/brand-mark.png"
                    alt="Ad Qube"
                    width="996"
                    height="252"
                    className="h-5 w-auto object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
