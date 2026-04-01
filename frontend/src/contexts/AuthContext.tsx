import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/shared/authService'

export type UserRole = 'admin' | 'principal' | 'teacher' | 'student' | 'parent'

export interface AuthUser {
  id: number
  email: string
  role: UserRole
  full_name: string
  avatar_url?: string
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('sm_token')
    if (stored) {
      setToken(stored)
      authService.getMe(stored)
        .then(setUser)
        .catch(() => localStorage.removeItem('sm_token'))
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  async function login(email: string, password: string) {
    const { access, user: userData } = await authService.login(email, password)
    localStorage.setItem('sm_token', access)
    setToken(access)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('sm_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
