import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/client'

interface AdminUser {
  user_id: string
  full_name: string
  role: string
  access_token: string
}

interface AuthContextType {
  admin: AdminUser | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('admin')
      const token = localStorage.getItem('token')
      if (stored && token) {
        const parsed = JSON.parse(stored)
        // Basic validation — ensure required fields exist
        if (parsed.user_id && parsed.full_name) {
          setAdmin(parsed)
        } else {
          localStorage.removeItem('admin')
          localStorage.removeItem('token')
        }
      }
    } catch {
      // Corrupted storage — clear it
      localStorage.removeItem('admin')
      localStorage.removeItem('token')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/admin/login', { email, password })
    const data = res.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('admin', JSON.stringify(data))
    setAdmin(data)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }

  return (
    <AuthContext.Provider value={{
      admin,
      login,
      logout,
      isAuthenticated: !!admin,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
