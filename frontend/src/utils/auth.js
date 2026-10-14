export const saveToken = (token, eventId) => {
  localStorage.setItem(`token_${eventId}`, token)
  // Tag this token with the current platform user's email so stale tokens
  // from a different account can be detected and cleared.
  const platformUser = localStorage.getItem('platform_user')
  const email = platformUser ? JSON.parse(platformUser).email : null
  if (email) localStorage.setItem(`token_owner_${eventId}`, email)
}

export const saveUserId = (id, eventId) =>
  localStorage.setItem(`user_id_${eventId}`, id)

export const saveEventId = (id) =>
  localStorage.setItem('current_event_id', id)

export const getStoredToken = (eventId) =>
  localStorage.getItem(`token_${eventId}`)

export const getStoredUserId = (eventId) =>
  localStorage.getItem(`user_id_${eventId}`)

export const getStoredEventId = () =>
  localStorage.getItem('current_event_id')

export const isRegisteredForEvent = (eventId) =>
  !!localStorage.getItem(`token_${eventId}`)

export const getMyEvents = () => {
  const events = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('token_') && !key.startsWith('token_owner_')) {
      events.push(key.replace('token_', ''))
    }
  }
  return events
}

export const removeEventFromStorage = (eventId) => {
  localStorage.removeItem(`token_${eventId}`)
  localStorage.removeItem(`token_owner_${eventId}`)
  localStorage.removeItem(`user_id_${eventId}`)
  if (localStorage.getItem('current_event_id') === eventId) {
    localStorage.removeItem('current_event_id')
  }
}

// Clear event token if it belongs to a different platform account.
export const clearStaleEventToken = (eventId) => {
  const token = localStorage.getItem(`token_${eventId}`)
  if (!token) return
  const owner = localStorage.getItem(`token_owner_${eventId}`)
  const platformUser = localStorage.getItem('platform_user')
  const currentEmail = platformUser ? JSON.parse(platformUser).email : null
  // Clear if: owner tag exists and doesn't match, OR no owner tag but a platform user is logged in (legacy token)
  if (currentEmail && (!owner || owner !== currentEmail)) {
    localStorage.removeItem(`token_${eventId}`)
    localStorage.removeItem(`token_owner_${eventId}`)
    localStorage.removeItem(`user_id_${eventId}`)
  }
}

export const clearAuth = (eventId) => {
  if (eventId) {
    localStorage.removeItem(`token_${eventId}`)
    localStorage.removeItem(`user_id_${eventId}`)
  }
  localStorage.removeItem('current_event_id')
}

export const isLoggedIn = () =>
  getMyEvents().length > 0