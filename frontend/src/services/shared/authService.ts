import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login/', { email, password })
    return data
  },

  async getMe(token: string): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/auth/me/', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },

  async logout(refresh: string): Promise<void> {
    await api.post('/auth/logout/', { refresh })
  },
}
