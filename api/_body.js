/**
 * The request's JSON body, however the runtime chose to hand it over.
 *
 * Vercel's Node functions sometimes populate `req.body` and sometimes leave
 * the request as an unread stream — it depends on the content type and on the
 * runtime version. Reading whichever is actually there beats guessing: the
 * first version of these routes assumed a parsed object, so a perfectly
 * correct password arrived as `undefined` and every sign-in was rejected.
 */
export async function readJson(req) {
  const body = req.body
  if (body && typeof body === 'object' && !Buffer.isBuffer(body)) return body

  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }

  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8'))
    } catch {
      return {}
    }
  }

  const chunks = []
  try {
    for await (const chunk of req) chunks.push(chunk)
  } catch {
    return {}
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return {}
  }
}
