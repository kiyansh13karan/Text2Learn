/**
 * Authentication Context Provider
 * Manages user authentication state and operations
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api, { getErrorMessage } from '../utils/api'
import { storage } from '../utils/storage'
import { User, AuthResponse, ApiResponse } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const token = storage.getToken()
      const savedUser = storage.getUser()
      
      if (token && savedUser) {
        setUser(savedUser)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        email,
        password,
      })

      const { token, user: userData } = response.data.data!
      storage.setToken(token)
      storage.setUser(userData)
      setUser(userData)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', {
        name,
        email,
        password,
      })

      const { token, user: userData } = response.data.data!
      storage.setToken(token)
      storage.setUser(userData)
      setUser(userData)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/google', {
        credential,
      })

      const { token, user: userData } = response.data.data!
      storage.setToken(token)
      storage.setUser(userData)
      setUser(userData)
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const logout = () => {
    storage.clearAuth()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
