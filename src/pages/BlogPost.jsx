import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import { MediaImage } from '../components/Media'
import { useContent, parseBody } from '../content'
import { EASE } from '../data'

/** Renders one content block from a post body. */
function Block({ block }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="font-serif text-2xl md:text-3xl text-ink tracking-tight mt-12 mb-4 first:mt-0">{block.text}</h2>
      )
    case 'ul':
      return (
        <ul className="my-6 space-y-3">
          {block.items.map((li) => (
            <li key={li} className="flex gap-3 text-body text-base md:text-lg leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-jelly shrink-0" />
              <span>{li}</span>
            </li>
          ))}
        </ul>
      )
    case 'quote':
      return (
        <blockquote className="my-10 border-l-2 border-jelly pl-6 md:pl-8">
          <p className="font-serif text-xl md:text-2xl text-ink leading-snug tracking-tight">{block.text}</p>
        </blockquote>
      )
    default:
      return <p className="my-5 text-body text-base md:text-lg leading-relaxed">{block.text}</p>
  }
}

export default function BlogPost({ slug, navigate, onStartProject }) {
  const { posts } = useContent()
  const index = posts.findIndex((p) => p.slug === slug)
  const post = posts[index]
  const body = post ? parseBody(post.body) : null

  /* Unknown slug — send them back to the index rather than a blank page. */
  if (!post) {
    return (
      <section className="pt-40 pb-28 px-6 md:px-12 lg:px-24 bg-paper text-center">
        <h1 className="font-serif text-3xl md:text-4xl text-ink mb-4">That article does not exist.</h1>
        <p className="text-body mb-8">It may have been renamed or removed.</p>
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-7 py-3.5 rounded-full cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to the blog</span>
        </button>
      </section>
    )
  }

  const next = posts[(index + 1) % posts.length]

  return (
    <>
      {/* ── Header ── */}
      <section className="relative pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-12 lg:px-24 bg-paper overflow-hidden">
        <div className="absolute top-0 right-0 w-[45vw] h-[45vw] bg-jelly/8 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />

        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <button
            onClick={() => navigate('/blog')}
            className="group inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted hover:text-jelly-deep transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>All Articles</span>
          </button>

          <div className="flex items-center gap-4 mb-5">
            <span className="text-jelly-deep text-xs font-semibold tracking-widest uppercase font-mono">{post.tag}</span>
            <span className="h-px w-10 bg-jelly-deep/40" />
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-ink font-normal tracking-tight leading-[1.1]">
            {post.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-[11px] font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
          </div>
        </motion.div>
      </section>

      {/* ── Cover ── */}
      <section className="px-6 md:px-12 lg:px-24 bg-paper">
        <motion.div
          className="max-w-4xl mx-auto h-[240px] md:h-[400px] rounded-2xl overflow-hidden bg-ink"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
        >
          <MediaImage src={post.image} className="w-full h-full object-cover" />
        </motion.div>
      </section>

      {/* ── Body ── */}
      <section className="relative py-14 md:py-20 px-6 md:px-12 lg:px-24 bg-paper border-b border-line">
        <motion.article
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
        >
          <p className="font-serif text-xl md:text-2xl text-ink leading-snug tracking-tight border-l-2 border-jelly pl-6 mb-10">
            {post.summary}
          </p>

          {body?.length ? (
            body.map((block, i) => <Block key={i} block={block} />)
          ) : (
            <p className="text-body">This article is still being written.</p>
          )}

          <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-1">Written by</p>
              <p className="text-ink font-medium text-sm">Ad Qube Studios</p>
            </div>
            <button
              onClick={onStartProject}
              className="group inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-all shadow-md cursor-pointer"
            >
              <span>Start a Project</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.article>
      </section>

      {/* ── Next up ── */}
      <section className="relative py-14 md:py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted mb-6">Read next</p>

          <motion.article
            onClick={() => navigate(`/blog/${next.slug}`)}
            className="group grid grid-cols-1 sm:grid-cols-[0.8fr_1.2fr] rounded-2xl border border-line overflow-hidden cursor-pointer shadow-sm hover:shadow-xl hover:border-jelly-mid/60 transition-[box-shadow,border-color] duration-500"
            whileHover={{ y: -6 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="relative h-40 sm:h-auto sm:min-h-[168px] bg-ink overflow-hidden">
              <img
                src={next.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
              />
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-jelly-deep">{next.tag}</span>
              <h3 className="font-serif text-xl md:text-2xl text-ink leading-snug tracking-tight mt-3 group-hover:text-jelly-deep transition-colors duration-300">
                {next.title}
              </h3>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-jelly-deep">
                <span>Read Article</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </motion.article>
        </div>
      </section>
    </>
  )
}
