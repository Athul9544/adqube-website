import { put, head } from '@vercel/blob'
import { isAdmin } from './_auth.js'
import { readJson } from './_body.js'

/**
 * The site's editable content, shared by every visitor and every device.
 *
 * One JSON document in Blob storage at a fixed pathname, so its public URL
 * never changes and the CDN can cache it. GET is open — this is the text and
 * the running order of a public website. PUT is not.
 */
const PATHNAME = 'content/site.json'

/* Long enough that a burst of readers costs one origin call, short enough that
   an edit made on a phone is on the laptop before anyone wonders why not.
   Measured at the first attempt (15s + 60s of stale-while-revalidate): a save
   could take over a minute to reach a second device, which is long enough for
   an editor to conclude it had not worked and do it again. */
const EDGE_CACHE = 'public, s-maxage=5, stale-while-revalidate=20'

async function readStored() {
  try {
    const meta = await head(PATHNAME)
    /* The query string is load-bearing. Blob storage puts its own CDN in front
       of the file and enforces a minimum cache age well above what this asks
       for, so the URL alone kept answering with the previous version for about
       a minute after a save — measured at 75 seconds before an edit reached a
       second device. A unique query makes it a cache miss every time, which is
       fine: this function is itself cached, so the origin is hit rarely. */
    const res = await fetch(`${meta.url}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    /* Nothing written yet: the site falls back to what is bundled with it. */
    return null
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = await readStored()
    res.setHeader('Cache-Control', EDGE_CACHE)
    if (!data) return res.status(200).json({ content: null })
    return res.status(200).json({ content: data })
  }

  if (req.method === 'PUT') {
    if (!isAdmin(req)) return res.status(401).json({ error: 'Not signed in.' })

    const body = await readJson(req)
    const content = body?.content
    if (!content || !Array.isArray(content.projects) || !Array.isArray(content.posts)) {
      return res.status(400).json({ error: 'Content must contain projects and posts arrays.' })
    }

    await put(PATHNAME, JSON.stringify(content), {
      access: 'public',
      contentType: 'application/json',
      /* One document, overwritten in place, rather than a new file per save
         with a random suffix — otherwise every keystroke-triggered save would
         leave another orphan in the store. */
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 5,
    })

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).json({ error: 'Method not allowed' })
}
