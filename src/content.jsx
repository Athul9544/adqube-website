import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PROJECTS as SEED_PROJECTS, BLOG_POSTS as SEED_POSTS, BLOG_CONTENT as SEED_CONTENT } from './data'
import { adminToken, setAdminToken } from './session'

/* Local copy of whatever the server last told us. Not the source of truth any
   more — that is /api/content — but it lets the site paint immediately instead
   of waiting on a round trip, and it keeps the page readable if the network is
   down. It is overwritten the moment the server answers. */
const KEY = 'adqube.content.v1'

/* ── Article body <-> plain text ─────────────────────────────────────
   The reader renders structured blocks, but a block editor is overkill here.
   These convert between the blocks and a light markup the admin can type:
     ## heading      > quote      - list item      anything else = paragraph
*/
export function parseBody(text = '') {
  const blocks = []
  let list = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) {
      list = null
      continue
    }
    if (line.startsWith('## ')) {
      list = null
      blocks.push({ type: 'h2', text: line.slice(3).trim() })
    } else if (line.startsWith('> ')) {
      list = null
      blocks.push({ type: 'quote', text: line.slice(2).trim() })
    } else if (line.startsWith('- ')) {
      if (!list) {
        list = { type: 'ul', items: [] }
        blocks.push(list)
      }
      list.items.push(line.slice(2).trim())
    } else {
      list = null
      blocks.push({ type: 'p', text: line })
    }
  }
  return blocks
}

export function serializeBody(blocks = []) {
  return blocks
    .map((b) => {
      if (b.type === 'h2') return `## ${b.text}`
      if (b.type === 'quote') return `> ${b.text}`
      if (b.type === 'ul') return b.items.map((i) => `- ${i}`).join('\n')
      return b.text
    })
    .join('\n\n')
}

/* Icons are React components and cannot be stored, so they are dropped — no
   card renders project.icon any more. */
const seed = () => ({
  projects: SEED_PROJECTS.map(({ icon, ...rest }) => rest),
  posts: SEED_POSTS.map((p) => ({ ...p, body: serializeBody(SEED_CONTENT[p.slug] || []) })),
})

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)

const ContentCtx = createContext(null)

/** Holds the editable site content. Persists to localStorage, seeded from
    data.js the first time. */
