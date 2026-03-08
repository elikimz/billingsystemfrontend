import { createContext, useContext, useState } from 'react'
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
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })

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
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
