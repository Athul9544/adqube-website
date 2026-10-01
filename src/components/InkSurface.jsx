import { useCallback, useEffect, useRef, useState } from 'react'

/* ── Tuning ─────────────────────────────────────────────────────────── */
const PAD = 170 // px of canvas beyond the card — the water the ink spreads into
/* The effect runs only while the cursor is over the card. Intensity still rises
   as it nears an edge, but never drops to nothing while inside. */
const EDGE_FALLOFF = 320
const MIN_STRENGTH = 0.35
const MAX_PARTICLES = 120
const MAX_DPR = 1.5
const TAU = Math.PI * 2

/* Deposit cadence. Movement drives it; the time floor keeps a held-still
   cursor gently bleeding rather than the ink vanishing under it. */
const STEP_DIST = 11
const STEP_MS = 55
const IDLE_MS = 170

/* Requested palette, as hues. A single drop draws several adjacent entries so
   its layers mix rather than reading as one flat colour. */
const HUES = [326, 271, 239, 189, 142, 48, 27]

/* One drop = four layers from the same origin, expanding at different rates:
   saturated core, diffusion, ripple, then mist. */
const LAYERS = [
  { r0: 6, rMax: 58, a: 0.95, life: 700, wob: 0.3, drift: 20 },
  { r0: 10, rMax: 112, a: 0.74, life: 960, wob: 0.44, drift: 40 },
  { r0: 15, rMax: 166, a: 0.44, life: 1260, wob: 0.58, drift: 60 },
  { r0: 20, rMax: 224, a: 0.22, life: 1520, wob: 0.72, drift: 78 },
]

const rand = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.min(Math.max(v, a), b)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/** Distance to the nearest edge of a w×h box at the origin, inside or out. */
function edgeDistance(x, y, w, h) {
  const ox = Math.max(-x, 0, x - w)
  const oy = Math.max(-y, 0, y - h)
  if (ox > 0 || oy > 0) return Math.hypot(ox, oy)
  return Math.min(x, y, w - x, h - y)
}

/**
 * Where the drop lands, and which way it spreads.
 *
 * The cursor is always inside the card here, so the drop is projected onto the
 * nearest edge and nudged just past it — drawn at the cursor itself it would
 * sit behind the card and never be seen. The ink tracks the cursor along that
 * edge, outside the video, spreading along the edge's normal.
 */
function inkOrigin(x, y, w, h) {
  const dL = x
  const dR = w - x
  const dT = y
  const dB = h - y
  const m = Math.min(dL, dR, dT, dB)
  if (m === dL) return { x: -8, y, nx: -1, ny: 0 }
  if (m === dR) return { x: w + 8, y, nx: 1, ny: 0 }
  if (m === dT) return { x, y: -8, nx: 0, ny: -1 }
  return { x, y: h + 8, nx: 0, ny: 1 }
}

/**
 * Wraps a card. A rainbow ink drop forms beside the cursor whenever it comes
 * within RADIUS of the card's edge, spreads outward, and dissolves.
 *
 * Nothing is ambient: with the cursor away there is no canvas content, no
 * shadow and no running loop. The canvas is painted BEHIND the card, so the
 * card occludes anything falling inside its bounds — the video needs no mask
 * and is never touched.
 */
