import { motion, useReducedMotion } from 'framer-motion'

/* Decorative cubes, drawn rather than cropped out of the artwork.
   Each entry gets its own size, drift, period and direction so nothing ever
   moves in lockstep — that synchronicity is what makes floating elements read
   as fake. Positions sit in the open areas of each plate so they never collide
   with the cubes already printed in it. */
/* Kept out of the upper-left quadrant, where the heading and body copy sit —
   drifting cubes crossing the headline pull the eye straight off it. */
const CUBES = [
  { x: '6%', y: '72%', s: 46, dur: 17, dy: 22, spin: 34, kind: 'gold', delay: 0 },
  { x: '21%', y: '86%', s: 30, dur: 21, dy: -17, spin: -26, kind: 'glass', delay: 1.6 },
  { x: '36%', y: '68%', s: 24, dur: 24, dy: 15, spin: 22, kind: 'glass', delay: 3.1 },
  { x: '79%', y: '13%', s: 38, dur: 19, dy: -20, spin: -30, kind: 'gold', delay: 0.7 },
  { x: '80%', y: '64%', s: 22, dur: 26, dy: 13, spin: 18, kind: 'glass', delay: 2.4 },
  { x: '90%', y: '26%', s: 28, dur: 23, dy: -16, spin: 28, kind: 'gold', delay: 4.2 },
]

/* Small gold spheres — they only drift, never spin: a sphere rotating in place
   is invisible, so the cost would buy nothing. */
const SPHERES = [
  { x: '11%', y: '58%', s: 10, dur: 20, dx: 14, dy: -12, delay: 0.4 },
  { x: '46%', y: '88%', s: 7, dur: 26, dx: -11, dy: 15, delay: 2.2 },
  { x: '72%', y: '46%', s: 9, dur: 23, dx: 12, dy: 13, delay: 3.6 },
  { x: '93%', y: '74%', s: 6, dur: 29, dx: -9, dy: -14, delay: 5 },
]

function Cube({ c, still }) {
  const float = still
    ? {}
    : {
        y: [0, c.dy, 0],
        rotate: [0, c.spin, 0],
        transition: {
          duration: c.dur,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: c.delay,
        },
      }

  return (
    <motion.div
      className={`wb-cube ${c.kind === 'gold' ? 'wb-cube-gold' : 'wb-cube-glass'}`}
      style={{ left: c.x, top: c.y, width: c.s, height: c.s }}
      animate={float}
    >
      <span className="wb-face wb-top" />
      <span className="wb-face wb-left" />
      <span className="wb-face wb-right" />
      {/* Light travelling across the facets, offset per cube so the glints
          never all happen at once. */}
      {!still && c.kind === 'glass' && (
        <motion.span
          className="wb-shine"
          animate={{ x: ['-140%', '240%'], opacity: [0, 0.9, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, repeatDelay: c.dur * 0.6, delay: c.delay, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  )
}

/**
 * Shared decorative backdrop for the Works page.
 *
 * The supplied plate is the static base — white field, wave lines, dot grids —
 * and everything that moves is a separate element layered over it. Animating
 * the plate itself would drag the whole composition, including the white
 * ground, which has to stay perfectly still.
 *
 * `plate` picks which artwork backs this section; both share the same moving
 * layer so the two sections read as one continuous scene.
 */
export default function WorksBackdrop({ plate = 1, src, fade = 'none', decor = true }) {
  const still = useReducedMotion()
  const image = src || `/works-bg-${plate}.webp`

  return (
    <div className="wb" aria-hidden="true">
      <div className={`wb-plate wb-fade-${fade}`} style={{ backgroundImage: `url(${image})` }} />

      {/* Slow breathing glow. Opacity and scale only, so it stays on the
          compositor and never repaints. */}
      <motion.div
        className="wb-glow"
        animate={still ? {} : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Plates that already carry their own line work don't need the floating
          geometry on top — it fights the artwork rather than extending it. */}
      {decor &&
        CUBES.map((c, i) => <Cube key={i} c={c} still={still} />)}

      {decor &&
        SPHERES.map((s, i) => (
          <motion.span
            key={i}
            className="wb-sphere"
            style={{ left: s.x, top: s.y, width: s.s, height: s.s }}
            animate={still ? {} : { x: [0, s.dx, 0], y: [0, s.dy, 0] }}
            transition={{ duration: s.dur, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
          />
        ))}

      {/* Thin gold filaments, drifting sideways very slightly. */}
      <motion.div
        className="wb-waves"
        animate={still ? {} : { x: [0, 26, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
