import { readJson } from './_body.js'

/**
 * Contact form → email, through Resend.
 *
 * The form used to open WhatsApp with the message prefilled, which meant a
 * visitor without WhatsApp had no way to reach anyone and nothing was ever
 * recorded. This sends a real email to the studio instead, with the sender's
 * own address as reply-to, so answering is a plain reply.
 *
 * Needs two environment variables:
 *   RESEND_API_KEY   from resend.com
 *   CONTACT_TO       where enquiries land (defaults to the studio address)
 * and optionally CONTACT_FROM, which must be an address on a domain verified
 * with Resend. Until there is one, Resend's own onboarding sender works and
 * will deliver to the address that owns the Resend account.
 */
const TO = () => (process.env.CONTACT_TO || 'adqubestudio@gmail.com').trim()
const FROM = () => (process.env.CONTACT_FROM || 'Ad Qube Website <onboarding@resend.dev>').trim()

/* Caps, not formatting rules. A contact form is an open door to someone
   else's inbox, so the only sane posture is to refuse anything outsized
   before it reaches the mail API. */
const LIMITS = { name: 120, email: 160, phone: 40, brief: 5000 }

const clean = (v, max) =>
  typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : ''

/* Deliberately loose: the point is to catch a typo, not to adjudicate what a
   valid address looks like. Anything that gets past this is Resend's problem
   and bounces are visible there. */
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = (process.env.RESEND_API_KEY || '').trim()
  if (!key) {
    /* Said plainly rather than pretending to succeed: a contact form that
       swallows enquiries is worse than one that admits it is not working. */
    return res.status(503).json({ error: 'Email is not configured on the server yet.' })
  }

  const body = await readJson(req)

  /* Honeypot. A field no person can see and no person fills in; the bots that
     submit every input on a page do. Accepted and discarded, so whoever sent
     it has no signal to tune against. */
  if (clean(body?.company, 80)) return res.status(200).json({ ok: true })

  const name = clean(body?.name, LIMITS.name)
  const email = clean(body?.email, LIMITS.email)
  const phone = clean(body?.phone, LIMITS.phone)
  const brief = clean(body?.brief, LIMITS.brief)

  if (!name || !email) return res.status(400).json({ error: 'Name and email are required.' })
  if (!looksLikeEmail(email)) return res.status(400).json({ error: 'That email address does not look right.' })

  const lines = [
    `Name:  ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '—'}`,
    '',
    'Brief:',
    brief || '—',
  ].join('\n')

  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#1a1611">
      <h2 style="margin:0 0 16px;font-size:18px">New enquiry from the website</h2>
      <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 4px"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 16px"><strong>Phone:</strong> ${escapeHtml(phone) || '&mdash;'}</p>
      <p style="margin:0 0 6px"><strong>Brief</strong></p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(brief) || '&mdash;'}</p>
    </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM(),
        to: [TO()],
        /* So hitting reply in the inbox answers the person who wrote in,
           rather than the sending address nobody reads. */
        reply_to: email,
        subject: `Website enquiry — ${name}`,
        text: lines,
        html,
      }),
    })

    if (!r.ok) {
      const detail = await r.text().catch(() => '')
      console.error('Resend rejected the message:', r.status, detail.slice(0, 400))
      return res.status(502).json({ error: 'The message could not be sent. Please email us directly.' })
    }
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact send failed:', err?.message)
    return res.status(502).json({ error: 'The message could not be sent. Please email us directly.' })
  }
}
