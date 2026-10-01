const KEY = 'adqube.admin.token'

/**
 * The admin's signed session, as handed out by /api/login.
 *
 * It lives in sessionStorage rather than localStorage so closing the tab ends
 * the session, and it is only ever a token — the password itself never reaches
 * the browser's storage, and no longer ships inside the bundle either.
 */
export function adminToken() {
  try {
    return sessionStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

export function setAdminToken(token) {
  try {
    if (token) sessionStorage.setItem(KEY, token)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* private mode — the session simply will not survive a reload */
  }
}

/** Exchanges a password for a token. Resolves false when it is wrong. */
export async function signIn(password) {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) return false
  const { token } = await res.json()
  if (!token) return false
  setAdminToken(token)
  return true
}
