/**
 * LocalStorage utility functions
 */

import { User } from '../types'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const storage = {
  // Token management
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY)
  },

  // User management
  getUser: (): User | null => {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY)
  },

  // Clear all auth data
  clearAuth: (): void => {
    storage.removeToken()
    storage.removeUser()
  },
}
