import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/shared/authService'

export type UserRole = 'super_admin' | 'admin' | 'finance' | 'principal' | 'teacher' | 'student'

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
  login: (identifier: string, password: string) => Promise<void>
  loginWithToken: (access: string, refresh: string, user: AuthUser) => void
  googleLogin: (code: string) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'acadrix_token'
const REFRESH_KEY = 'acadrix_refresh'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) { setIsLoading(false); return }

    setToken(stored)
    authService.getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(identifier: string, password: string) {
    const { access, refresh, user: userData } = await authService.login(identifier, password)
    loginWithToken(access, refresh, userData)
  }

  function loginWithToken(access: string, refresh: string, userData: AuthUser) {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    setToken(access)
    setUser(userData)
  }

  async function googleLogin(code: string) {
    const { access, refresh, user: userData } = await authService.googleCallback(code)
    loginWithToken(access, refresh, userData)
  }

  function logout() {
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (refresh) {
      authService.logout(refresh).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, loginWithToken, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
