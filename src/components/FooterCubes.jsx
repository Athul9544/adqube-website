import { useEffect, useRef } from 'react'

/* ── The drift ────────────────────────────────────────────────────────
   Modelled on a spill that has come to rest against one edge rather than a
   stream crossing the footer: packed hard against the left, thinning as it
   travels right, with a scatter of strays that make it all the way across.
   Its upper boundary falls away as it goes, so the top-right of the footer
   stays open.

   The gradient is not painted on — it comes out of how the cubes move. Every
   cube crosses at much the same speed, but each is given a `reach`: the
   fraction of the width it gets through before fading out and starting again
   at the left. Most reach barely half way, a few make the whole crossing, so
   the left stays crowded and the right stays sparse while everything is
   continuously in motion. */
const COUNT = 1300

/* Skewed hard toward the low end — the exponent is what sets how quickly the
   field thins out. The floor keeps the shortest-lived cubes on screen for
   eight seconds or so; below that they read as blinking rather than drifting. */
const REACH_MIN = 0.34
const REACH_POW = 2.2

/* t units per second. A full crossing takes roughly twenty to thirty seconds:
   slow enough to read as settling, not as traffic. */
const SPEED_MIN = 0.032
const SPEED_MAX = 0.056

/* Vertical shape of the mass, in world units. It starts a little above centre
   at the left edge and sinks as it crosses, narrowing at the same time. */
const TOP_Y = -0.5
const DESCENT = 5.0
const SPREAD = 5.4
const NARROW = 0.45

/* Bottom-heavy: cubes settle toward the foot of the mass with a thinning tail
   reaching up, the way a real pile sits. Raising the exponent presses more of
   them down. */
const SETTLE = 2.2

/* A long lens: the camera sits well back on a narrow field of view. A wide
   lens up close throws hard perspective across anything near the camera, and
   the front cubes stop reading as cubes — one face splays out and the box
   looks sheared. Pulling back and narrowing keeps every cube square, near or
   far. */
const CAM_Z = 30
const FOV = 34

/* Depth range. Near cubes read large and soft-edged, far ones small and dim —
   this spread is what stops it looking like flat 2D confetti. */
const Z_NEAR = 8
const Z_FAR = -22

const CURSOR_RADIUS = 7.2
const CURSOR_PUSH = 6.4

const rand = (a, b) => a + Math.random() * (b - a)

/* Fade envelope over a cube's life: up quickly on arrival, a long ease out so
   it thins away rather than blinking off. Both ends reach exactly zero, which
   is what hides the recycle. */
function envelope(u) {
  if (u <= 0 || u >= 1) return 0
  if (u < 0.12) return u / 0.12
  if (u > 0.62) return (1 - u) / 0.38
  return 1
}

/**
 * Builds the equirectangular environment the gold reflects.
 *
 * A metal with no environment renders essentially black — lights alone give
 * a plastic sheen, not metal. Rather than ship an HDR, this paints a small
 * gradient "room": a warm bright band where a sky would be, a hot spot for
 * the key highlight, and a dark warm floor. PMREM pre-filters it so the
 * roughness on the material actually means something.
 */
function buildEnvironment(THREE, renderer) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')

  const sky = g.createLinearGradient(0, 0, 0, 128)
  sky.addColorStop(0, '#fff3d6')
  sky.addColorStop(0.42, '#b08c46')
  sky.addColorStop(0.55, '#3a2f1d')
  sky.addColorStop(1, '#0b0906')
  g.fillStyle = sky
  g.fillRect(0, 0, 256, 128)

  /* Key highlight — the bright streak that travels across a cube face as it
     turns, and the main reason the material reads as polished metal. */
  const hot = g.createRadialGradient(70, 28, 2, 70, 28, 46)
  hot.addColorStop(0, 'rgba(255,255,255,0.95)')
  hot.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = hot
  g.fillRect(0, 0, 256, 128)

  /* A cooler secondary from the other side, so turning cubes catch a second,
     dimmer glint instead of going flat between key hits. */
  const fill = g.createRadialGradient(196, 46, 2, 196, 46, 40)
  fill.addColorStop(0, 'rgba(255,226,170,0.5)')
  fill.addColorStop(1, 'rgba(255,226,170,0)')
  g.fillStyle = fill
  g.fillRect(0, 0, 256, 128)

  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace

  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromEquirectangular(tex).texture
  pmrem.dispose()
  tex.dispose()
  return env
}

