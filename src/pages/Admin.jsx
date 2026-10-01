import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lock,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  X,
  Eye,
  EyeOff,
  Film,
  FileText,
  Orbit,
  Check,
  Clapperboard,
  Shapes,
} from 'lucide-react'
import { MediaImage } from '../components/Media'
import { PLAYGROUND_FRAMES } from '../components/CreativePlayground'
import { useContent } from '../content'
import { putMedia, isUpload, useMediaUrl, useMediaKind } from '../media'
import { adminToken, signIn } from '../session'
import { EASE } from '../data'

/* The password is checked by /api/login, against a value held in an
   environment variable on the server. It is no longer in this bundle, which
   matters now that signing in grants write access to storage every visitor
   reads rather than to a copy on one machine. What comes back is a signed
   token; every write sends it and the server verifies it. */

const field =
  'w-full bg-white border border-line rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-jelly transition-colors text-ink placeholder:text-muted/50'
const label = 'block text-[11px] font-semibold text-ink uppercase tracking-wider mb-1.5'

/**
 * Pulls the 11-character video id out of whatever gets pasted — a watch URL, a
 * youtu.be short link, a Shorts or embed URL, or a bare id. The embed only
 * works with the id, so a pasted URL would otherwise produce a dead player.
 */
export function toYouTubeId(input = '') {
  const s = String(input).trim()
  if (!s) return ''
  if (/^[\w-]{11}$/.test(s)) return s
  const m = s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/)
  return m ? m[1] : s
}

const EMPTY_PROJECT = {
  id: '',
  slug: '',
  title: '',
  category: 'AI Video Ads',
  description: '',
  image: '',
  video: '',
  youtubeId: '',
  timeline: '',
  results: '',
  disclaimer: '',
  deliverables: [],
  color: 'from-[#141414]/90 via-[#261014]/50 to-[#0A120E]/40',
}

const EMPTY_POST = {
  id: '',
  slug: '',
  title: '',
  tag: '',
  date: '',
  readTime: '',
  summary: '',
  image: '',
  body: '',
}

/**
 * File picker + preview for one media field. Accepts an upload, or a path to
 * something already sitting in public/.
 */
function MediaField({ kind, label: text, value, onChange, hint, fallback }) {
  const ref = useRef(null)
  const [busy, setBusy] = useState(false)
  /* Previews whatever is actually on the site: the custom media if one is set,
     otherwise the built-in it falls back to. Showing nothing when the field is
     empty leaves you guessing what is currently playing. */
  const shown = value || fallback || ''
  const url = useMediaUrl(shown)
  const detected = useMediaKind(shown)

  const pick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      onChange(await putMedia(file))
    } catch (err) {
      window.alert(`Could not store that file: ${err.message}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className={label}>{text}</label>

      {url && (
        <div className="relative mb-2 rounded-xl overflow-hidden border border-line bg-ink/5 h-32 flex items-center justify-center">
          {/* With kind="media" the field takes either, so the preview follows
              what was actually set rather than a fixed assumption. */}
          {(kind === 'media' ? detected === 'video' : kind === 'video') ? (
            <video src={url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
          ) : (
            <img src={url} alt="" className="h-full w-full object-cover" />
          )}

          {/* Says which of the two you are looking at, so the preview is never
              mistaken for something that has been set. */}
          <span
            className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono ${
              value ? 'bg-jelly text-ink' : 'bg-white/85 text-muted'
            }`}
          >
            {value ? 'Yours' : 'Built-in'}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={isUpload(value) ? 'Uploaded file' : value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isUpload(value)}
          placeholder={kind === 'video' ? '/hero.mp4' : kind === 'media' ? '/hero.mp4 or /blog/hook.webp' : '/blog/hook.webp'}
          className={`${field} flex-grow ${isUpload(value) ? 'text-muted' : ''}`}
        />
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="shrink-0 inline-flex items-center gap-1.5 border border-line hover:border-jelly-mid text-ink text-xs font-semibold px-3.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" />
          {busy ? '…' : 'Upload'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title="Clear"
            className="shrink-0 px-3 rounded-xl border border-line hover:border-red-300 text-red-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <input
        ref={ref}
        type="file"
        accept={kind === 'video' ? 'video/*' : kind === 'media' ? 'video/*,image/*' : 'image/*'}
        onChange={pick}
        className="hidden"
      />
      <p className="mt-1 text-[11px] text-muted leading-relaxed">
        {hint || 'Upload a file, or type a path to something in public/.'}
      </p>
    </div>
  )
}

