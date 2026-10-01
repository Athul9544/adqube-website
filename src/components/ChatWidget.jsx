import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ArrowUpRight } from 'lucide-react'
import { EASE } from '../data'

/* The studio's own number, the same one the contact page lists. Prefilled so
   the conversation opens with context instead of an empty thread. */
const WHATSAPP =
  'https://wa.me/917560856994?text=' + encodeURIComponent('Hi Ad Qube — I came from your website and would like to talk about a project.')

/**
 * Scripted replies matched on keywords. No API key, no backend, no network —
 * everything runs locally. Add or reorder entries to change what it knows;
 * the first rule whose keyword appears in the message wins.
 */
const RULES = [
  {
    keys: ['price', 'pricing', 'cost', 'budget', 'quote', 'rate', 'charge'],
    reply:
      'We price per project — no monthly retainers. Cost depends on the format, number of variations and turnaround. Send a short brief and we will come back with a firm number.',
  },
  {
    keys: ['time', 'long', 'fast', 'deadline', 'turnaround', 'quick', 'when'],
    reply: 'First draft lands in 48–72 hours from receiving your brief, with one revision round included.',
  },
  {
    keys: ['service', 'do you', 'offer', 'make', 'what'],
    reply:
      'We make AI video ads — built for Instagram, Facebook, YouTube, TikTok and websites. Every project ships in 9:16, 1:1 and 16:9.',
  },
  {
    keys: ['script', 'brief', 'idea', 'start', 'begin', 'need'],
    reply:
      'You do not need a script or storyboard. A product, an audience and one clear goal is enough for us to build a concept.',
  },
  {
    keys: ['platform', 'instagram', 'tiktok', 'youtube', 'facebook', 'reels', 'format', 'ratio'],
    reply:
      'Meta (Instagram and Facebook), TikTok, YouTube and web embeds. Every edit is delivered in all three aspect ratios, ready to publish.',
  },
  {
    keys: ['revision', 'change', 'edit again', 'feedback'],
    reply: 'One revision round is included in every project. Further rounds are quoted up front, never a surprise.',
  },
  {
    keys: ['contact', 'email', 'phone', 'call', 'whatsapp', 'talk', 'human', 'reach'],
    reply:
      'Email adqube01@gmail.com or call +91 7560-856-994. WhatsApp is fastest — tap “Chat on WhatsApp” below and you will reach a person.',
  },
  {
    keys: ['ai', 'how', 'work', 'process'],
    reply:
      'AI handles production — visuals, editing, variations. Strategy, story and creative direction stay human. That is what keeps quality up while the timeline drops.',
  },
  { keys: ['hi', 'hello', 'hey', 'yo'], reply: 'Hey! Ask me about pricing, timelines, formats or how to get started.' },
  { keys: ['thank', 'thanks', 'cheers'], reply: 'Any time. Send a brief whenever you are ready and we will take it from there.' },
]

const FALLBACK =
  'I am not sure about that one. Try asking about pricing, turnaround, platforms or how to start — or tap “Chat on WhatsApp” to reach a person.'

const QUICK = ['What do you make?', 'How much does it cost?', 'How fast is delivery?', 'How do I start?']

const answer = (text) => {
  const q = text.toLowerCase()
  const hit = RULES.find((r) => r.keys.some((k) => q.includes(k)))
  return hit ? hit.reply : FALLBACK
}

let nextId = 0

/** Floating chat launcher, bottom-right on every page. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([
    { id: nextId++, from: 'bot', text: 'Hi — I’m the Ad Qube assistant. What can I help you with?' },
  ])

  const scroller = useRef(null)
  const timers = useRef([])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const send = (text) => {
    const clean = text.trim()
    if (!clean) return
    setMessages((m) => [...m, { id: nextId++, from: 'me', text: clean }])
    setDraft('')
    setTyping(true)
    /* A beat before replying, so it does not feel like a lookup table. */
    timers.current.push(
      setTimeout(() => {
        setTyping(false)
        setMessages((m) => [...m, { id: nextId++, from: 'bot', text: answer(clean) }])
      }, 550),
    )
  }

  return (
    <>
      {/* ── Launcher ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-ink text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-ink/90 transition-colors"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              {/* Cube only — the full wordmark is unreadable at this size. */}
              <img src="/cube.png" alt="" width="256" height="256" className="w-7 h-7 object-contain" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-5 z-[60] w-[min(92vw,370px)] max-h-[min(70vh,560px)] rounded-2xl border border-line bg-white shadow-2xl flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="bg-ink text-white px-5 py-4 flex items-center gap-3 shrink-0">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">Ad Qube Assistant</p>
                <p className="text-[11px] text-white/55 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-jelly" />
                  Usually replies instantly
                </p>
              </div>
            </div>

            <div ref={scroller} className="flex-grow overflow-y-auto px-4 py-4 space-y-3 bg-paper">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.from === 'me'
                        ? 'bg-ink text-white rounded-br-sm'
                        : 'bg-white text-body border border-line rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-line rounded-2xl rounded-bl-sm px-3.5 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted/60"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {messages.length <= 1 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-xs border border-line bg-white text-body rounded-full px-3 py-1.5 hover:border-jelly-mid hover:text-ink transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-line bg-white p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  send(draft)
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Ask a question…"
                  className="flex-grow bg-paper border border-line rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  className="shrink-0 w-10 h-10 rounded-full bg-ink text-white flex items-center justify-center hover:bg-ink/90 transition-colors cursor-pointer disabled:opacity-40"
                  disabled={!draft.trim()}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <a
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-jelly-deep hover:text-ink transition-colors"
              >
                <span>Chat on WhatsApp</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
