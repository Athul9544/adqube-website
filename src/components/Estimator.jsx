import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Calculator } from 'lucide-react'
import { ESTIMATOR_SERVICES, ESTIMATOR_SCOPES } from '../data'

/** Project Estimator — base price × scope multiplier × rush surcharge. */
function EstimatorCard({ onStartProject }) {
  const [service, setService] = useState('video')
  const [scope, setScope] = useState('single')
  const [rush, setRush] = useState(false)
  const [price, setPrice] = useState(0)

  // Reset scope when the service changes to one that doesn't have it.
  useEffect(() => {
    const scopes = ESTIMATOR_SCOPES[service]
    if (!scopes.find((s) => s.id === scope)) setScope(scopes[0].id)
  }, [service]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const base = ESTIMATOR_SERVICES.find((s) => s.id === service).basePrice
    const multiplier = ESTIMATOR_SCOPES[service].find((s) => s.id === scope)?.multiplier || 1
    setPrice(Math.round(base * multiplier * (rush ? 1.3 : 1)))
  }, [service, scope, rush])

  return (
    <div className="w-full bg-white rounded-[2.5rem] border border-line/60 shadow-xl overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-3/5 p-8 md:p-10 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ink/5 rounded-full flex items-center justify-center">
            <Calculator className="w-5 h-5 text-jelly-deep" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-ink">Project Estimator</h3>
            <p className="text-muted text-sm font-light">Get a rough idea before we talk.</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-muted font-semibold">1. Select Service</label>
          <div className="grid grid-cols-2 gap-2">
            {ESTIMATOR_SERVICES.map((s) => (
              <button
                key={s.id}
                onClick={() => setService(s.id)}
                className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left ${
                  service === s.id
                    ? 'border-jelly-deep bg-jelly/10 text-ink'
                    : 'border-line/60 bg-white hover:bg-ink/[0.03] text-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-muted font-semibold">2. Select Scope</label>
          <div className="grid grid-cols-2 gap-2">
            {ESTIMATOR_SCOPES[service].map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`px-4 py-3 text-sm font-medium rounded-xl border transition-all text-left ${
                  scope === s.id
                    ? 'border-jelly-deep bg-jelly/10 text-ink'
                    : 'border-line/60 bg-white hover:bg-ink/[0.03] text-muted'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button onClick={() => setRush((v) => !v)} className="flex items-center gap-3 group">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                rush ? 'bg-jelly-deep border-jelly-deep' : 'border-line/80 bg-white group-hover:border-jelly-deep/50'
              }`}
            >
              {rush && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm font-medium text-ink">Rush Delivery (48h Turnaround, +30%)</span>
          </button>
        </div>
      </div>

      <div className="w-full md:w-2/5 bg-ink p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-jelly/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="space-y-2 mb-8 relative z-10">
          <p className="text-white/60 text-xs font-mono uppercase tracking-widest">Estimated Investment</p>
          <div className="flex items-baseline gap-1">
            <span className="text-white/50 text-2xl font-light">From $</span>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-5xl md:text-6xl text-white font-normal tracking-tight"
              >
                {price.toLocaleString()}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="text-white/40 text-[10px] font-mono leading-relaxed mt-2 max-w-[200px]">
            *Final cost depends on specific requirements and brief complexity.
          </p>
        </div>

        <button
          onClick={onStartProject}
          className="relative z-10 w-full bg-jelly hover:bg-jelly/90 hover:scale-[1.02] text-ink rounded-full px-6 py-4 text-xs font-bold tracking-wide transition-all shadow-lg shadow-jelly/20 flex items-center justify-center gap-2"
        >
          <span>Get Custom Quote</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function EstimatorSection({ onStartProject }) {
  return (
    <section className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-paper border-t border-line overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] bg-jelly-deep/5 rounded-full blur-3xl -z-10 translate-x-1/4 translate-y-1/4" />
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="max-w-2xl">
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase mb-4 block font-mono">
            Transparent Pricing
          </span>
          <h2 className="font-serif text-4xl md:text-5xl text-ink font-normal tracking-tight leading-tight">
            Estimate your project in 10 seconds.
          </h2>
          <p className="mt-4 text-muted text-base md:text-lg font-light leading-relaxed max-w-xl">
            No hidden fees. No retainer traps. Pick your service, scope, and timeline — and we'll give you an honest
            starting figure before you ever send a message.
          </p>
        </div>
        <EstimatorCard onStartProject={onStartProject} />
      </div>
    </section>
  )
}