/* ── Password gate ──────────────────────────────────────────────────── */
/* Drifting gold blooms behind the card. Transform/opacity only, so they stay on
   the compositor and cost nothing per frame. */
function Aurora() {
  const blobs = [
    { c: 'bg-jelly/40', s: 'w-[46vw] h-[46vw] max-w-[520px] max-h-[520px]', pos: 'top-[-12%] left-[-8%]', d: 18, x: 90, y: 50 },
    { c: 'bg-orange/25', s: 'w-[38vw] h-[38vw] max-w-[440px] max-h-[440px]', pos: 'bottom-[-14%] right-[-6%]', d: 22, x: -80, y: -60 },
    { c: 'bg-jelly-mid/30', s: 'w-[30vw] h-[30vw] max-w-[340px] max-h-[340px]', pos: 'top-[35%] right-[18%]', d: 26, x: 60, y: 70 },
  ]
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[90px] ${b.c} ${b.s} ${b.pos}`}
          animate={{ x: [0, b.x, 0], y: [0, b.y, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* Motes rising through the frame — the only literally "live" element, kept to
   14 so the loop stays cheap. Bronze rather than gold: pale gold vanishes
   against a white backdrop. */
function Embers() {
  const dots = Array.from({ length: 14 }, (_, i) => ({
    left: `${(i * 7.3 + 4) % 96}%`,
    size: 2 + (i % 3),
    delay: (i * 1.1) % 9,
    dur: 9 + (i % 5) * 1.6,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-jelly-deep/50"
          style={{ left: d.left, width: d.size, height: d.size, bottom: -8 }}
          animate={{ y: [0, -700], opacity: [0, 0.9, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}

function Gate({ onPass }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  /* Bumped on every failure so the shake replays even on repeated wrong tries —
     re-running an animation needs the key to actually change. */
  const [shake, setShake] = useState(0)

  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    let ok = false
    try {
      ok = await signIn(value)
    } catch {
      /* The network, not the password — say so rather than accusing them of
         mistyping something they got right. */
      setError('Could not reach the server. Check your connection.')
      setValue('')
      setShake((n) => n + 1)
      setBusy(false)
      return
    }
    setBusy(false)
    if (ok) {
      onPass()
    } else {
      setError('Incorrect password.')
      setValue('')
      setShake((n) => n + 1)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 bg-white overflow-hidden">
      <Aurora />
      <Embers />
      {/* Fine dot grid, masked to a soft vignette so it fades at the edges. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.5] bg-[radial-gradient(rgba(26,22,17,0.10)_1px,transparent_1px)] [background-size:22px_22px]"
        style={{ maskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)', WebkitMaskImage: 'radial-gradient(ellipse at center, #000 35%, transparent 78%)' }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <motion.form
          onSubmit={submit}
          key={shake}
          animate={shake ? { x: [0, -11, 10, -7, 5, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="rounded-3xl p-8 border border-line bg-white/85 backdrop-blur-2xl shadow-[0_24px_60px_-16px_rgba(58,44,10,0.22)]"
        >
          <div className="flex flex-col items-center text-center">
            {/* The brand mark is a ~4:1 wordmark, so it gets its own width
                rather than being squeezed into a circle. The glow behind it
                breathes; the rule beneath sweeps. */}
            <div className="relative mb-6 flex items-center justify-center">
              <motion.span
                className="absolute w-44 h-16 rounded-full bg-jelly/45 blur-2xl"
                animate={{ scale: [1, 1.18, 1], opacity: [0.45, 0.85, 0.45] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Artwork is white, so it needs inverting on this light card. */}
              <img src="/brand-mark.png" alt="Ad Qube" className="relative w-40 h-auto object-contain brightness-0" />
            </div>

            <div className="relative w-24 h-px bg-line overflow-hidden mb-5">
              <motion.span
                className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-jelly-deep to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            <h1 className="heading-700 text-2xl text-ink tracking-tight">Admin Panel</h1>
            <p className="mt-2 text-body text-sm">Sign in to manage Works and Blog.</p>
          </div>

          <div className="relative mt-7">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type={show ? 'text' : 'password'}
              autoFocus
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError('')
              }}
              placeholder="Password"
              className={`w-full rounded-xl bg-paper border pl-10 pr-11 py-3 text-sm text-ink placeholder:text-muted/50 outline-none transition-colors ${
                error ? 'border-red-400' : 'border-line focus:border-jelly-mid'
              }`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-jelly-deep transition-colors cursor-pointer"
            >
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-5 mt-2">
            {error && (
              <motion.p
                className="text-xs text-red-500"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.p>
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group mt-3 w-full flex items-center justify-center gap-2 bg-jelly hover:bg-jelly-mid text-ink text-sm font-bold py-3.5 rounded-xl transition-colors cursor-pointer shadow-[0_10px_28px_-8px_rgba(227,179,65,0.55)]"
          >
            <span>Unlock</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-[11px] font-mono uppercase tracking-widest text-muted/60">
          Ad Qube Studio · Internal
        </p>
      </motion.div>
    </section>
  )
}

/* ── Row in a list ──────────────────────────────────────────────────── */
function Row({ title, meta, onEdit, onDelete, onUp, onDown }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-line rounded-xl px-4 py-3">
      <div className="min-w-0 flex-grow">
        <p className="text-ink text-sm font-medium truncate">{title || 'Untitled'}</p>
        <p className="text-muted text-[11px] font-mono truncate">{meta}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onUp} title="Move up" className="p-2 rounded-lg hover:bg-ink/5 text-muted cursor-pointer">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button onClick={onDown} title="Move down" className="p-2 rounded-lg hover:bg-ink/5 text-muted cursor-pointer">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button onClick={onEdit} title="Edit" className="p-2 rounded-lg hover:bg-ink/5 text-ink cursor-pointer">
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-2 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function Admin({ navigate }) {
  /* A token from a previous sign-in this session. Its signature is checked by
     the server on every write, so a forged one buys nothing but the sight of
     an empty form. */
  const [authed, setAuthed] = useState(() => Boolean(adminToken()))
  const [tab, setTab] = useState(null) // null = section chooser
  const [draft, setDraft] = useState(null) // the record being edited, or null
  const [note, setNote] = useState('')

  const c = useContent()

  /* The site hides the native cursor in favour of a custom one, which this
     panel does not render. Opt back in, or there is no cursor here at all. */
  useEffect(() => {
    document.body.classList.add('native-cursor')
    return () => document.body.classList.remove('native-cursor')
  }, [])

  useEffect(() => {
    if (!note) return
    const t = setTimeout(() => setNote(''), 3000)
    return () => clearTimeout(t)
  }, [note])

  if (!authed) return <Gate onPass={() => setAuthed(true)} />

  const isWorks = tab === 'works'
  const list = isWorks ? c.projects : c.posts

  /* Everything eligible for the ring, in the order it appears on the site. Only
     records with a cover can go in — the ring is made of images. */
  const orbitItems = [
    ...c.projects.map((r) => ({ kind: 'project', record: r, label: 'Work' })),
    ...c.posts.map((r) => ({ kind: 'post', record: r, label: 'Blog' })),
  ].filter((i) => i.record.image)

  const startNew = () => setDraft(isWorks ? { ...EMPTY_PROJECT } : { ...EMPTY_POST })

  const save = (e) => {
    e.preventDefault()
    if (!draft.title.trim()) return
    /* Normalise on save so a pasted URL is stored as the bare id. */
    if (isWorks) c.saveProject({ ...draft, youtubeId: toYouTubeId(draft.youtubeId) })
    else c.savePost(draft)
    setNote(draft.id ? 'Saved.' : 'Added.')
    setDraft(null)
  }

  const del = (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
    if (isWorks) c.deleteProject(id)
    else c.deletePost(id)
    setNote('Deleted.')
    if (draft?.id === id) setDraft(null)
  }

  const exportFile = () => {
    const blob = new Blob([c.exportJson()], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `adqube-content-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <section className="min-h-screen bg-paper px-6 md:px-10 lg:px-14 py-10">
      <div className="max-w-6xl mx-auto">
        {/* ── Bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="mr-auto">
            <h1 className="heading-700 text-2xl text-ink">Content Admin</h1>
            <p className="text-body text-sm mt-0.5">Manage the Works and Blog entries shown on the site.</p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 border border-line hover:border-jelly-mid text-ink text-xs font-semibold px-4 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            View site
          </button>
          <button
            onClick={exportFile}
            title="Download a JSON backup"
            className="inline-flex items-center gap-2 border border-line hover:border-jelly-mid text-ink text-xs font-semibold px-4 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>

        {note && (
          <div className="mb-6 text-sm text-jelly-deep bg-jelly/10 border border-jelly/30 rounded-xl px-4 py-2.5">
            {note}
          </div>
        )}

        {/* ── Section chooser ── */}
        {!tab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                key: 'works',
                Icon: Film,
                name: 'Works',
                count: c.projects.length,
                blurb: 'Case studies on the Works page and the homepage grid. Upload a video or add a YouTube link.',
              },
              {
                key: 'blog',
                Icon: FileText,
                name: 'Blog',
                count: c.posts.length,
                blurb: 'Articles on the Blog page. Write the body, upload a cover image, set the date.',
              },
              {
                key: 'orbit',
                Icon: Orbit,
                name: 'Inside the Work',
                count: orbitItems.filter((i) => c.inOrbit(i.kind, i.record.id)).length,
                blurb: 'The ring of covers on the homepage. Pick which works and articles appear in it.',
              },
              {
                key: 'stack',
                Icon: Clapperboard,
                name: 'Creative Stack',
                count: c.stackVideo ? 1 : 0,
                blurb: 'The looping video on the homepage. Upload a replacement, or delete to restore the default.',
              },
              {
                key: 'playground',
                Icon: Shapes,
                name: 'Created Differently',
                count: Object.keys(c.playground).length,
                blurb: 'The five floating frames on the homepage. Set a video for any of them, or delete to restore.',
              },
            ].map(({ key, Icon, name, count, blurb }) => (
              <motion.button
                key={key}
                onClick={() => {
                  setTab(key)
                  setDraft(null)
                }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="group text-left bg-white border border-line rounded-2xl p-7 hover:border-jelly-mid hover:shadow-lg transition-[border-color,box-shadow] duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="w-11 h-11 rounded-full bg-jelly/12 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-jelly-deep" />
                  </span>
                  <span className="font-serif text-3xl text-line group-hover:text-jelly transition-colors">
                    {String(count).padStart(2, '0')}
                  </span>
                </div>
                <h2 className="heading-700 mt-5 text-xl text-ink">{name}</h2>
                <p className="mt-2 text-body text-sm leading-relaxed">{blurb}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-jelly-deep">
                  Manage
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Section header ── */}
        {tab && (
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => {
                setTab(null)
                setDraft(null)
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All sections
            </button>
            <span className="h-4 w-px bg-line" />
            <h2 className="heading-700 text-base text-ink">
              {{ orbit: 'Inside the Work', stack: 'Creative Stack', playground: 'Created Differently' }[tab] ||
                (isWorks ? 'Works' : 'Blog')}{' '}
              <span className="text-muted font-normal">
                {tab === 'orbit'
                  ? `(${orbitItems.filter((i) => c.inOrbit(i.kind, i.record.id)).length}/${orbitItems.length})`
                  : tab === 'stack'
                    ? `(${c.stackVideo ? 'custom' : 'default'})`
                    : tab === 'playground'
                      ? `(${Object.keys(c.playground).length}/${PLAYGROUND_FRAMES.length} custom)`
                      : `(${list.length})`}
              </span>
            </h2>
            {tab !== 'orbit' && tab !== 'stack' && tab !== 'playground' && (
              <button
                onClick={startNew}
                className="ml-auto inline-flex items-center gap-1.5 bg-jelly-deep hover:bg-jelly-deep/90 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New {isWorks ? 'project' : 'post'}
              </button>
            )}
          </div>
        )}

        {/* ── Created Differently: one video per floating frame ── */}
        {tab === 'playground' && (
          <div className="max-w-2xl space-y-4">
            <p className="text-body text-sm">
              Each of the five frames shows its own media. Set a video or an image per frame, or leave it and the
              built-in clip plays. Deleting only clears what you set — the frame is never left blank.
            </p>

            {PLAYGROUND_FRAMES.map((f) => {
              const custom = c.playground[f.label]
              return (
                <div key={f.label} className="bg-white border border-line rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="mr-auto">
                      <p className="text-ink text-sm font-semibold">{f.label}</p>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-muted">
                        {custom ? 'Custom media' : 'Built-in clip'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (!custom) return
                        if (window.confirm(`Delete the media on “${f.label}” and restore the built-in clip?`)) {
                          c.setPlaygroundVideo(f.label, null)
                          setNote(`${f.label} reverted.`)
                        }
                      }}
                      disabled={!custom}
                      className="inline-flex items-center gap-1.5 border border-line hover:border-red-300 text-red-500 text-xs font-semibold px-3.5 py-2 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>

                  <MediaField
                    kind="media"
                    label="Video or image"
                    value={custom || ''}
                    fallback={f.video}
                    onChange={(v) => {
                      c.setPlaygroundVideo(f.label, v)
                      setNote(`${f.label} updated.`)
                    }}
                    hint="A video plays muted on a loop; an image sits still."
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* ── Creative Stack: the looping homepage video ── */}
        {tab === 'stack' && (
          <div className="max-w-xl">
            <p className="text-body text-sm mb-5">
              The looping video inside the ink field on the homepage. Upload a replacement or point at a file in{' '}
              <code className="text-ink">public/</code>. Deleting it puts the built-in clip back — the section is never
              left empty.
            </p>

            <div className="bg-white border border-line rounded-2xl p-5">
              <MediaField
                kind="video"
                label="Creative Stack video"
                value={c.stackVideo || ''}
                fallback="/hero.mp4"
                onChange={(v) => {
                  c.setStackVideo(v)
                  setNote('Creative Stack video updated.')
                }}
                hint="MP4 or WebM. Plays muted on a loop, so keep it short."
              />

              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-muted mr-auto">
                  {c.stackVideo ? 'Custom video in use' : 'Using the built-in clip'}
                </span>
                <button
                  onClick={() => {
                    if (!c.stackVideo) return
                    if (window.confirm('Delete this video and restore the built-in clip?')) {
                      c.setStackVideo(null)
                      setNote('Reverted to the built-in clip.')
                    }
                  }}
                  disabled={!c.stackVideo}
                  className="inline-flex items-center gap-1.5 border border-line hover:border-red-300 text-red-500 text-xs font-semibold px-4 py-2.5 rounded-full transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-line"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Inside the Work: pick what rides the homepage ring ── */}
        {tab === 'orbit' && (
          <div className="max-w-3xl">
            <p className="text-body text-sm mb-5">
              These covers orbit the headset on the homepage. Tap one to include or exclude it — anything without a
              cover image is left out automatically.
            </p>

            {orbitItems.length === 0 && (
              <p className="text-body text-sm bg-white border border-line rounded-xl px-4 py-6 text-center">
                Nothing to show yet. Add a cover image to a work or an article first.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {orbitItems.map((i) => {
                const on = c.inOrbit(i.kind, i.record.id)
                return (
                  <button
                    key={`${i.kind}:${i.record.id}`}
                    onClick={() => c.toggleOrbit(i.kind, i.record.id)}
                    aria-pressed={on}
                    className={`group relative text-left rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      on ? 'border-jelly shadow-md' : 'border-line opacity-55 hover:opacity-80'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-ink relative">
                      <MediaImage
                        src={i.record.image}
                        alt=""
                        loading="lazy"
                        className={`absolute inset-0 w-full h-full object-cover transition-[filter] ${
                          on ? '' : 'grayscale'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />

                      <span
                        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          on ? 'bg-jelly text-ink' : 'bg-white/25 text-white/70'
                        }`}
                      >
                        {on && <Check className="w-3.5 h-3.5" />}
                      </span>

                      <span className="absolute top-2 left-2 rounded-full bg-white/85 text-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono">
                        {i.label}
                      </span>

                      <p className="absolute inset-x-0 bottom-0 p-2.5 text-white text-[11px] font-semibold leading-snug line-clamp-2">
                        {i.record.title}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div
          className={`grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 items-start ${
            tab && tab !== 'orbit' && tab !== 'stack' && tab !== 'playground' ? '' : 'hidden'
          }`}
        >
          {/* ── List ── */}
          <div className="space-y-2.5">
            {list.length === 0 && (
              <p className="text-body text-sm bg-white border border-line rounded-xl px-4 py-6 text-center">
                Nothing here yet. Add your first {isWorks ? 'project' : 'post'}.
              </p>
            )}
            {list.map((r, i) => (
              <Row
                key={r.id}
                title={r.title}
                meta={isWorks ? `${r.category || '—'} · /${r.slug}` : `${r.tag || '—'} · /blog/${r.slug}`}
                onEdit={() => setDraft({ ...(isWorks ? EMPTY_PROJECT : EMPTY_POST), ...r })}
                onDelete={() => del(r.id, r.title)}
                onUp={() => (isWorks ? c.moveProject(r.id, -1) : c.movePost(r.id, -1))}
                onDown={() => (isWorks ? c.moveProject(r.id, 1) : c.movePost(r.id, 1))}
              />
            ))}
          </div>

          {/* ── Editor ── */}
          <div className="lg:sticky lg:top-6">
            {!draft ? (
              <div className="bg-white border border-line rounded-2xl p-8 text-center">
                <p className="text-body text-sm">
                  Select an entry to edit, or add a new {isWorks ? 'project' : 'post'}.
                </p>
              </div>
            ) : (
              <form onSubmit={save} className="bg-white border border-line rounded-2xl p-6 md:p-7 space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="heading-700 text-lg text-ink mr-auto">
                    {draft.id ? 'Edit' : 'New'} {isWorks ? 'project' : 'post'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="p-1.5 rounded-lg hover:bg-ink/5 text-muted cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className={label}>Title *</label>
                  <input required value={draft.title} onChange={(e) => set('title', e.target.value)} className={field} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={label}>Slug</label>
                    <input
                      value={draft.slug}
                      onChange={(e) => set('slug', e.target.value)}
                      placeholder="auto from title"
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>{isWorks ? 'Category' : 'Tag'}</label>
                    <input
                      value={isWorks ? draft.category : draft.tag}
                      onChange={(e) => set(isWorks ? 'category' : 'tag', e.target.value)}
                      className={field}
                    />
                  </div>
                </div>

                <MediaField
                  kind="image"
                  label={isWorks ? 'Cover image' : 'Image'}
                  value={draft.image}
                  onChange={(v) => set('image', v)}
                  hint={
                    isWorks
                      ? 'Shown on the card when there is no video, and as the video poster.'
                      : 'Shown on the blog card and at the top of the article.'
                  }
                />

                {isWorks && (
                  <MediaField
                    kind="video"
                    label="Video"
                    value={draft.video}
                    onChange={(v) => set('video', v)}
                    hint="Plays on the card and in the popup. Takes priority over the cover image."
                  />
                )}

                <div>
                  <label className={label}>{isWorks ? 'Description' : 'Summary'}</label>
                  <textarea
                    rows="3"
                    value={isWorks ? draft.description : draft.summary}
                    onChange={(e) => set(isWorks ? 'description' : 'summary', e.target.value)}
                    className={`${field} resize-none`}
                  />
                </div>

                {isWorks ? (
                  <>
                    <div>
                      <label className={label}>YouTube link or ID</label>
                      <input
                        value={draft.youtubeId}
                        onChange={(e) => set('youtubeId', e.target.value)}
                        placeholder="https://youtu.be/… or paste the watch URL"
                        className={field}
                      />
                      <p className="mt-1 text-[11px] text-muted leading-relaxed">
                        {toYouTubeId(draft.youtubeId) && toYouTubeId(draft.youtubeId) !== draft.youtubeId.trim() ? (
                          <>
                            Video ID: <code className="text-jelly-deep">{toYouTubeId(draft.youtubeId)}</code> — plays
                            automatically when the project is opened.
                          </>
                        ) : (
                          'Paste any YouTube URL. It plays automatically when the project is opened.'
                        )}
                      </p>
                    </div>

                    <div>
                      <label className={label}>Timeline</label>
                      <input
                        value={draft.timeline}
                        onChange={(e) => set('timeline', e.target.value)}
                        placeholder="48 Hours"
                        className={field}
                      />
                    </div>
                    <div>
                      <label className={label}>Deliverables — one per line</label>
                      <textarea
                        rows="4"
                        value={(draft.deliverables || []).join('\n')}
                        onChange={(e) =>
                          set(
                            'deliverables',
                            e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                          )
                        }
                        className={`${field} resize-none`}
                      />
                    </div>
                    <div>
                      <label className={label}>Outcome</label>
                      <textarea
                        rows="2"
                        value={draft.results}
                        onChange={(e) => set('results', e.target.value)}
                        className={`${field} resize-none`}
                      />
                    </div>
                    <div>
                      <label className={label}>Disclaimer</label>
                      <textarea
                        rows="2"
                        value={draft.disclaimer}
                        onChange={(e) => set('disclaimer', e.target.value)}
                        placeholder="optional"
                        className={`${field} resize-none`}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={label}>Date</label>
                        <input
                          value={draft.date}
                          onChange={(e) => set('date', e.target.value)}
                          placeholder="August 12, 2026"
                          className={field}
                        />
                      </div>
                      <div>
                        <label className={label}>Read time</label>
                        <input
                          value={draft.readTime}
                          onChange={(e) => set('readTime', e.target.value)}
                          placeholder="5 min read"
                          className={field}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={label}>Article body</label>
                      <textarea
                        rows="14"
                        value={draft.body}
                        onChange={(e) => set('body', e.target.value)}
                        className={`${field} resize-y font-mono text-[13px] leading-relaxed`}
                      />
                      <p className="mt-1.5 text-[11px] text-muted leading-relaxed">
                        <code className="text-ink">## </code> heading &nbsp;·&nbsp;
                        <code className="text-ink">&gt; </code> pull-quote &nbsp;·&nbsp;
                        <code className="text-ink">- </code> list item &nbsp;·&nbsp; blank line separates paragraphs.
                      </p>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    className="bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors cursor-pointer"
                  >
                    {draft.id ? 'Save changes' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraft(null)}
                    className="text-muted hover:text-ink text-sm transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <p className="mt-10 text-[11px] text-muted leading-relaxed max-w-2xl">
          Changes are stored in this browser only. Use <strong className="text-ink">Export</strong> to take a backup.
        </p>
      </div>
    </section>
  )
}
