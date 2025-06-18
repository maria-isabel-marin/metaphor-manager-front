// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
})

// for auth calls, bypass /api
// This is a separate client that points at your un-prefixed auth routes
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  console.log('[API Request]', config.method, config.url)
  return config
})

api.interceptors.response.use(res => {
  console.log('[API Response]', res.config.url, 'status:', res.status)
  return res
})

export default api