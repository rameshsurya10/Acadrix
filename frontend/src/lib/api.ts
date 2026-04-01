import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from storage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('acadrix_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401, clear token and redirect to login
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('acadrix_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
