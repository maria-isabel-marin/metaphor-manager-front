import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,  // http://localhost:3000/api
  withCredentials: true,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers!['Authorization'] = `Bearer ${token}`
  return config
})

console.log('API baseURL:', api.defaults.baseURL)

export default api
