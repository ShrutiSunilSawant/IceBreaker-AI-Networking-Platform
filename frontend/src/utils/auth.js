export const saveToken = (token, eventId) =>
  localStorage.setItem(`token_${eventId}`, token)

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
    if (key && key.startsWith('token_')) {
      events.push(key.replace('token_', ''))
    }
  }
  return events
}

export const removeEventFromStorage = (eventId) => {
  localStorage.removeItem(`token_${eventId}`)
  localStorage.removeItem(`user_id_${eventId}`)
  if (localStorage.getItem('current_event_id') === eventId) {
    localStorage.removeItem('current_event_id')
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