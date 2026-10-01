import { handleUpload } from '@vercel/blob/client'
import { verifyToken } from './_auth.js'
import { readJson } from './_body.js'

/**
 * Issues a one-shot upload ticket so the browser can send the file straight to
 * Blob storage.
 *
 * The file does not pass through this function on purpose. A serverless
 * request body is capped at a few megabytes, which a photo can reach and a
 * video passes without trying; uploading from the browser against a token
 * minted here has no such ceiling, and the studio's clips are the whole point
 * of the admin panel.
 *
 * The admin's session token rides along as the client payload and is checked
 * before any ticket is issued — without that, the route would be an open
 * invitation to fill someone else's storage.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = await readJson(req)

  try {
    const result = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!verifyToken(clientPayload)) throw new Error('Not signed in.')
        return {
          allowedContentTypes: ['image/*', 'video/*'],
          /* Ten minutes is plenty for a large clip on a poor connection, and
             short enough that a leaked ticket is worth little. */
          validUntil: Date.now() + 10 * 60 * 1000,
          addRandomSuffix: true,
          /* A year: these files are content-addressed by their random suffix,
             so a given URL's bytes never change. */
          cacheControlMaxAge: 31536000,
        }
      },
      onUploadCompleted: async () => {
        /* Nothing to do — the admin saves the returned URL onto the record
           itself, and that save is what makes the change visible. */
      },
    })
    return res.status(200).json(result)
  } catch (err) {
    return res.status(400).json({ error: err?.message || 'Upload failed.' })
  }
}
