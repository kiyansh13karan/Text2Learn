/**
 * API client for backend communication
 */

import axios, { AxiosError, AxiosInstance } from 'axios'
import { ApiResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Helper function to extract error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error as AxiosError<ApiResponse>
    
    // Try to get detailed error from response
    if (apiError.response?.data?.message) {
      const baseMessage = apiError.response.data.message
      // @ts-ignore - error field might exist
      const errorDetail = apiError.response.data?.error
      // @ts-ignore - details field might exist
      const details = apiError.response.data?.details
      
      // If there are details (like database schema errors), show them
      if (details && details.fix) {
        return `${baseMessage}\n\nSolution: ${details.fix}`
      }
      
      if (errorDetail && errorDetail !== baseMessage) {
        return `${baseMessage}\n${errorDetail}`
      }
      return baseMessage
    }
    
    if (apiError.response?.data?.errors && apiError.response.data.errors.length > 0) {
      return apiError.response.data.errors[0].msg
    }
    
    // Network or server errors
    if (apiError.code === 'ERR_NETWORK') {
      return 'Network error: Unable to connect to server. Please check if the backend is running.'
    }
    
    return apiError.message || 'An unexpected error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export default api
