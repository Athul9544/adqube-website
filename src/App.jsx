import { lazy, Suspense, useState } from 'react'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CtaBanner from './components/CtaBanner'
import ProjectModal from './components/ProjectModal'
import WhatsAppButton from './components/WhatsAppButton'
import SpiderSwing from './components/SpiderSwing'
import Home from './pages/Home'
import Works from './pages/Works'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import ServicePage from './pages/ServicePage'
import Brochure from './pages/Brochure'
import Contact from './pages/Contact'
/* Split out of the main bundle. The admin panel is the largest single source
   file in the project and no visitor ever opens it, so shipping it inside the
   bundle that blocks the first paint made every reader wait for a tool they
   cannot use. It now arrives only when /admin is opened. */
const Admin = lazy(() => import('./pages/Admin'))
import { useRoute } from './useRoute'

export default function App() {
  const [modalOpen, setModalOpen] = useState(false)
  const [path, navigate] = useRoute()
  const openModal = () => setModalOpen(true)

  /* The admin panel is a tool, not a page: no nav, footer, CTA or chat. */
  if (path === '/admin') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-ink" />}>
        <Admin navigate={navigate} />
      </Suspense>
    )
  }

  const page = () => {
    if (path.startsWith('/services/')) {
      return (
        <ServicePage
          slug={path.slice('/services/'.length)}
          navigate={navigate}
          onStartProject={openModal}
        />
      )
    }

    if (path.startsWith('/blog/')) {
      return <BlogPost slug={path.slice('/blog/'.length)} navigate={navigate} onStartProject={openModal} />
    }

    switch (path) {
      case '/works':
        return <Works onStartProject={openModal} navigate={navigate} />
      case '/blog':
        return <Blog onStartProject={openModal} navigate={navigate} />
      case '/brochure':
        return <Brochure navigate={navigate} onStartProject={openModal} />
      case '/contact':
        return <Contact navigate={navigate} />
      default:
        return <Home onStartProject={openModal} navigate={navigate} />
    }
  }

  return (
    <div className="w-full">
      <Cursor />
      <Nav onStartProject={openModal} navigate={navigate} path={path} />

      {page()}

      {/* Contact already ends in a form, so it skips the closing CTA. */}
      {/* The sliding variant is the home page's hand-over into contact; other
          pages keep the plain banner. */}
      {/* Keyed on the route so it remounts on navigation. Without this it keeps
          a scroll measurement taken against the previous page's markup — on
          returning home it reads a stale progress and immediately fires the
          hand-over again, bouncing between the two pages. */}
      {path !== '/contact' && (
        <CtaBanner key={`cta-${path}`} onStartProject={openModal} navigate={navigate} slide={path === '/'} />
      )}
      {/* The home page ends on the sliding CTA, which hands straight over to
          /works — a footer below it would scroll into view mid-slide. */}
      {path !== '/' && <Footer navigate={navigate} />}

      <ProjectModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <WhatsAppButton />
      <SpiderSwing />
    </div>
  )
}
