import api from '@/lib/api'
import type { AuthUser } from '@/contexts/AuthContext'

interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
  is_parent_session?: boolean
}

interface IdentifyResponse {
  success: true
  data: {
    method: 'otp' | 'password' | 'set_password'
    hint?: string
    role: string
    name: string
  }
}

export interface ParentChild {
  student_user_id: number
  student_id: string
  name: string
  section: string | null
}

interface ParentRequestOTPResponse {
  success: true
  data: {
    method: 'otp'
    masked_phone: string
    child_count: number
  }
}

export type ParentVerifyResponse =
  | (LoginResponse & { is_parent_session: true; requires_child_selection?: false })
  | { success: true; requires_child_selection: true; children: ParentChild[] }

export const authService = {
  async identify(identifier: string): Promise<IdentifyResponse['data']> {
    const { data } = await api.post<IdentifyResponse>('/auth/identify/', { identifier })
    return data.data
  },

  async login(identifier: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login/', { identifier, password })
    return data
  },

  async verifyOTP(email: string, otp: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/verify-otp/', { email, otp })
    return data
  },

  async setPassword(identifier: string, password: string, confirmPassword: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/set-password/', {
      identifier, password, confirm_password: confirmPassword,
    })
    return data
  },

  async forgotPassword(email: string): Promise<{ hint: string }> {
    const { data } = await api.post<{ success: true; data: { hint: string } }>('/auth/forgot-password/', { email })
    return data.data
  },

  async resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/reset-password/', {
      email, otp, new_password: newPassword, confirm_password: confirmPassword,
    })
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

  async getGoogleAuthURL(): Promise<string> {
    const { data } = await api.get<{ url: string }>('/auth/google/url/')
    return data.url
  },

  async googleCallback(code: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/google/callback/', { code })
    return data
  },

  async getTourProgress(): Promise<string[]> {
    const { data } = await api.get<{ success: true; data: string[] }>('/auth/tour-progress/')
    return data.data
  },

  async completeTour(tourKey: string): Promise<void> {
    await api.post('/auth/tour-progress/', { tour_key: tourKey })
  },

  async parentRequestOTP(phone: string): Promise<ParentRequestOTPResponse['data']> {
    const { data } = await api.post<ParentRequestOTPResponse>('/auth/parent/request-otp/', { phone })
    return data.data
  },

  async parentVerifyOTP(phone: string, otp: string, childId?: number): Promise<ParentVerifyResponse> {
    const payload: { phone: string; otp: string; child_id?: number } = { phone, otp }
    if (childId) payload.child_id = childId
    const { data } = await api.post<ParentVerifyResponse>('/auth/parent/verify-otp/', payload)
    return data
  },
}
