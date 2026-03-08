import axios from 'axios'

// In development, VITE_API_URL is /api/v1 (proxied via Vite to localhost:8000)
// In production (Vercel), VITE_API_URL is the full backend URL from .env.production
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 Unauthorized — clear session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Only redirect if we're in an admin route to avoid infinite loops
      if (window.location.pathname.startsWith('/admin') &&
          window.location.pathname !== '/admin/login') {
        localStorage.removeItem('token')
        localStorage.removeItem('admin')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
