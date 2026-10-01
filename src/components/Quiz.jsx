import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, RotateCcw, Sparkles } from 'lucide-react'
import { QUIZ_STEPS, quizResultFor } from '../data'

/** 3-question service recommender. */
function QuizFlow({ onStartProject }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const [done, setDone] = useState(false)
  const [dir, setDir] = useState(1)

  const current = QUIZ_STEPS[step]

  const next = () => {
    if (!selected) return
    setAnswers({ ...answers, [current.id]: selected })
    setSelected(null)
    if (step < QUIZ_STEPS.length - 1) {
      setDir(1)
      setStep((s) => s + 1)
    } else {
      setDone(true)
    }
  }

  const back = () => {
    if (step === 0) return
    setDir(-1)
    setSelected(answers[QUIZ_STEPS[step - 1].id] || null)
    const copy = { ...answers }
    delete copy[current.id]
    setAnswers(copy)
    setStep((s) => s - 1)
  }

  const retake = () => {
    setStep(0)
    setAnswers({})
    setSelected(null)
    setDone(false)
    setDir(1)
  }

  const result = done ? quizResultFor(answers) : null

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-jelly-deep" />
        <span className="text-xs font-mono uppercase tracking-widest text-jelly-deep font-semibold">
          Find Your Perfect Service
        </span>
      </div>

      {!done && (
        <div className="flex items-center gap-2 mb-8">
          {QUIZ_STEPS.map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                  i < step ? 'bg-jelly-deep' : i === step ? 'bg-jelly' : 'bg-line/50'
                }`}
              />
            </div>
          ))}
          <span className="text-xs font-mono text-muted shrink-0 ml-1">
            {step + 1} / {QUIZ_STEPS.length}
          </span>
        </div>
      )}

      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="w-full"
            >
              {/* Black-and-gold result card */}
              <div className="bg-black text-white rounded-3xl p-8 relative overflow-hidden border border-jelly/25 shadow-xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-jelly/20 rounded-full blur-3xl" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-jelly/60 to-transparent" />
                <span className="relative inline-block bg-jelly text-black text-[10px] font-bold font-mono uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                  {result.tag}
                </span>
                <h4 className="relative font-serif text-2xl md:text-3xl text-jelly mb-8">{result.title}</h4>
                <div className="relative flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onStartProject}
                    className="flex-1 bg-jelly hover:bg-jelly/90 text-black rounded-full px-6 py-3.5 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-jelly/25"
                  >
                    <span>Start This Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={retake}
                    className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-full border border-jelly/25 hover:border-jelly/60 text-white/60 hover:text-jelly text-xs font-medium transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: dir * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="w-full"
            >
              <div className="mb-1">
                <h4 className="text-xl md:text-2xl text-ink font-medium leading-snug mb-1">{current.question}</h4>
                <p className="text-xs text-muted font-light">{current.hint}</p>
              </div>

              <div className="mt-5 grid gap-3">
                {current.options.map((opt) => {
                  const active = selected === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelected(opt.value)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 group ${
                        active
                          ? 'border-jelly-deep bg-jelly/10 shadow-sm'
                          : 'border-line/50 bg-white hover:border-jelly/50 hover:bg-ink/[0.03]'
                      }`}
                    >
                      <span className="text-2xl shrink-0 leading-none" aria-hidden="true">
                        {opt.icon}
                      </span>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-semibold leading-snug text-ink">{opt.text}</p>
                        <p className="text-xs text-muted font-light mt-0.5">{opt.sub}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          active ? 'border-jelly-deep bg-jelly-deep' : 'border-line/60 group-hover:border-jelly/50'
                        }`}
                      >
                        {active && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="text-xs text-muted hover:text-ink transition-colors disabled:opacity-30 disabled:pointer-events-none font-medium"
                >
                  ← Back
                </button>
                <button
                  onClick={next}
                  disabled={!selected}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all ${
                    selected
                      ? 'bg-ink text-white hover:bg-jelly-deep hover:scale-[1.02] shadow-sm cursor-pointer'
                      : 'bg-line/30 text-muted cursor-not-allowed'
                  }`}
                >
                  <span>{step === QUIZ_STEPS.length - 1 ? 'See Results' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function QuizSection({ onStartProject }) {
  return (
    <section className="relative py-16 md:py-24 px-6 md:px-12 lg:px-24 bg-paper border-b border-line overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[60vw] h-[60vw] bg-jelly/8 rounded-full blur-3xl -z-10 -translate-y-1/2" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-20 items-center">
        <div className="space-y-5">
          <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono block">
            Not sure where to start?
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.05] font-normal tracking-tight">
            Tell us what you need. We'll tell you how.
          </h2>
          <p className="text-muted text-base md:text-lg font-light leading-relaxed max-w-md">
            Answer 3 quick questions and we'll point you to the exact service that will move the needle for your
            business — with a direct way to get started.
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-line/60 p-8 md:p-10 shadow-sm">
          <QuizFlow onStartProject={onStartProject} />
        </div>
      </div>
    </section>
  )
}
