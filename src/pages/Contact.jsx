import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import ZoomInOverlay from '../components/ZoomInOverlay'
import ScrollBackBridge from '../components/ScrollBackBridge'
import { CONTACT_METHODS, EASE } from '../data'

const EMPTY = { name: '', email: '', phone: '', brief: '' }

const field =
  'w-full bg-paper border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50'

export default function Contact({ navigate }) {
  const [form, setForm] = useState(EMPTY)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  /* Invisible to a reader, filled in by the kind of bot that submits every
     field on a page. The server discards anything that arrives with it. */
  const [company, setCompany] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || sending) return

    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company }),
      })
      if (res.status === 503) {
        /* No mail key on the server yet. Rather than tell the visitor the site
           is broken, hand them to WhatsApp with the brief prefilled — which is
           what this form did before it could send email. Remove this branch
           once sending has been live for a while. */
        const message =
          `Hello Ad Qube,\n\nI would like to discuss a project:\n\n` +
          `*Name:* ${form.name}\n*Email:* ${form.email}\n` +
          `*Phone:* ${form.phone || 'Not provided'}\n*Brief:* ${form.brief}`
        window.open(`https://wa.me/917560856994?text=${encodeURIComponent(message)}`, '_blank')
      } else if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'The message could not be sent.')
      }
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setForm(EMPTY)
      }, 6000)
    } catch (err) {
      /* Said out loud, with the address to fall back on. A form that appears
         to succeed and quietly loses the enquiry is the worst outcome here. */
      setError(err.message || 'Something went wrong. Please email adqubestudio@gmail.com.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="relative pt-32 md:pt-44 pb-20 md:pb-28 px-6 md:px-12 lg:px-24 bg-white overflow-hidden">
      <ZoomInOverlay />
      {/* Pulling up at the top returns to whichever page handed us over. */}
      <ScrollBackBridge navigate={navigate} />
      <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-jelly/6 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-14 lg:gap-20 items-start">
        {/* ── Left: statement + contact details ── */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">Contact</span>
            <span className="h-px w-10 bg-jelly-deep/40" />
          </div>

          <h1 className="heading-800 text-6xl sm:text-7xl lg:text-8xl text-ink leading-[0.92]">
            Let’s
            <br />
            <span className="text-ink/25">Create.</span>
          </h1>

          <p className="mt-8 text-body text-base md:text-lg leading-relaxed max-w-md">
            Share your idea with us. From the first concept to the final frame, we&rsquo;ll help shape your story into a
            realistic, cinematic video made for your brand.
          </p>

          {/* Phone / email / location */}
          <div className="mt-10 grid grid-cols-1 sm:max-w-md gap-3">
            {CONTACT_METHODS.map((m) => {
              const Icon = m.icon
              const inner = (
                <>
                  <span className="w-10 h-10 rounded-full bg-jelly/12 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-jelly-deep" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-muted">{m.label}</span>
                    <span className="block text-ink text-base font-medium">{m.value}</span>
                  </span>
                </>
              )
              const base = 'flex items-center gap-4 rounded-2xl border border-line bg-paper p-4 transition-colors'
              /* tel: and mailto: hand off to another app and should stay in
                 the tab; a map is a web page and would navigate away from the
                 form the visitor is part-way through filling in. */
              const external = /^https?:/.test(m.href || '')
              return m.href ? (
                <a
                  key={m.label}
                  href={m.href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`${base} hover:border-jelly-mid`}
                >
                  {inner}
                </a>
              ) : (
                <div key={m.label} className={base}>
                  {inner}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ── Right: the form ── */}
        <motion.div
          className="rounded-3xl border border-line bg-paper p-7 md:p-10 shadow-sm"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          <h2 className="heading-700 text-2xl md:text-3xl text-ink">Get in touch</h2>
          <p className="mt-2 text-body text-sm">
            Send a brief — a product, an audience and one goal is enough to start.
          </p>

          <div className="h-px bg-line my-7" />

          {sent ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <div className="bg-jelly/15 text-jelly-deep p-4 rounded-full mb-5">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-serif text-2xl text-ink font-normal mb-2">Brief received!</h3>
              <p className="text-muted text-sm font-light max-w-xs leading-relaxed">
                Thanks, <strong className="text-ink font-medium">{form.name}</strong>. We will reply at{' '}
                <strong className="text-ink font-medium">{form.email}</strong> within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="hello@yourbrand.com"
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  className={field}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-1.5">
                  Brief / Goals
                </label>
                <textarea
                  rows="4"
                  value={form.brief}
                  onChange={(e) => setForm({ ...form, brief: e.target.value })}
                  placeholder="Your product, who it is for, where the ad will run…"
                  className={`${field} resize-none`}
                />
              </div>

              {/* The honeypot. Hidden from sight and from screen readers, and
                  taken out of the tab order, so nobody using the page can land
                  on it by accident. */}
              <input
                type="text"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {error && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="group mx-auto flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-white font-semibold px-10 py-3.5 rounded-xl text-sm transition-all mt-2 shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{sending ? 'Sending…' : 'Submit'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
