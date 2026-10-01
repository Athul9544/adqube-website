import crypto from 'node:crypto'

/**
 * Admin sessions, signed on the server.
 *
 * The password used to be compared in the browser, which meant it shipped
 * inside the JavaScript bundle for anyone to read. That was survivable while
 * every edit stayed on the editor's own machine. It is not survivable now that
 * the admin writes to storage the whole world reads: the check has to happen
 * somewhere the visitor cannot see or alter.
 *
 * So the password lives in an environment variable, the comparison happens
 * here, and what the browser gets back is a token it cannot forge — a payload
 * plus an HMAC of that payload. Every write route verifies it before touching
 * the store.
 */

const TTL_MS = 12 * 60 * 60 * 1000 // a working day, then sign in again

/* Trimmed. Environment values set from a shell pipe carry the newline the
   shell added, and an invisible trailing character rejecting every correct
   password is a miserable thing to debug. */
const secret = () => (process.env.ADMIN_SECRET || '').trim()

const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url')

/** A token for a freshly authenticated admin. */
export function issueToken() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL_MS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

/** True when the request carries a valid, unexpired admin token. */
export function isAdmin(req) {
  if (!secret()) return false
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return verifyToken(token)
}

export function verifyToken(token) {
  if (!secret() || typeof token !== 'string') return false
  const [payload, mac] = token.split('.')
  if (!payload || !mac) return false

  const expected = sign(payload)
  /* Constant time: a plain === leaks how much of the signature matched, one
     byte at a time, to anyone willing to measure. */
  const a = Buffer.from(mac)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof exp === 'number' && Date.now() < exp
  } catch {
    return false
  }
}

/** Password check, also constant time, and never against an empty secret. */
export function passwordMatches(given) {
  const real = (process.env.ADMIN_PASSWORD || '').trim()
  if (!real || typeof given !== 'string') return false
  const a = crypto.createHash('sha256').update(given).digest()
  const b = crypto.createHash('sha256').update(real).digest()
  return crypto.timingSafeEqual(a, b)
}