export default function InkSurface({ children, className = '' }) {
  const card = useRef(null)
  const canvas = useRef(null)
  const ctx = useRef(null)

  const parts = useRef([])
  const raf = useRef(0)
  const running = useRef(false)
  const size = useRef({ w: 0, h: 0 })
  /* The card's position on screen, kept up to date by the resize/scroll
     handlers so pointer events never have to measure it themselves. */
  const box = useRef({ left: 0, top: 0 })
  const lastFrame = useRef(0)

  const pointer = useRef({ x: 0, y: 0, inside: false })
  const smooth = useRef({ x: 0, y: 0, primed: false })
  const lastDrop = useRef({ x: 0, y: 0, t: 0 })

  const [tier, setTier] = useState('off')
  const tierRef = useRef('off')
  useEffect(() => {
    tierRef.current = tier
  }, [tier])

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia('(min-width: 1024px)')
    const sync = () => {
      /* Off entirely on touch: the effect exists to react to a cursor, and
         there is none. */
      if (calm.matches || !fine.matches) setTier('off')
      else setTier(wide.matches ? 'full' : 'reduced')
    }
    sync()
    fine.addEventListener('change', sync)
    calm.addEventListener('change', sync)
    wide.addEventListener('change', sync)
    return () => {
      fine.removeEventListener('change', sync)
      calm.removeEventListener('change', sync)
      wide.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (tier === 'off' || !card.current || !canvas.current) return
    const el = card.current

    const resize = () => {
      const r = el.getBoundingClientRect()
      size.current = { w: r.width, h: r.height }
      /* Kept for the pointer handler, which used to measure the card on every
         single mousemove — a forced layout flush per event, at exactly the
         moment the canvas wants the main thread. Position changes only on
         scroll or resize, both of which land here. */
      box.current = { left: r.left, top: r.top }
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const c = canvas.current
      if (!c) return
      const cw = r.width + PAD * 2
      const ch = r.height + PAD * 2
      c.width = Math.round(cw * dpr)
      c.height = Math.round(ch * dpr)
      c.style.width = `${cw}px`
      c.style.height = `${ch}px`
      const g = c.getContext('2d')
      g.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.current = g
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    /* The box moves with the page even though its size does not, and the
       observer says nothing about that. Cheap here, and it keeps the pointer
       handler free of layout reads. */
    const onScroll = () => {
      const r = el.getBoundingClientRect()
      box.current = { left: r.left, top: r.top }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [tier])

  /** Release one drop: four layers, same origin, adjacent palette hues. */
  const drop = useCallback((o, strength) => {
    const reduced = tierRef.current === 'reduced'
    const layers = reduced ? LAYERS.slice(0, 3) : LAYERS
    const hueStart = Math.floor(Math.random() * HUES.length)

    layers.forEach((L, i) => {
      if (parts.current.length >= MAX_PARTICLES) parts.current.shift()
      const scale = reduced ? 0.72 : 1
      parts.current.push({
        x: o.x + rand(-7, 7),
        y: o.y + rand(-7, 7),
        nx: o.nx,
        ny: o.ny,
        r0: L.r0,
        rMax: L.rMax * scale * rand(0.82, 1.2) * (0.55 + strength * 0.6),
        drift: L.drift * rand(0.75, 1.25),
        /* Step two entries per layer, so one drop carries genuinely different
           pigments rather than four neighbouring shades of the same one. */
        hue: HUES[(hueStart + i * 2) % HUES.length] + rand(-12, 12),
        a0: L.a * strength * rand(0.85, 1.1),
        life: L.life * rand(0.85, 1.15),
        age: 0,
        lobes: Math.round(rand(3, 6)),
        wob: L.wob * rand(0.8, 1.25),
        phase: rand(0, TAU),
      })
    })
  }, [])

  const stop = useCallback(() => {
    running.current = false
    cancelAnimationFrame(raf.current)
    const g = ctx.current
    const c = canvas.current
    if (g && c) g.clearRect(0, 0, c.width, c.height)
  }, [])

  const frame = useCallback(
    (now) => {
      const g = ctx.current
      const c = canvas.current
      if (!g || !c) return stop()

      const dt = Math.min(now - (lastFrame.current || now), 50)
      lastFrame.current = now
      const { w, h } = size.current

      let active = false

      if (pointer.current.inside) {
        if (!smooth.current.primed) {
          smooth.current = { x: pointer.current.x, y: pointer.current.y, primed: true }
        }
        const gapX = pointer.current.x - smooth.current.x
        const gapY = pointer.current.y - smooth.current.y
        if (Math.hypot(gapX, gapY) > 180) {
          /* Re-entering from far away. Lerping across that gap would drag the
             smoothed point over the card and lay a streak of ink behind it. */
          smooth.current.x = pointer.current.x
          smooth.current.y = pointer.current.y
        } else {
          /* Interpolated, but tight enough not to visibly lag the cursor. */
          smooth.current.x += gapX * 0.28
          smooth.current.y += gapY * 0.28
        }

        const sx = clamp(smooth.current.x, 0, w)
        const sy = clamp(smooth.current.y, 0, h)
        const strength = clamp(1 - edgeDistance(sx, sy, w, h) / EDGE_FALLOFF, MIN_STRENGTH, 1)

        active = true
        const o = inkOrigin(sx, sy, w, h)
        const travelled = Math.hypot(o.x - lastDrop.current.x, o.y - lastDrop.current.y)
        const since = now - lastDrop.current.t
        if ((travelled > STEP_DIST && since > STEP_MS) || since > IDLE_MS) {
          lastDrop.current = { x: o.x, y: o.y, t: now }
          drop(o, strength)
        }
      }

      g.clearRect(0, 0, c.width, c.height)
      g.globalCompositeOperation = 'multiply'

      const alive = []
      for (const p of parts.current) {
        p.age += dt
        const t = p.age / p.life
        if (t >= 1) continue
        alive.push(p)

        const grow = easeOutCubic(t)
        const r = p.r0 + (p.rMax - p.r0) * grow
        const ramp = t < 0.08 ? t / 0.08 : 1
        const a = p.a0 * ramp * Math.pow(1 - t, 1.4)
        if (a <= 0.004) continue

        /* Travels outward along the edge normal as it expands. */
        const travel = p.drift * grow
        const x = p.x + p.nx * travel + PAD
        const y = p.y + p.ny * travel + PAD

        /* Irregular outline: three out-of-phase sinusoids, drifting as it ages
           so the shape keeps deforming instead of scaling uniformly. */
        const ph = p.phase + t * 2.4
        const N = 30
        g.beginPath()
        for (let i = 0; i <= N; i++) {
          const th = (i / N) * TAU
          const warp =
            1 +
            p.wob *
              (Math.sin(th * p.lobes + ph) * 0.5 +
                Math.sin(th * (p.lobes + 2) - ph * 1.37) * 0.31 +
                Math.sin(th * (p.lobes + 5) + ph * 0.63) * 0.19)
          const rr = r * warp
          const px = x + Math.cos(th) * rr
          const py = y + Math.sin(th) * rr
          if (i === 0) g.moveTo(px, py)
          else g.lineTo(px, py)
        }
        g.closePath()

        /* Flat for most of the radius: a soft-centre gradient puts the density
           in a core that is often behind the card, leaving nothing visible. */
        const grd = g.createRadialGradient(x, y, 0, x, y, r * 1.15)
        grd.addColorStop(0, `hsla(${p.hue}, 92%, 58%, ${a})`)
        grd.addColorStop(0.5, `hsla(${p.hue + 12}, 94%, 56%, ${a * 0.9})`)
        grd.addColorStop(0.78, `hsla(${p.hue + 24}, 94%, 57%, ${a * 0.52})`)
        grd.addColorStop(1, `hsla(${p.hue + 34}, 94%, 59%, 0)`)
        g.fillStyle = grd
        g.fill()
      }
      parts.current = alive

      /* Cursor gone, nothing alive — clear and shut down completely. */
      if (alive.length || active) raf.current = requestAnimationFrame(frame)
      else stop()
    },
    [drop, stop],
  )

  const start = useCallback(() => {
    if (running.current) return
    running.current = true
    lastFrame.current = 0
    raf.current = requestAnimationFrame(frame)
  }, [frame])

  /* Handlers sit on the card itself now. Since the effect only runs while the
     cursor is over it, a window listener would be doing work for nothing —
     and mouseleave gives an exact exit signal a global listener cannot. */
  const onMove = useCallback(
    (e) => {
      if (tierRef.current === 'off' || !card.current) return
      const r = box.current
      pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true }
      start()
    },
    [start],
  )

  const onLeave = useCallback(() => {
    /* Stop depositing. Ink already in the water finishes diffusing and fades
       on its own, so the exit is gradual rather than cut off. */
    pointer.current.inside = false
    smooth.current.primed = false
  }, [])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  return (
    <div className={`relative isolate ${className}`}>
      {/* No ambient layer by design: with the cursor away the card carries no
          shadow, no glow and nothing animating. */}
      {tier !== 'off' && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute z-0"
          style={{
            left: -PAD,
            top: -PAD,
            filter: tier === 'full' ? 'blur(16px) saturate(150%)' : 'blur(11px) saturate(130%)',
          }}
        />
      )}

      {/* The card. Opaque and above the ink — the effect can never reach it. */}
      <div ref={card} className="relative z-10 bg-ink" onMouseMove={onMove} onMouseLeave={onLeave}>
        {children}
      </div>
    </div>
  )
}
