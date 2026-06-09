import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const httpClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth headers or tracking
httpClient.interceptors.request.use(
  (config) => {
    // Add any request preprocessing here
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for centralized error handling
httpClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    const status = error.response?.status

    console.error(`API Error [${status}]:`, message)

    return Promise.reject({
      status,
      message,
      originalError: error,
    })
  }
)

export default httpClient
