import { issueToken, passwordMatches } from './_auth.js'
import { readJson } from './_body.js'

/**
 * Exchanges the admin password for a signed session token.
 *
 * Deliberately slow to brute force at any scale: the route is a function call
 * per attempt and returns nothing but a boolean. It says "incorrect" rather
 * than distinguishing between an unknown password and an unconfigured server,
 * so a prober learns nothing about which it hit.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = await readJson(req)

  if (!passwordMatches(body?.password)) {
    /* A small, fixed delay. Not a rate limiter, but it turns a fast loop into
       a slow one without making a correct sign-in feel sluggish. */
    await new Promise((r) => setTimeout(r, 400))
    return res.status(401).json({ error: 'Incorrect password.' })
  }

  return res.status(200).json({ token: issueToken() })
}