/**
 * Edge-line mask, drawn on every face so each cube reads as the brand mark.
 *
 * This goes in as an emissiveMap, not a colour map: a colour map multiplies
 * the base colour and so could only ever darken the gold, and the face colour
 * has to stay exactly as it is. Emissive adds on top instead, so the lines sit
 * over the existing metal without altering it, and stay visible on faces
 * turned away from the light — which is what makes the wireframe read.
 *
 * The stroke is centred on the face boundary, so the two faces meeting at a
 * cube edge each contribute half and their lines join into one. Square
 * corners, not rounded — rounding would leave a nick at every cube corner.
 */
function buildEdgeMask(THREE) {
  /* A hairline needs the resolution to stay a hairline: at 128px a stroke this
     thin lands on two texels and turns to mush the moment a cube tilts. */
  const S = 256
  const w = 7
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const g = c.getContext('2d')

  g.fillStyle = '#000000'
  g.fillRect(0, 0, S, S)

  g.strokeStyle = '#ffffff'
  g.lineWidth = w
  g.strokeRect(w / 2, w / 2, S - w, S - w)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/**
 * The golden cube drift behind the footer.
 *
 * Sits between the footer's existing backdrop and its content — the canvas is
 * pointer-events-none and aria-hidden, so it changes nothing about how the
 * footer reads or behaves.
 *
 * three is pulled in with a dynamic import: it is by far the largest thing on
 * the site and this is the only place that needs it, so it stays out of the
 * main bundle and off the critical path of every page.
 */
export default function FooterCubes() {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    let disposed = false
    let cleanup = () => {}
    let quitQuiet = () => {}

    /**
     * Resolves the first time the page has held still for a moment, or after
     * `deadline` regardless.
     *
     * Building this scene costs about 1.6 seconds of main thread: an
     * environment map has to be prefiltered, a thousand-odd instances laid
     * out, and the material's shader compiled. That is fine on a page opened
     * directly, where it happens while the reader is still reading the top.
     * It is not fine when the page was entered mid-scroll by the hand-over
     * from the page before, which is how most readers arrive here — the
     * scroll simply stops dead for a second and a half.
     *
     * An idle callback cannot be used for this: a scroll in progress hands out
     * no idle slots at all, so it would wait for its own timeout and land in
     * exactly the wrong place. Watching for the scroll to settle is the
     * question we actually mean to ask.
     *
     * The deadline is long on purpose. A reader who has not stopped scrolling
     * for half a minute is not looking at the footer, and the observer further
     * down already keeps the scene from drawing while it is off screen — so
     * there is nothing to be gained by forcing the work in behind them, and a
     * second and a half of stall to be lost by it. Where the timing is
     * measured in stalls, late is much cheaper than early.
     *
     * Of what it costs, prefiltering the environment map is 867ms of it, the
     * WebGL context another 149ms, and compiling the material's shader most of
     * the rest; the thousand instances are 7ms and not worth chasing.
     */
    const whenQuiet = (deadline = 30000) =>
      new Promise((resolve) => {
        let last = performance.now()
        const onScroll = () => {
          last = performance.now()
        }
        const done = () => {
          clearTimeout(poll)
          clearTimeout(cap)
          window.removeEventListener('scroll', onScroll)
          resolve()
        }
        const tick = () => {
          if (disposed) return done()
          if (performance.now() - last >= 220) return done()
          poll = setTimeout(tick, 120)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        let poll = setTimeout(tick, 0)
        const cap = setTimeout(done, deadline)
        quitQuiet = done
      })

    ;(async () => {
      const THREE = await import('three')
      /* Everything below is the expensive part — see whenQuiet. */
      await whenQuiet()
      if (disposed || !host.current) return
      /* StrictMode unmounts and remounts in dev; without this the first pass
         finishes its import after the cleanup has already run and leaves an
         orphaned canvas behind. */
      if (disposed || !host.current) return

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const small = window.innerWidth < 768

      const renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75))
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.15
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
      el.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      scene.environment = buildEnvironment(THREE, renderer)

      const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
      camera.position.set(0, 0, CAM_Z)

      /* The environment does the reflecting; these only shape the falloff so
         faces angled away from the highlight do not go entirely flat. */
      scene.add(new THREE.AmbientLight(0xfff0d0, 0.35))
      const key = new THREE.DirectionalLight(0xffe9bd, 1.5)
      key.position.set(-6, 7, 9)
      scene.add(key)
      const rim = new THREE.DirectionalLight(0xffc266, 0.7)
      rim.position.set(8, -4, -6)
      scene.add(rim)

      const total = small ? Math.round(COUNT * 0.6) : COUNT

      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const edgeMask = buildEdgeMask(THREE)
      const material = new THREE.MeshStandardMaterial({
        color: 0xd9a441,
        metalness: 1,
        roughness: 0.22,
        envMapIntensity: 1.45,
        /* A pale gold line along every edge. */
        emissive: 0xffdc93,
        emissiveMap: edgeMask,
        emissiveIntensity: 0.5,
      })
      const mesh = new THREE.InstancedMesh(geometry, material, total)
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
      mesh.frustumCulled = false
      scene.add(mesh)

      /* Per-cube state, flat arrays rather than objects — this is touched
         every frame for every instance. */
      const prog = new Float32Array(total) // 0..reach, position along the crossing
      const reach = new Float32Array(total)
      const speed = new Float32Array(total)
      const yFrac = new Float32Array(total) // -1 at the foot of the mass, +1 at its top
      const wob = new Float32Array(total)
      const posZ = new Float32Array(total)
      const scale = new Float32Array(total)
      const rotX = new Float32Array(total)
      const rotY = new Float32Array(total)
      const rotZ = new Float32Array(total)
      const spinX = new Float32Array(total)
      const spinY = new Float32Array(total)
      const spinZ = new Float32Array(total)
      const dispX = new Float32Array(total)
      const dispY = new Float32Array(total)

      /* A cube is the same size in world units at any viewport, but a phone
         sees barely half the width, so it fills far more of the screen there.
         Scaled back on small screens to keep the drift a background. */
      const sizeK = small ? 0.6 : 1
      const spreadK = small ? 0.8 : 1

      /* Mostly small, a useful number of mediums, a handful of large ones near
         the camera to anchor the depth. */
      const pickScale = () => {
        const r = Math.random()
        if (r < 0.62) return rand(0.24, 0.46) * sizeK
        if (r < 0.92) return rand(0.46, 0.82) * sizeK
        return rand(0.82, 1.35) * sizeK
      }

      for (let j = 0; j < total; j++) {
        reach[j] = REACH_MIN + (1 - REACH_MIN) * Math.pow(Math.random(), REACH_POW)
        /* Started anywhere in its own life, so the field is already spread out
           on the first frame rather than every cube arriving together. */
        prog[j] = Math.random() * reach[j]
        speed[j] = rand(SPEED_MIN, SPEED_MAX)
        yFrac[j] = -1 + 2 * Math.pow(Math.random(), SETTLE)
        wob[j] = rand(0, Math.PI * 2)
        posZ[j] = rand(Z_FAR, Z_NEAR)
        scale[j] = pickScale()
        rotX[j] = rand(0, Math.PI * 2)
        rotY[j] = rand(0, Math.PI * 2)
        rotZ[j] = rand(0, Math.PI * 2)
        spinX[j] = rand(-0.3, 0.3)
        spinY[j] = rand(-0.3, 0.3)
        spinZ[j] = rand(-0.2, 0.2)
      }

      /* Filled by the first layout, which runs before the first frame. */
      let halfW = 30
      let xFrom = -44
      let xTo = 44

      const layout = () => {
        const w = el.clientWidth || 1
        const h = el.clientHeight || 1
        renderer.setSize(w, h, false)
        camera.aspect = w / h
        camera.updateProjectionMatrix()

        const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360)
        halfW = (visH * camera.aspect) / 2
        /* Generous margin at both ends: a large near cube is far wider on
           screen than in world units, and has to be clear of the frame before
           its envelope has finished closing. */
        xFrom = -halfW - 8
        xTo = halfW + 8
      }
      layout()

      /* Cursor, in world units on the z = 0 plane. Tracked on window rather
         than the canvas so the canvas can stay pointer-events-none and never
         shadow a footer link. */
      let curX = 1e6
      let curY = 1e6
      let curActive = false

      const onPointer = (e) => {
        const r = el.getBoundingClientRect()
        const visH = 2 * CAM_Z * Math.tan((FOV * Math.PI) / 360)
        curX = ((e.clientX - r.left) / r.width - 0.5) * visH * camera.aspect
        curY = -((e.clientY - r.top) / r.height - 0.5) * visH
        /* A generous band around the footer: the push should already be under
           way by the time the pointer crosses the edge. */
        curActive = e.clientY > r.top - 160 && e.clientY < r.bottom + 160
      }
      const onLeave = () => {
        curActive = false
      }

      window.addEventListener('pointermove', onPointer, { passive: true })
      window.addEventListener('pointerdown', onPointer, { passive: true })
      document.addEventListener('pointerleave', onLeave)

      const ro = new ResizeObserver(layout)
      ro.observe(el)

      /* Only run while the footer is actually on screen. */
      let visible = false
      const io = new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting
      })
      io.observe(el)

      const dummy = new THREE.Object3D()
      let raf = 0
      let last = performance.now()
      let t = 0

      /* Shader compilation, warmed up ahead of time.
         This material is a metal with an environment map and an emissive map,
         and the first draw that uses it has to compile its program, link it
         and upload its textures. That used to happen on the very frame the
         footer came into view, because the loop below renders nothing until
         then: one blocking frame, measured at 2.6 seconds, landing in the
         middle of a scroll — which is exactly when a reader is least able to
         forgive it. Doing it up front costs the same work with nobody waiting
         on it, and the scroll into the footer becomes an ordinary frame.
         Measured on /contact: worst frame at reveal 2633ms before, 411ms
         after, then a steady 17ms. */
      const warm = () => {
        if (disposed) return
        /* The instance buffer goes up with it — that upload is the other half
           of the first-draw cost. */
        mesh.instanceMatrix.needsUpdate = true
        renderer.compile(scene, camera)
        renderer.render(scene, camera)
      }
      /* Straight away: the build above already waited for a quiet moment, and
         this is the tail of the same piece of work. One turn of the event loop
         so the setup commits first. */
      const warmId = setTimeout(warm, 0)
      const cancelWarm = () => clearTimeout(warmId)

      /* Adaptive resolution. The cubes are soft background elements, so on a
         weak GPU it is far better to lose pixel density than frames. Sampled
         over the first second of visible rendering, then left alone. */
      let sampled = 0
      let sampleTime = 0
      let downscaled = false

      const frame = (now) => {
        raf = requestAnimationFrame(frame)

        /* Clamp: a backgrounded tab hands back a huge delta on return, which
           would teleport the whole field. */
        const dt = Math.min((now - last) / 1000, 0.05)
        last = now
        if (!visible) return

        if (!downscaled) {
          sampled++
          sampleTime += dt
          /* Ignore the first few frames — shader compilation lands there and
             would trip the check on hardware that is perfectly capable. */
          if (sampled > 10 && sampleTime > 1) {
            if (sampled / sampleTime < 45) {
              renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() * 0.6))
              layout()
            }
            downscaled = true
          }
        }
        if (!reduced) t += dt

        /* Frame-rate independent easing, and deliberately unhurried: the push
           carries cubes a long way, so a fast constant would snap them out and
           snap them back rather than letting them drift. */
        const ease = 1 - Math.exp(-2.6 * dt)

        for (let j = 0; j < total; j++) {
          if (!reduced) {
            prog[j] += speed[j] * dt
            /* Back to the left edge. Its envelope is zero at both ends of the
               life, so nothing is on screen at the moment this happens. */
            if (prog[j] >= reach[j]) prog[j] = 0
          }

          const n = prog[j]
          const x = xFrom + n * (xTo - xFrom)

          /* The mass sinks and narrows as it crosses, which is what keeps the
             top-right of the footer open. */
          const centre = TOP_Y - DESCENT * n
          const half = SPREAD * spreadK * (1 - NARROW * n)
          const y = centre + yFrac[j] * half + 0.32 * Math.sin(t * 0.5 + wob[j])
          const z = posZ[j]

          /* Repulsion. The cursor is known on the z = 0 plane; scaling it by
             the depth ratio puts it where it actually appears at this cube's
             depth, so a near cube reacts across more of the screen than a far
             one — which is what makes the push read as three-dimensional
             rather than as a flat circular hole. */
          let tx = 0
          let ty = 0
          if (curActive) {
            const s = (CAM_Z - z) / CAM_Z
            const dx = x - curX * s
            const dy = y - curY * s
            const r = CURSOR_RADIUS * s
            const d2 = dx * dx + dy * dy
            if (d2 < r * r) {
              const d = Math.sqrt(d2) || 0.0001
              /* Squared falloff: firm in the middle, feathered at the rim, so
                 cubes slide around the cursor instead of snapping off it. */
              const f = (1 - d / r) ** 2 * CURSOR_PUSH
              tx = (dx / d) * f
              ty = (dy / d) * f
            }
          }
          dispX[j] += (tx - dispX[j]) * ease
          dispY[j] += (ty - dispY[j]) * ease

          if (!reduced) {
            rotX[j] += spinX[j] * dt
            rotY[j] += spinY[j] * dt
            rotZ[j] += spinZ[j] * dt
          }

          dummy.position.set(x + dispX[j], y + dispY[j], z)
          dummy.rotation.set(rotX[j], rotY[j], rotZ[j])
          dummy.scale.setScalar(scale[j] * envelope(n / reach[j]))
          dummy.updateMatrix()
          mesh.setMatrixAt(j, dummy.matrix)
        }

        mesh.instanceMatrix.needsUpdate = true
        renderer.render(scene, camera)
      }
      raf = requestAnimationFrame(frame)

      cleanup = () => {
        cancelAnimationFrame(raf)
        cancelWarm()
        ro.disconnect()
        io.disconnect()
        window.removeEventListener('pointermove', onPointer)
        window.removeEventListener('pointerdown', onPointer)
        document.removeEventListener('pointerleave', onLeave)
        geometry.dispose()
        material.dispose()
        edgeMask.dispose()
        scene.environment?.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })()

    return () => {
      disposed = true
      quitQuiet()
      cleanup()
    }
  }, [])

  return (
    <div
      ref={host}
      aria-hidden="true"
      /* Above the footer's backdrop and its gradient, below the content at
         z-10. Held back from full opacity so white copy crossing a cube still
         has the contrast it had before. */
      className="absolute inset-0 z-[6] pointer-events-none opacity-[0.58]"
    />
  )
}
