import Hero from '../components/Hero'
import WorkShowcase from '../components/WorkShowcase'
import CreativePlayground from '../components/CreativePlayground'
import EdgeFade from '../components/EdgeFade'
import SectionCrossfade from '../components/SectionCrossfade'
import About from '../components/About'
import VrOrbit from '../components/VrOrbit'
import Services from '../components/Services'
import WhyAdQube from '../components/WhyAdQube'

export default function Home({ onStartProject, navigate }) {
  return (
    <>
      <Hero onStartProject={onStartProject} />
      {/* Inside the Work hands over to The Creative Stack through an overlap:
          the two share a stretch of scroll where one fades out under the other
          as it rises. EdgeFade keeps only its bottom band here — the crossfade
          is the arrival now. */}
      <SectionCrossfade
        outgoing={<VrOrbit navigate={navigate} onStartProject={onStartProject} />}
        incoming={
          <EdgeFade top={false}>
            <WorkShowcase />
          </EdgeFade>
        }
      />
      <CreativePlayground />
      <About />
      <Services />
      <WhyAdQube />
    </>
  )
}
