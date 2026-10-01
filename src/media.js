import { useEffect, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { adminToken } from './session'

/**
 * Uploaded media store.
 *
 * Files go to Blob storage and are referenced by their public https URL, so a
 * picture chosen on a phone is the same picture the site serves to everyone
 * else. Previously they lived in IndexedDB on the editor's own machine, which
 * meant an upload was visible to precisely one browser — the bug this replaces.
 *
 * A record keeps a reference string, one of:
 *   "https://…blob.vercel-storage.com/…"  an uploaded file
 *   "/blog/x.webp"                        something bundled in public/
 *   "idb:m1a2b3"                          a file uploaded before this change
 *
 * The last of those is still read, so a machine that has local uploads keeps
 * showing them to its owner until they are re-uploaded. Nothing new is written
 * in that form.
 */
const DB_NAME = 'adqube-media'
const STORE = 'files'
const PREFIX = 'idb:'

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** A file held only on this device, from before uploads were shared. */
export const isLegacyUpload = (ref) => typeof ref === 'string' && ref.startsWith(PREFIX)

/** A file in shared storage. */
export const isRemote = (ref) => typeof ref === 'string' && /^https?:\/\//.test(ref)

export const isUpload = (ref) => isLegacyUpload(ref) || isRemote(ref)

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i

/**
 * Whether a reference points at a video or an image: 'video', 'image', or null
 * when there is nothing set.
 *
 * A path or an uploaded URL can be judged from its extension straight away. A
 * legacy local file cannot, so its blob is fetched for the MIME type — which is
 * why this is a hook and not a plain function.
 */
export function useMediaKind(ref) {
  const guess = (r) => (!r ? null : isLegacyUpload(r) ? null : VIDEO_EXT.test(r) ? 'video' : 'image')
  const [kind, setKind] = useState(() => guess(ref))

  useEffect(() => {
    if (!ref) {
      setKind(null)
      return
    }
    if (!isLegacyUpload(ref)) {
      setKind(guess(ref))
      return
    }
    let alive = true
    getMedia(ref)
      .then((blob) => {
        if (alive && blob) setKind(blob.type.startsWith('video') ? 'video' : 'image')
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [ref])

  return kind
}

/**
 * Sends a File to shared storage and returns the URL to save on the record.
 *
 * The browser uploads straight to Blob rather than through the site's own API:
 * a serverless request body is capped at a few megabytes, which the studio's
 * clips pass without trying. The API is only asked for a short-lived ticket,
 * and it checks the admin session before issuing one.
 */
export async function putMedia(file, onProgress) {
  const token = adminToken()
  if (!token) throw new Error('Sign in again before uploading.')

  const safeName = (file.name || 'upload').replace(/[^\w.-]+/g, '-').slice(-80)
  const result = await upload(`media/${safeName}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    clientPayload: token,
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(percentage) : undefined,
  })
  return result.url
}

export async function getMedia(ref) {
  if (!isLegacyUpload(ref)) return null
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(ref.slice(PREFIX.length))
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

/**
 * Forgets a file.
 *
 * Only local ones are actually deleted. A shared upload is left in place: the
 * same URL may well be on another record, or in a version of the content
 * someone else is still looking at, and a dangling image is a worse outcome
 * than a file nobody references.
 */
export async function deleteMedia(ref) {
  if (!isLegacyUpload(ref)) return
  const db = await open()
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(ref.slice(PREFIX.length))
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
  })
}

/**
 * Turns a reference into something an <img>/<video> can use. Paths and uploaded
 * URLs pass straight through; a legacy local file becomes an object URL that is
 * revoked on unmount so the blob is not leaked.
 */
export function useMediaUrl(ref) {
  const [url, setUrl] = useState(() => (isLegacyUpload(ref) ? '' : ref || ''))

  useEffect(() => {
    if (!ref) {
      setUrl('')
      return
    }
    if (!isLegacyUpload(ref)) {
      setUrl(ref)
      return
    }

    let alive = true
    let objectUrl = null

    getMedia(ref)
      .then((blob) => {
        if (!alive || !blob) return
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      })
      .catch(() => {})

    return () => {
      alive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [ref])

  return url
}
