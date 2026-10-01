import { useState } from 'react'
import PageHero from '../components/PageHero'
import WorkModal from '../components/WorkModal'
import WorksFan from '../components/WorksFan'
import ScrollBackBridge from '../components/ScrollBackBridge'
import WorksBackdrop from '../components/WorksBackdrop'
import { useContent } from '../content'

export default function Works({ onStartProject, navigate }) {
  const [selected, setSelected] = useState(null)
  const { projects } = useContent()

  return (
    <>
      {/* Pulling up at the top returns to the home page's closing slide. */}
      <ScrollBackBridge navigate={navigate} />

      {/* Plates carry their own line work, so the floating geometry is off —
          it would fight the artwork rather than extend it. */}
      <PageHero
        eyebrow="Works"
        title="Stories That Start With An Idea"
        backdrop={<WorksBackdrop plate={1} decor={false} fade="bottom" />}
      >
        From the first concept to the final frame, our work is built around storytelling. Explore cinematic AI video ads
        crafted through original concepts, detailed scripts, scene-by-scene storyboards, and carefully directed AI
        production.
      </PageHero>

      <WorksFan projects={projects} onSelect={setSelected} navigate={navigate} />

      <WorkModal project={selected} onClose={() => setSelected(null)} onStartProject={onStartProject} />
    </>
  )
}
