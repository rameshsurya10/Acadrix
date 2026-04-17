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
  isParentSession: boolean
  login: (identifier: string, password: string) => Promise<void>
  loginWithToken: (access: string, refresh: string, user: AuthUser, isParent?: boolean) => void
  googleLogin: (code: string) => Promise<void>
  logout: () => void
}

const TOKEN_KEY = 'acadrix_token'
const REFRESH_KEY = 'acadrix_refresh'
const PARENT_SESSION_KEY = 'acadrix_parent_session'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isParentSession, setIsParentSession] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) { setIsLoading(false); return }

    setToken(stored)
    setIsParentSession(localStorage.getItem(PARENT_SESSION_KEY) === '1')
    authService.getMe(stored)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(REFRESH_KEY)
        localStorage.removeItem(PARENT_SESSION_KEY)
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function login(identifier: string, password: string) {
    const { access, refresh, user: userData } = await authService.login(identifier, password)
    loginWithToken(access, refresh, userData, false)
  }

  function loginWithToken(access: string, refresh: string, userData: AuthUser, isParent = false) {
    localStorage.setItem(TOKEN_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
    if (isParent) {
      localStorage.setItem(PARENT_SESSION_KEY, '1')
    } else {
      localStorage.removeItem(PARENT_SESSION_KEY)
    }
    setToken(access)
    setUser(userData)
    setIsParentSession(isParent)
  }

  async function googleLogin(code: string) {
    const { access, refresh, user: userData } = await authService.googleCallback(code)
    loginWithToken(access, refresh, userData, false)
  }

  function logout() {
    const refresh = localStorage.getItem(REFRESH_KEY)
    if (refresh) {
      authService.logout(refresh).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(PARENT_SESSION_KEY)
    setToken(null)
    setUser(null)
    setIsParentSession(false)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isParentSession, login, loginWithToken, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
