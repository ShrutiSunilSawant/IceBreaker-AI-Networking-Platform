import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const eventId = localStorage.getItem('current_event_id')
  const token = eventId ? localStorage.getItem(`token_${eventId}`) : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getToken = (email, eventId) =>
  api.post('/auth/token', { email, event_id: eventId })

export const submitProfile = (data) =>
  api.post('/profiles/', data)

export const findMatch = (userId, eventId) =>
  api.post('/matches/', { user_id: userId, event_id: eventId })

export const submitFeedback = (matchId, userId, rating) =>
  api.post('/feedback/', { match_id: matchId, user_id: userId, rating })

export const deactivateProfile = (userId, eventId) =>
  api.patch(`/profiles/${userId}/deactivate?event_id=${eventId}`)

export const unregisterFromEvent = (userId, eventId) => {
  const token = localStorage.getItem(`token_${eventId}`)
  return api.delete(`/profiles/${userId}?event_id=${eventId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

export const listEvents = () =>
  api.get('/events/')

export const getEvent = (eventId) =>
  api.get(`/events/${eventId}`)

export const createEvent = (data) =>
  api.post('/events/', data)

export const deleteEvent = (eventId) =>
  api.delete(`/events/${eventId}`)

export const getEventStats = (eventId) =>
  api.get(`/events/${eventId}/stats`)

export const endEvent = (eventId, token) =>
  api.post(`/events/${eventId}/end?organizer_token=${token}`)

export const cancelEvent = (eventId, token) =>
  api.delete(`/events/${eventId}?organizer_token=${token}`)

export default api