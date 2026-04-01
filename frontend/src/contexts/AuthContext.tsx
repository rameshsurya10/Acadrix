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
  mockLogin: (role: UserRole) => void
  logout: () => void
}

const MOCK_USERS: Record<UserRole, AuthUser> = {
  admin:     { id: 1, email: 'admin@acadrix.dev',     role: 'admin',     full_name: 'Dev Admin' },
  principal: { id: 2, email: 'principal@acadrix.dev', role: 'principal', full_name: 'Dev Principal' },
  teacher:   { id: 3, email: 'teacher@acadrix.dev',   role: 'teacher',   full_name: 'Dev Teacher' },
  student:   { id: 4, email: 'student@acadrix.dev',   role: 'student',   full_name: 'Dev Student' },
  parent:    { id: 5, email: 'parent@acadrix.dev',    role: 'parent',    full_name: 'Dev Parent' },
}

const STORAGE_KEY = 'acadrix_token'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) { setIsLoading(false); return }

    // Restore mock session without hitting the API
    if (stored.startsWith('mock_')) {
      const role = stored.replace('mock_', '').replace('_token', '') as UserRole
      if (MOCK_USERS[role]) {
        setToken(stored)
        setUser(MOCK_USERS[role])
      }
      setIsLoading(false)
      return
    }

    setToken(stored)
    authService.getMe(stored)
      .then(setUser)
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setIsLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { access, user: userData } = await authService.login(email, password)
    localStorage.setItem(STORAGE_KEY, access)
    setToken(access)
    setUser(userData)
  }

  function mockLogin(role: UserRole) {
    const fakeToken = `mock_${role}_token`
    localStorage.setItem(STORAGE_KEY, fakeToken)
    setToken(fakeToken)
    setUser(MOCK_USERS[role])
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
