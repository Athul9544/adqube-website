import { useRef, useState } from 'react'
import { MoveHorizontal, Eye } from 'lucide-react'
import { TRANSFORMATIONS } from '../data'

/** Draggable before/after comparison slider. */
function BeforeAfter({ before, beforeLabel, after, afterLabel }) {
  const [pos, setPos] = useState(50)
  const box = useRef(null)
  const dragging = useRef(false)

  const update = (clientX) => {
    if (!box.current) return
    const { left, width } = box.current.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((clientX - left) / width) * 100)))
  }

  return (
    <div
      ref={box}
      className="relative w-full aspect-video rounded-2xl overflow-hidden border border-line select-none bg-ink shadow-sm"
      onMouseDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        update(e.clientX)
      }}
      onMouseMove={(e) => dragging.current && update(e.clientX)}
      onMouseUp={() => (dragging.current = false)}
      onMouseLeave={() => (dragging.current = false)}
      onTouchMove={(e) => e.touches[0] && update(e.touches[0].clientX)}
    >
      <img src={after} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover pointer-events-none" draggable={false} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={beforeLabel}
          className="absolute inset-0 h-full object-cover"
          style={{ width: box.current?.offsetWidth || '100%' }}
          draggable={false}
        />
      </div>

      <div
        className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-20 shadow-[0_0_8px_rgba(0,0,0,0.4)]"
        style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-30">
          <MoveHorizontal className="w-4 h-4 text-ink" strokeWidth={2.5} />
        </div>
      </div>

      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-md z-10 pointer-events-none">
        {beforeLabel}
      </div>
      <div
        className="absolute top-3 bg-jelly/90 text-ink text-[10px] font-bold font-mono px-2.5 py-1 rounded-md z-10 pointer-events-none transition-all"
        style={{ left: `calc(${pos}% + 10px)`, opacity: pos < 80 ? 1 : 0 }}
      >
        {afterLabel}
      </div>
    </div>
  )
}

/** "The Transformation Reel" — raw input vs finished output, side by side. */
export default function TransformationReel() {
  return (
    <div className="w-full bg-paper py-16 md:py-24 border-t border-line overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-paper border border-line flex items-center justify-center">
              <Eye className="w-4 h-4 text-jelly-deep" />
            </div>
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">
              Process Transparency
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-ink leading-tight font-normal mb-4">
            The Transformation Reel
          </h2>
          <p className="text-muted text-base md:text-lg font-light leading-relaxed">
            We obsess over the process. Drag the sliders on each card to reveal exactly how raw ideas become cinematic
            results.
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted font-mono">
            <MoveHorizontal className="w-3.5 h-3.5" />
            <span>Drag left/right on any image to compare</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TRANSFORMATIONS.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-line flex flex-col justify-between p-6 shadow-sm hover:shadow-xl hover:border-jelly-mid/40 transition-all duration-500"
            >
              <div className="mb-5">
                <span className="bg-jelly/15 text-jelly-deep text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block">
                  {item.tag}
                </span>
                <h3 className="text-xl font-bold font-sans text-ink leading-snug mb-1.5">{item.title}</h3>
                <p className="text-muted text-xs md:text-sm font-light leading-relaxed">{item.description}</p>
              </div>
              <BeforeAfter
                before={item.before}
                beforeLabel={item.beforeLabel}
                after={item.after}
                afterLabel={item.afterLabel}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
