import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { EASE } from '../data'

const EMPTY = { name: '', email: '', phone: '', brief: '' }

/** "Start a Project" intake modal — hands the brief off to WhatsApp. */
export default function ProjectModal({ open, onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    if (!form.name || !form.email) return

    const message = `Hello Ad Qube,\n\nI would like to discuss a project:\n\n*Name:* ${form.name}\n*Email:* ${form.email}\n*Phone:* ${form.phone || '—'}\n*Brief:* ${form.brief}`
    window.open(`https://wa.me/917560856994?text=${encodeURIComponent(message)}`, '_blank')

    setSent(true)
    setTimeout(() => {
      onClose()
      setSent(false)
      setForm(EMPTY)
    }, 3500)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-ink/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-t-3xl md:rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-t md:border border-line relative max-h-[92dvh] flex flex-col"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ ease: EASE, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 bg-white/80 hover:bg-white text-ink shadow-md backdrop-blur-md p-1.5 rounded-full hover:scale-105 transition-all z-20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 md:p-10 overflow-y-auto w-full">
              {sent ? (
                <motion.div
                  className="py-12 text-center flex flex-col items-center justify-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="bg-jelly/15 text-jelly-deep p-4 rounded-full mb-6">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
                  <h3 className="font-serif text-2xl text-ink font-normal mb-3">Brief received!</h3>
                  <p className="text-muted text-xs md:text-sm font-light max-w-xs leading-relaxed">
                    Thanks, <strong className="text-ink font-medium">{form.name}</strong>. We'll review your project and
                    get back to you at <strong className="text-ink font-medium">{form.email}</strong> within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-jelly-deep" />
                    <span className="text-xs font-mono uppercase tracking-wider text-jelly-deep font-semibold">
                      Ad Qube Studio
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
                    <div>
                      <h3 className="font-serif text-2xl md:text-3xl text-ink font-normal leading-snug mb-2">
                        Tell us about your project
                      </h3>
                      <p className="text-muted text-xs md:text-sm font-light leading-relaxed">
                        We'll review your brief and get back within 24 hours.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={submit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5 font-sans">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-ink/5 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5 font-sans">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="hello@yourbrand.com"
                        className="w-full bg-ink/5 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5 font-sans">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 00000 00000"
                        className="w-full bg-ink/5 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5 font-sans">
                        Brief / Goals
                      </label>
                      <textarea
                        rows="3"
                        value={form.brief}
                        onChange={(e) => setForm({ ...form, brief: e.target.value })}
                        placeholder="Budget range, timeline, or anything that helps us understand your goal…"
                        className="w-full bg-ink/5 border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="mx-auto flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-semibold px-10 py-3.5 rounded-xl text-sm transition-all mt-2 shadow-md active:scale-[0.98] cursor-pointer"
                    >
                      <span>Submit</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-center text-[11px] text-muted font-light pt-1">
                      We reply within 24 hours. No calls required to start.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
