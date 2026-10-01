import PageHero from '../components/PageHero'
import BlogCarousel from '../components/BlogCarousel'
import ScrollBackBridge from '../components/ScrollBackBridge'
import WorksBackdrop from '../components/WorksBackdrop'
import { useContent } from '../content'

export default function Blog({ navigate }) {
  const { posts } = useContent()

  return (
    <>
      {/* Pulling up at the top returns to whichever page handed us over. */}
      <ScrollBackBridge navigate={navigate} />

      {/* Plates carry their own line work, so the floating geometry is off. */}
      <PageHero
        eyebrow="Blog"
        title="Where Ideas Become Visual Stories"
        backdrop={<WorksBackdrop src="/blog-bg-1.webp" decor={false} fade="bottom" />}
      >
        Discover insights into AI video production, cinematic advertising, creative storytelling, and the process behind
        building compelling visual content for modern brands.
      </PageHero>

      {/* The carousel owns its own pinned section and heading — wrapping it in
          a padded, animated container would clip the rail and fight the pin.
          The closing LET'S DO IT statement lives at the end of its timeline,
          after the last card. */}
      <BlogCarousel posts={posts} navigate={navigate} />
    </>
  )
}