export function ContentProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.projects) && Array.isArray(parsed.posts)) return parsed
      }
    } catch {
      /* corrupt or unavailable storage — fall through to the seed */
    }
    return seed()
  })

  /* Set once the server's copy has arrived (or failed to). Until then the
     screen is showing either the cache or the bundled seed, and pushing that
     back up would overwrite everyone else's content with it. */
  const loaded = useRef(false)
  /* Bumped by every local edit. The very first render is not an edit. */
  const edits = useRef(0)

  /* ── Read: the shared copy, on every page load ── */
  useEffect(() => {
    let alive = true
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((body) => {
        if (!alive) return
        const remote = body?.content
        if (remote && Array.isArray(remote.projects) && Array.isArray(remote.posts)) {
          /* An edit made while this was in flight wins — otherwise a slow
             response would silently undo what the editor just typed. */
          if (edits.current === 0) setData(remote)
        }
      })
      .catch(() => {
        /* Offline, or the API is not deployed yet: the cache or the seed
           already on screen is a perfectly good fallback. */
      })
      .finally(() => {
        if (alive) loaded.current = true
      })
    return () => {
      alive = false
    }
  }, [])

  /* ── Write: cache locally, and push to the shared copy when an admin ── */
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* private mode or quota — the session still works, it just will not persist */
    }

    if (!loaded.current || edits.current === 0) return
    const token = adminToken()
    if (!token) return

    /* Debounced: the editor types into a field and every keystroke lands here.
       One request a beat after they stop is plenty. */
    const t = setTimeout(() => {
      fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: data }),
      })
        .then((res) => {
          /* A session expires after twelve hours. Failing quietly here would
             let someone spend an afternoon editing a page that is saving
             nothing, so say it once and send them back to the sign-in. */
          if (res.status === 401) {
            setAdminToken('')
            window.alert('Your admin session has expired. Sign in again to keep saving.')
          }
        })
        .catch(() => {
          /* Offline or a blip: the next edit tries again, and the local cache
             still holds the work in the meantime. */
        })
    }, 700)
    return () => clearTimeout(t)
  }, [data])

  /* Every mutation below goes through this, so `edits` counts real changes
     rather than renders. */
  const edit = useCallback((fn) => {
    edits.current += 1
    setData(fn)
  }, [])

  const upsert = useCallback((collection, record) => {
    edit((d) => {
      const list = d[collection]
      const id = record.id || `${collection.slice(0, 1)}${Date.now().toString(36)}`
      const slug = record.slug?.trim() || slugify(record.title || id)
      const next = { ...record, id, slug }
      const i = list.findIndex((x) => x.id === id)
      return {
        ...d,
        [collection]: i === -1 ? [next, ...list] : list.map((x, n) => (n === i ? next : x)),
      }
    })
  }, [edit])

  const remove = useCallback((collection, id) => {
    edit((d) => ({ ...d, [collection]: d[collection].filter((x) => x.id !== id) }))
  }, [edit])

  /* Which records appear in the home page's "Inside the Work" ring.
     Stored as an exclusion list rather than a selection: a brand new project
     should show up there by default, and an inclusion list would silently keep
     every future addition out until someone remembered to tick it. */
  const toggleOrbit = useCallback((kind, id) => {
    edit((d) => {
      const key = `${kind}:${id}`
      const hidden = d.orbitHidden || []
      return {
        ...d,
        orbitHidden: hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key],
      }
    })
  }, [edit])

  /* The Creative Stack video. Null means "use the one bundled with the site",
     so clearing it restores the default rather than leaving an empty box. */
  const setStackVideo = useCallback((src) => {
    edit((d) => ({ ...d, stackVideo: src || null }))
  }, [edit])

  /* Per-frame video overrides for the Creative Playground, keyed by the frame's
     label. Removing a key falls back to that frame's bundled clip, so a frame
     is never left with nothing to play. */
  const setPlaygroundVideo = useCallback((label, src) => {
    edit((d) => {
      const next = { ...(d.playground || {}) }
      if (src) next[label] = src
      else delete next[label]
      return { ...d, playground: next }
    })
  }, [edit])

  const move = useCallback((collection, id, dir) => {
    edit((d) => {
      const list = [...d[collection]]
      const i = list.findIndex((x) => x.id === id)
      const j = i + dir
      if (i === -1 || j < 0 || j >= list.length) return d
      ;[list[i], list[j]] = [list[j], list[i]]
      return { ...d, [collection]: list }
    })
  }, [edit])

  const api = useMemo(
    () => ({
      projects: data.projects,
      posts: data.posts,
      orbitHidden: data.orbitHidden || [],
      toggleOrbit,
      stackVideo: data.stackVideo || null,
      setStackVideo,
      playground: data.playground || {},
      setPlaygroundVideo,
      inOrbit: (kind, id) => !(data.orbitHidden || []).includes(`${kind}:${id}`),
      saveProject: (p) => upsert('projects', p),
      deleteProject: (id) => remove('projects', id),
      moveProject: (id, dir) => move('projects', id, dir),
      savePost: (p) => upsert('posts', p),
      deletePost: (id) => remove('posts', id),
      movePost: (id, dir) => move('posts', id, dir),
      resetAll: () => edit(seed()),
      exportJson: () => JSON.stringify(data, null, 2),
      importJson: (text) => {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.posts)) {
          throw new Error('File must contain "projects" and "posts" arrays.')
        }
        edit({
          projects: parsed.projects,
          posts: parsed.posts,
          orbitHidden: Array.isArray(parsed.orbitHidden) ? parsed.orbitHidden : [],
          stackVideo: parsed.stackVideo || null,
          playground: parsed.playground || {},
        })
      },
    }),
    [data, edit, upsert, remove, move, toggleOrbit, setStackVideo, setPlaygroundVideo],
  )

  return <ContentCtx.Provider value={api}>{children}</ContentCtx.Provider>
}

export const useContent = () => useContext(ContentCtx)
